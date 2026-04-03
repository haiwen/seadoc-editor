
import { Transforms } from '@seafile/slate';
import { DIVIDER } from '../../constants';
import { focusEditor, generateEmptyElement } from '../../core';


export const transformToDivider = (editor) => {
  if (!editor.selection) return;
  Transforms.setNodes(editor, { type: DIVIDER });
  focusEditor(editor);
};

export const insertDivider = (editor) => {
  if (!editor.selection) return;

  const dividerNode = generateEmptyElement(DIVIDER);
  Transforms.insertNodes(editor, dividerNode);
  focusEditor(editor);
};
