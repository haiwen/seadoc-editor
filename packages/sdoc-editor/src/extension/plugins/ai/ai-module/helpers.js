import React from 'react';
import { Editor, Element, Path, Range, Text, Transforms } from '@seafile/slate';
import { ORDERED_LIST, PARAGRAPH, UNORDERED_LIST, LIST_ITEM, BLOCKQUOTE } from '../../../constants';
import { generateEmptyElement } from '../../../core';

export const removeMarks = (editor) => {
  const { selection } = editor;

  Transforms.unsetNodes(editor, 'sdoc_ai', {
    at: [],
    match: n => Text.isText(n) && n.sdoc_ai === true
  });

  Transforms.unsetNodes(editor, 'comment', {
    at: [],
    match: n => Text.isText(n) && n.comment === true
  });

  if (selection) {
    Transforms.select(editor, selection);
  } else {
    Transforms.deselect(editor);
  }
};

export const markdownTableRenderer = (searchResult) => {
  if (!searchResult) return '';
  return <div className='md-rendered-html' dangerouslySetInnerHTML={{ __html: searchResult }} />;
};

export const isRangeOverlapping = (rangeA, rangeB) => {
  const aStart = Range.start(rangeA);
  const aEnd = Range.end(rangeA);
  const bStart = Range.start(rangeB);
  const bEnd = Range.end(rangeB);

  // The starting or ending point of A is within the range of B
  const aStartInB =
    (Path.isBefore(bStart.path, aStart.path) || Path.equals(bStart.path, aStart.path)) &&
    (Path.isBefore(aStart.path, bEnd.path) || Path.equals(aStart.path, bEnd.path));

  const aEndInB =
    (Path.isBefore(bStart.path, aEnd.path) || Path.equals(bStart.path, aEnd.path)) &&
    (Path.isBefore(aEnd.path, bEnd.path) || Path.equals(aEnd.path, bEnd.path));

  // B is included by A
  const bWithinA =
    (Path.isBefore(aStart.path, bStart.path) || Path.equals(aStart.path, bStart.path)) &&
    (Path.isBefore(bEnd.path, aEnd.path) || Path.equals(bEnd.path, aEnd.path));

  return aStartInB || aEndInB || bWithinA;
};

export const validateNestedStructure = (nodes) => {

  const validateNode = (node) => {
    if (!Array.isArray(node.children) || node.children.length !== 1) {
      return false;
    }
    return validateNestedStructure(node.children);
  };

  for (const node of nodes) {
    if (!node.type) continue;
    if ([UNORDERED_LIST, ORDERED_LIST, BLOCKQUOTE, LIST_ITEM].includes(node.type)) {
      if (!validateNode(node)) {
        return false;
      }
    }
  }

  return true;
};

export const getSelectedChildren = (editor, parentNode, parentPath) => {
  const { selection } = editor;
  const selectedItems = [];

  parentNode.children.forEach((childNode, index) => {
    const childPath = [...parentPath, index];
    const childRange = {
      anchor: Editor.start(editor, childPath),
      focus: Editor.end(editor, childPath),
    };

    // Determine whether a child node has been selected
    if (isRangeOverlapping(selection, childRange)) {
      // If it is a list node, recursively process its nested sub lists
      let newChildNode = { ...childNode };
      if (childNode.type === LIST_ITEM || childNode.type === ORDERED_LIST || childNode.type === UNORDERED_LIST) {
        const nestedSelectedItems = getSelectedChildren(editor, childNode, childPath);
        // If there are selected items in the nested list, keep the current list structure
        // Keep only selected nested sub items
        if (nestedSelectedItems.length > 0) {
          selectedItems.push({
            ...newChildNode,
            children: nestedSelectedItems
          });
        }
      } else {
        // non list nodes
        if (childNode.children) {
          const nestedSelectedItems = getSelectedChildren(editor, childNode, childPath);
          if (nestedSelectedItems.length > 0) {
            selectedItems.push({
              ...newChildNode,
              children: nestedSelectedItems
            });
          }
          return;
        }
        // Add non children nodes directly
        selectedItems.push(childNode);
      }
    }
  });
  return selectedItems;
};

export const handleSelectElements = (editor) => {
  const { selection } = editor;
  const selectedElements = [];
  const blockNodes = Editor.nodes(editor, {
    at: selection,
    match: (n) => Element.isElement(n) && Editor.isBlock(editor, n),
    mode: 'highest'
  });

  for (const [node, path] of blockNodes) {
    const selectedItems = getSelectedChildren(editor, node, path);
    // Keep only selected items
    if (selectedItems.length > 0) {
      selectedElements.push([
        {
          ...node,
          children: selectedItems
        },
        path
      ]);
    }
  }

  selectedElements[0].forEach((childNode, index) => {
    if (childNode.type === UNORDERED_LIST || childNode.type === ORDERED_LIST) {
      selectedElements[0][index] = findValidLists(childNode)[0];
    }
  });

  return selectedElements;
};

const hasValidListItem = (list) => {
  if (![UNORDERED_LIST, ORDERED_LIST].includes(list.type)) return false;

  return list.children.some(item => {
    if (item.type !== LIST_ITEM) return false;

    const paragraph = item.children.find(child => child.type === PARAGRAPH);
    if (!paragraph) return false;

    const textNode = paragraph.children.find(child => 'text' in child);
    return textNode !== undefined;
  });
};

const isListCompletelyValid = (list) => {
  if (![UNORDERED_LIST, ORDERED_LIST].includes(list.type)) return false;

  return list.children.every(item => {
    if (item.type !== LIST_ITEM) return false;

    const paragraph = item.children.find(child => child.type === PARAGRAPH);
    if (!paragraph) return false;

    const textNode = paragraph.children.find(child => 'text' in child);
    return textNode !== undefined;
  });
};

export const findValidLists = (node) => {
  const result = [];
  const traverse = (currentNode) => {
    if (!currentNode) return;
    // Check if the current node meets the criteria
    if ([UNORDERED_LIST, ORDERED_LIST].includes(currentNode.type) && hasValidListItem(currentNode)) {
      result.push(currentNode);
      return;
    }
    // Recursive traversal of child nodes
    if (currentNode.children && Array.isArray(currentNode.children)) {
      currentNode.children.forEach(traverse);
    }
  };

  traverse(node);

  return result;
};

export const findInsertableLists = (node) => {
  const result = [];

  if ([UNORDERED_LIST, ORDERED_LIST].includes(node.type) && isListCompletelyValid(node)) {
    result.push(node);
    return result;
  }

  const isValidListItem = (item) => {
    if (item.type !== LIST_ITEM) return false;
    const paragraph = item.children.find(child => child.type === PARAGRAPH);
    if (!paragraph) return false;
    const textNode = paragraph.children.find(child => 'text' in child);
    return !!textNode; // 文本节点存在则有效
  };

  const traverse = (currentNode) => {
    if (!currentNode) return;

    if ([UNORDERED_LIST, ORDERED_LIST].includes(currentNode.type)) {
      const validChildren = currentNode.children.filter(isValidListItem);
      if (validChildren.length > 0) {
        const newList = {
          ...currentNode,
          children: validChildren,
        };
        result.push(newList);
      }
    }
    if (currentNode.children && Array.isArray(currentNode.children)) {
      currentNode.children.forEach(traverse);
    }
  };

  traverse(node);

  return result;
};

export const insertHtmlTransferredNodes = (slateNodeList, nextPath, editor) => {
  slateNodeList.forEach((childNode) => {
    // Insert paragraph nodes
    if (childNode.type === PARAGRAPH) {
      if (childNode.children.length > 1) {
        childNode.children.forEach((textNode, index) => {
          if (!textNode.text.trim()) return;
          const p = generateEmptyElement(PARAGRAPH);
          p.children.push(textNode);
          Transforms.insertNodes(editor, p, { at: nextPath });
          nextPath = Path.next(nextPath);
        });
      } else {
        Transforms.insertNodes(editor, childNode, { at: nextPath });
        nextPath = Path.next(nextPath);
      }
    }

    // Insert non-paragraph nodes
    if (childNode.type !== PARAGRAPH) {
      // unordered_list or ordered_list
      if (childNode.type === UNORDERED_LIST || childNode.type === ORDERED_LIST) {
        const insertSlateElement = findInsertableLists(childNode);
        Transforms.insertNodes(editor, insertSlateElement, { at: nextPath });
      } else {
        Transforms.insertNodes(editor, childNode, { at: nextPath });
      }
      nextPath = Path.next(nextPath);
    }
  });
};
