import { Editor, Transforms, Element, Node } from '@seafile/slate';
import { ELEMENT_TYPE, HEADER, PARAGRAPH, SUBTITLE, TITLE } from '../../constants';
import { getNodeType } from '../../core';

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

export const isNextChildIsImage = (editor, headerNode) => {
  const selection = editor.selection;
  const children = headerNode.children;
  if (children.length === 1) return false;
  const { anchor: { path, offset } } = selection;
  const [nodeIndex] = path.slice(-1);
  if (nodeIndex + 1 > children.length) return false;
  const beforeText = children[nodeIndex].text ? children[nodeIndex].text : '';
  if (beforeText.length === 0) return false;
  if (beforeText.length !== offset) return false;

  const nextNode = children[nodeIndex + 1];

  if (nextNode.type === 'image' && Node.string(headerNode).length === offset) return true;

  return false;
};
