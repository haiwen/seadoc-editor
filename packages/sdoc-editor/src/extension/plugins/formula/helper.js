import { Range, Transforms } from '@seafile/slate';
import { ReactEditor } from '@seafile/slate-react';
import copy from 'copy-to-clipboard';
import slugid from 'slugid';
import { FORMULA } from '../../constants/element-type';
import { focusEditor, generateDefaultText } from '../../core';

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
