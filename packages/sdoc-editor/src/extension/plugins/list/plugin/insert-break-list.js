import { isBlockAboveEmpty } from '../../../core';
import { getListItemEntry } from '../queries';
import { insertListItem, movedListItemUp } from '../transforms';

export const insertBreakList = (editor) => {
  if (!editor.selection) return;

  // moved | inserted
  let moved = false;
  const res = getListItemEntry(editor, {});

  // if selection is in a li, and li content is empty
  if (res) {
    if (isBlockAboveEmpty(editor)) {
      moved = movedListItemUp(editor, res);
      if (moved) return true;
    }
  }

  if (!moved) {
    const inserted = insertListItem(editor);
    if (inserted) return true;
  }

  return;
};
