import { Editor, Transforms, Element, Node, Path } from '@seafile/slate';
import { ELEMENT_TYPE, HEADER, HEADERS, PARAGRAPH, SUBTITLE, TITLE, TOGGLE_HEADER } from '../../constants';
import { findPath, getNodeType } from '../../core';

export const isMenuDisabled = (editor, readonly = false) => {
  if (readonly) return true;
  if (!editor.selection) return true;

  const [match] = Editor.nodes(editor, {
    match: n => {
      let type = getNodeType(n);
      if (!type) return false;
      if (type === ELEMENT_TYPE.PARAGRAPH) return true;
      if (type.startsWith(HEADER)) return true;
      if (type === TITLE) return true;
      if (type === SUBTITLE) return true;

      return false;
    },
    universal: true,
    mode: 'highest'
  });
  return !match;
};

export const getHeaderType = (editor) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => {
      const nodeType = getNodeType(n);
      if (!nodeType) return false;
      if (nodeType.includes(HEADER)) return true;
      if (nodeType === TITLE) return true;
      if (nodeType === SUBTITLE) return true;
      return false;
    },
    universal: true,
  });

  if (!match) return PARAGRAPH;
  const [n] = match;

  if (n.type === TOGGLE_HEADER) return PARAGRAPH;

  return getNodeType(n);
};

export const isSelectionInHeader = (editor) => {
  const [match] = Editor.nodes(editor, {
    match: n => {
      if (!Element.isElement(n)) return false;
      if (!n.type) return false;
      if (n.type.startsWith(HEADER)) return true;
      if (n.type === TITLE) return true;
      if (n.type === SUBTITLE) return true;
      return false;
    }, // Matches nodes whose node.type starts with header
    universal: true,
  });
  return match;
};

export const setHeaderType = (editor, type) => {
  if (!type) return;

  Transforms.setNodes(editor, { type });
};

export const getHeaderLevel = (type) => {
  if (!HEADERS.includes(type)) return null;
  return Number(type.replace(HEADER, ''));
};

const getSectionEndIndex = (siblings, startIndex, level) => {
  let endIndex = siblings.length;

  for (let index = startIndex + 1; index < siblings.length; index++) {
    const siblingLevel = getHeaderLevel(siblings[index]?.type);
    if (siblingLevel !== null && siblingLevel <= level) {
      endIndex = index;
      break;
    }
  }

  return endIndex;
};

export const isElementHiddenByCollapsedHeader = (editor, element) => {
  const path = findPath(editor, element);
  if (!path || path.length !== 1) return false;

  const currentIndex = path[path.length - 1];
  const parentPath = Path.parent(path);
  const siblings = parentPath.length === 0 ? editor.children : Node.get(editor, parentPath).children;

  for (let index = currentIndex - 1; index >= 0; index--) {
    const sibling = siblings[index];
    if (!Element.isElement(sibling) || !sibling.collapsed) continue;

    const siblingLevel = getHeaderLevel(sibling.type);
    if (siblingLevel === null) continue;

    const endIndex = getSectionEndIndex(siblings, index, siblingLevel);
    if (currentIndex < endIndex) {
      return true;
    }
  }

  return false;
};

export const isHasImage = (node) => {
  return node.children.some(item => {
    if (item.type === 'image') return true;
    return false;
  });
};
