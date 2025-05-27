import { Editor, Node, Transforms, Range, Point } from '@seafile/slate';
import { ReactEditor } from '@seafile/slate-react';
import { QUICK_INSERT } from '../../constants';
import { generateEmptyElement } from '../../core';

export const getQuickInsertEntity = (editor) => {
  const [quickInsertEntity] = Editor.nodes(editor, {
    match: n => n.type === QUICK_INSERT,
  });
  return quickInsertEntity;
};

export const genQuickInsert = () => {
  const quickInsert = generateEmptyElement(QUICK_INSERT);
  return quickInsert;
};

export const transformToText = (editor, quickInsertNode) => {
  const path = ReactEditor.findPath(editor, quickInsertNode);
  const text = Node.string(quickInsertNode);
  const [, insertPath] = Editor.next(editor, { at: path });
  const insertPoint = Editor.start(editor, insertPath);
  const insertPathRef = Editor.pointRef(editor, insertPoint);
  const insertText = '/' + text;
  Transforms.insertText(editor, insertText, { at: insertPoint });
  Transforms.removeNodes(editor, { at: path });
  return insertPathRef.unref();
};

export const isSelectionSameWithInsert = (editor, element) => {
  if (!editor.selection) return;
  if (!Range.isCollapsed(editor.selection)) return;
  const { anchor } = editor.selection;
  const path = ReactEditor.findPath(editor, element);
  const lastPoint = Editor.end(editor, path);
  return Point.equals(anchor, lastPoint);
};
