import { Editor, Path, Range, Transforms } from '@seafile/slate';
import { getPreviousPath } from '../../../core';
import { deleteMerge } from '../../../core/transforms/delete-merge';
import { generateListItem } from '../model';
import { hasListChild } from '../queries';
import { moveListItemSublistItemsToListItemSublist } from './move-list-item-sublist-to-list-item-sublist';
import { moveListItemsToList } from './move-list-items-to-list';

export const removeListItem = (editor, { list, listItem, reverse = true }) => {
  const [liNode, liPath] = listItem;

  if (Range.isExpanded(editor.selection) || !hasListChild(liNode)) {
    return false;
  }

  const previousLiPath = getPreviousPath(liPath);

  let success = false;

  Editor.withoutNormalizing(editor, () => {
    if (previousLiPath) {
      const previousLi = Editor.node(editor, previousLiPath);
      if (!previousLi) return;

      let tempLiPath = Path.next(liPath);
      let tempLiNode = generateListItem();
      Transforms.insertNodes(editor, tempLiNode, { at: tempLiPath });

      const tempLi = Editor.node(editor, tempLiPath);
      if (!tempLi) return;

      const tempLiPathRef = Editor.pathRef(editor, tempLi[1]);

      moveListItemSublistItemsToListItemSublist(editor, { fromListItem: listItem, toListItem: tempLi });

      deleteMerge(editor, { reverse });

      tempLiPath = tempLiPathRef.unref();

      moveListItemSublistItemsToListItemSublist(editor, { fromListItem: [tempLi[0], tempLiPath], toListItem: previousLi });

      Transforms.removeNodes(editor, { at: tempLiPath });

      success = true;
      return;
    }

    moveListItemsToList(editor, {
      fromListItem: listItem,
      toList: list,
      toListIndex: 1,
    });

  });

  return success;
};
