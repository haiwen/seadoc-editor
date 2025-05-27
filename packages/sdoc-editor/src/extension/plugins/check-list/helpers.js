import { Transforms, Editor, Element, Node } from '@seafile/slate';
import { CHECK_LIST_ITEM, PARAGRAPH, ELEMENT_TYPE, INSERT_POSITION, ORDERED_LIST, UNORDERED_LIST, HEADER, TITLE, SUBTITLE } from '../../constants';
import { getSelectedNodeByType, generateEmptyElement, isMultiLevelList, isRangeAcrossBlocks, getNodeType, focusEditor, getCurrentNode } from '../../core';

export const isMenuDisabled = (editor, readonly) => {
  if (readonly) return true;
  if (editor.selection == null) return true;

  let selectedElements = [];
  const nodeEntries = Editor.nodes(editor, { universal: true });
  for (let nodeEntry of nodeEntries) {
    const [node] = nodeEntry;
    if (Element.isElement(node)) selectedElements.push(node);
  }

  const notMatch = selectedElements.some(element => {
    if (Editor.isVoid(editor, element) && Editor.isBlock(editor, element)) return true;

    const { type } = element;
    if (type === ELEMENT_TYPE.CODE_LINE) return true;
    if (type === ELEMENT_TYPE.CODE_BLOCK) return true;
    if ([ORDERED_LIST, UNORDERED_LIST].includes(type) && isMultiLevelList(element)) return true;
    if (type === ELEMENT_TYPE.TABLE) return true;
    if (type === ELEMENT_TYPE.TABLE_ROW) return true;
    if (type === ELEMENT_TYPE.TABLE_CELL) return true;
    return false;
  });

  if (notMatch) return true;

  return false;
};

export const getCheckListItemType = (editor) => {
  const node = getSelectedNodeByType(editor, CHECK_LIST_ITEM);

  if (!node) return PARAGRAPH;
  return node.type;
};

export const convertToCheck = (editor, listNode, listPath) => {
  const checkList = [];
  const { children } = listNode || {};
  children.forEach((item) => {
    const text = Node.string(item);
    const checkNode = generateEmptyElement(CHECK_LIST_ITEM, {}, text);
    checkList.push(checkNode);
  });
  Transforms.removeNodes(editor, { at: [listPath[0]] });
  Transforms.insertNodes(editor, checkList, { at: [listPath[0]] });
  Transforms.select(editor, { path: [listPath[0], 0], offset: 0 });
};

export const setCheckListItemType = (editor, newType, insertPosition) => {
  if (insertPosition === INSERT_POSITION.AFTER) {
    const p = generateEmptyElement(PARAGRAPH);
    const path = Editor.path(editor, editor.selection);
    Transforms.insertNodes(editor, p, { at: [path[0] + 1] });
    Transforms.select(editor, [path[0] + 1]);
  }

  if (!isRangeAcrossBlocks(editor)) {
    const path = Editor.path(editor, editor.selection);
    const [currentNode,] = getCurrentNode(editor);
    if (path) {
      const [targetNode, targetPath] = Editor.node(editor, [path[0]]);
      if (targetNode && [ORDERED_LIST, UNORDERED_LIST].includes(targetNode?.type)) {
        convertToCheck(editor, targetNode, targetPath);
        if (newType === CHECK_LIST_ITEM && !Node.string(currentNode)) {
          focusEditor(editor);
        }
        return;
      }
    }
    Transforms.setNodes(editor, { type: newType });
    // When currentNode is empty
    if (newType === CHECK_LIST_ITEM && !Node.string(currentNode)) {
      focusEditor(editor, path);
    }
  } else {
    const nodes = Editor.nodes(editor, {
      match: n => {
        const type = getNodeType(n);
        if (!type) return;
        if (type === PARAGRAPH) return true;
        if (type === CHECK_LIST_ITEM) return true;
        if (type.startsWith(HEADER)) return true;
        if (type === TITLE) return true;
        if (type === SUBTITLE) return true;

        return false;
      },
      universal: false,
      mode: 'highest', // Match top level
    });
    const nodesEntry = Array.from(nodes);
    if (nodesEntry.length === 0) return;
    nodesEntry.forEach((nodeEntry) => {
      Transforms.setNodes(editor, { type: newType }, { at: nodeEntry[1] });
    });
  }
};
