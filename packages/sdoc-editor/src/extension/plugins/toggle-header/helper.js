import { Editor, Element, Node, Path, Text, Transforms } from '@seafile/slate';
import slugid from 'slugid';
import { INSERT_POSITION, PARAGRAPH, TOGGLE_CONTENT, TOGGLE_HEADER, TOGGLE_TITLE_TYPES } from '../../constants';
import { focusEditor, generateEmptyElement } from '../../core';

export const getLevelFromType = (eleType) => {
  if (!eleType) return '';
  const matched = String(eleType).match(/toggle_header(\d)$/);
  return matched ? matched[1] : '';
};

export const getLevel = (element) => {
  const rawLevel = Number(getLevelFromType(element.type));
  return Math.min(6, Math.max(1, rawLevel));
};

export const getTitleTypeByLevel = (level) => {
  const safeLevel = Math.min(6, Math.max(1, Number(level)));
  return TOGGLE_TITLE_TYPES[safeLevel - 1];
};

export const insertToggleHeader = (editor, type, insertPosition) => {
  if (!editor.selection) return;
  if (typeof editor.canInsertToggleHeader === 'function' && !editor.canInsertToggleHeader()) {
    return;
  }

  const toggleHeader = {
    id: slugid.nice(),
    type: TOGGLE_HEADER,
    collapsed: false,
    children: [
      { id: slugid.nice(), type: type, children: [{ text: '', id: slugid.nice() }] },
      { id: slugid.nice(), type: TOGGLE_CONTENT,
        children: [{ id: slugid.nice(), type: PARAGRAPH, children: [{ text: '', id: slugid.nice() }] }]
      },
    ]
  };

  const [, currentBlockPath] = Editor.above(editor, {
    at: editor.selection,
    match: n => Element.isElement(n) && Editor.isBlock(editor, n),
    mode: 'lowest',
  });
  if (!currentBlockPath) return;

  const toggleContentEntry = Editor.above(editor, {
    at: editor.selection,
    match: n => Element.isElement(n) && n.type === TOGGLE_CONTENT,
    mode: 'lowest',
  });

  // Support inserting toggle header inside toggle content
  if (toggleContentEntry) {
    const insertAt = Path.next(currentBlockPath);
    Transforms.insertNodes(editor, toggleHeader, { at: insertAt });
    const point = Editor.start(editor, [...insertAt, 0, 0]);
    Transforms.select(editor, point);
    focusEditor(editor, point);
    return;
  }

  const topLevelEntry = Editor.above(editor, {
    at: editor.selection,
    match: (n, p) => Element.isElement(n) && Editor.isBlock(editor, n) && p.length === 1,
  });
  if (!topLevelEntry) return;
  const [topNode, topPath] = topLevelEntry;
  const isEmptyParagraph = topNode.type === PARAGRAPH && Node.string(topNode) === '';

  if (insertPosition === INSERT_POSITION.CURRENT && isEmptyParagraph) {
    Transforms.removeNodes(editor, { at: topPath });
    Transforms.insertNodes(editor, toggleHeader, { at: topPath });
    const point = Editor.start(editor, [...topPath, 0, 0]);
    Transforms.select(editor, point);
    focusEditor(editor, point);
    return;
  }

  const insertAt = Path.next(topPath);
  Transforms.insertNodes(editor, toggleHeader, { at: insertAt });
  const point = Editor.start(editor, [...insertAt, 0, 0]);
  Transforms.select(editor, point);
  focusEditor(editor, point);
};

export const ensureToggleContentNotEmpty = (editor, path) => {
  const node = Node.get(editor, path);
  if (
    node &&
    node.type === TOGGLE_CONTENT &&
    (!node.children || node.children.length === 0)
  ) {
    const paragraph = generateEmptyElement(PARAGRAPH);
    Transforms.insertNodes(editor, paragraph, { at: path.concat(0) });
  }
};

export const isOnlyHasToggleContent = (node) => {
  if (!node || node.type !== TOGGLE_HEADER) return false;

  let hasTitle = false;
  let hasContent = false;

  node.children?.forEach((child) => {

    if (TOGGLE_TITLE_TYPES.includes(child.type)) {
      hasTitle = true;
    }

    if (child.type === TOGGLE_CONTENT) {
      hasContent = true;
    }
  });

  return !hasTitle && hasContent;
};

export const getFirstTextPoint = (editor, targetBlockPath, offset = 0) => {
  for (const [node, path] of Editor.nodes(editor, {
    at: targetBlockPath,
    match: n => Text.isText(n),
  })) {
    const safeOffset = Math.min(offset, node.text.length);
    return { path, offset: safeOffset };
  }
  return null;
};

export const findFirstTitleNode = (nodes) => {
  if (!Array.isArray(nodes)) return null;

  for (const node of nodes[0].children) {
    if (Element.isElement(node) && TOGGLE_TITLE_TYPES.includes(node.type)) {
      return node;
    }

    if (node.children) {
      const inlineNodes = findFirstTitleNode(node.children);
      if (inlineNodes) return inlineNodes;
    }
  }

  return null;
};
