import { Editor, Range, Transforms } from '@seafile/slate';
import { ReactEditor } from '@seafile/slate-react';
import copy from 'copy-to-clipboard';
import slugid from 'slugid';
import { TOGGLE_TITLE_TYPES } from '../../constants';
import { BLOCKQUOTE, CALL_OUT, CHECK_LIST_ITEM, CODE_BLOCK, FORMULA, LIST_ITEM, MULTI_COLUMN, SUBTITLE, TITLE } from '../../constants/element-type';
import { focusEditor, generateDefaultText, getNodeType } from '../../core';

export const isInsertFormulaMenuDisabled = (editor, readonly) => {
  if (readonly) return true;
  const { selection } = editor;
  if (selection === null) return true;
  if (!Range.isCollapsed(selection)) return true;

  const [match] = Editor.nodes(editor, {
    match: n => {
      let type = getNodeType(n);

      if (TOGGLE_TITLE_TYPES.includes(type)) return true;
      if (type === CODE_BLOCK) return true;
      if (type.startsWith('header')) return true;
      if (type === TITLE) return true;
      if (type === SUBTITLE) return true;
      if (type === LIST_ITEM) return true;
      if (type === CHECK_LIST_ITEM) return true;
      if (type === MULTI_COLUMN) return true;
      if (type === BLOCKQUOTE) return true;
      if (type === CALL_OUT) return true;
      if (Editor.isVoid(editor, n)) return true;

      return false;
    },
    universal: true,
  });

  if (match) return true;

  return false;
};

export const insertFormula = (editor, data) => {
  const formula = {
    id: slugid.nice(),
    type: FORMULA,
    data: { formula: data.formula },
    children: [generateDefaultText()],
  };
  Transforms.insertNodes(editor, formula, { at: data.at, void: true });
  focusEditor(editor);
};

export const updateFormula = (editor, data) => {
  const { formula, at } = data;
  Transforms.setNodes(editor, { data: { formula } }, { at: at, void: true });
  focusEditor(editor);
};

export const onCopyFormulaNode = (editor, element) => {
  if (editor.selection == null || Range.isExpanded(editor.selection)) return;

  const p = ReactEditor.findPath(editor, element);
  Transforms.select(editor, p);
  const newData = editor.setFragmentData(new DataTransfer());
  copy('copy', {
    onCopy: (clipboardData) => {
      newData.types.forEach((type) => {
        const data = newData.getData(type);
        clipboardData.setData(type, data);
      });
    }
  });
};
