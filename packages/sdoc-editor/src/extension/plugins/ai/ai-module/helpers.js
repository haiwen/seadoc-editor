import React from 'react';
import { Path, Text, Transforms } from '@seafile/slate';
import { ORDERED_LIST, PARAGRAPH, UNORDERED_LIST } from '../../../constants';
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

/**
 * Determine whether unordered_list or ordered_list meets the criteria (each list_item's paragraph has a text field)
 * @param {Object} list - Nodes to be judged
 * @returns {boolean}
 */
const isValidUnorderedList = (list) => {
  if (![UNORDERED_LIST, ORDERED_LIST].includes(list.type)) return false;

  return list.children.every(item => {
    if (item.type !== 'list_item') return false;

    const paragraph = item.children.find(child => child.type === 'paragraph');
    if (!paragraph) return false;

    const textNode = paragraph.children.find(child => 'text' in child);
    return textNode !== undefined;
  });
};


/**
 * Traverse the node tree and find all unordered_list or ordered_list that meet the criteria
 * @param {Object}
 * @returns {Array}
 */
export const findValidLists = (node) => {
  const result = [];
  const traverse = (currentNode) => {
    if (!currentNode) return;
    // Check if the current node meets the criteria
    if ([UNORDERED_LIST, ORDERED_LIST].includes(currentNode.type) && isValidUnorderedList(currentNode)) {
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
        const insertSlateElement = findValidLists(childNode);
        Transforms.insertNodes(editor, insertSlateElement, { at: nextPath });
      } else {
        Transforms.insertNodes(editor, childNode, { at: nextPath });
      }
      nextPath = Path.next(nextPath);
    }
  });
};
