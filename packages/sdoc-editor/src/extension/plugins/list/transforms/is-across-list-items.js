import { Range } from '@seafile/slate';
import { LIST_ITEM } from '../../../constants';
import { isRangeAcrossBlocks, someNode } from '../../../core';

export const isAcrossListItems = (editor) => {
  const { selection } = editor;

  if (!selection || Range.isCollapsed(selection)) {
    return false;
  }

  const isAcrossBlocks = isRangeAcrossBlocks(editor);

  if (!isAcrossBlocks) return false;

  return someNode(editor, { match: { type: LIST_ITEM } });
};
