import { Editor, Transforms } from '@seafile/slate';
import { ReactEditor } from '@seafile/slate-react';

export const focusEditor = (editor, target) => {
  if (target) {
    Editor.withoutNormalizing(editor, () => {
      Transforms.deselect(editor);
      Transforms.select(editor, target);
    });
  }
  ReactEditor.focus(editor);
};
