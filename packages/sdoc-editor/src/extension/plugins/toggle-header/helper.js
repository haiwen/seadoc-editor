import { Editor, Element, Node, Path, Transforms } from '@seafile/slate';
import slugid from 'slugid';
import { INSERT_POSITION, PARAGRAPH, TOGGLE_CONTENT, TOGGLE_HEADER, TOGGLE_TITLE_TYPES } from '../../constants';
import { focusEditor } from '../../core';

export const getLevelFromType = (eleType) => {
  if (!eleType) return '';
  const matched = String(eleType).match(/toggle_header(\d)$/);
  return matched ? matched[1] : '';
};

export const getLevel = (element) => {
  const rawLevel = Number(element.level || getLevelFromType(element.type));
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
  const level = Number(getLevelFromType(type));

  const toggleHeader = {
    id: slugid.nice(),
    type: TOGGLE_HEADER,
    level,
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
