import { Editor, Path, Transforms } from '@seafile/slate';
import {
  findDescendant,
  getLastChildPath,
  moveChildren
} from '../../../core';
import { getListTypes } from '../queries';

export const moveListItemsToList = (editor, {
  fromList,
  fromListItem,
  fromStartIndex,
  to: _to,
  toList,
  toListIndex = null,
  deleteFromList = true,
}) => {
  let fromListPath = null;
  let moved = false;

  Editor.withoutNormalizing(editor, () => {

    if (fromListItem) {
      const fromListItemSubList = findDescendant(editor, {
        at: fromListItem[1],
        match: { type: getListTypes() },
      });
      if (!fromListItemSubList) return;
      fromListPath = fromListItemSubList?.[1];
    } else if (fromList) {
      fromListPath = fromList[1];
    } else {
      return;
    }

    let to = null;
    if (_to) to = _to;
    if (toList) {
      if (toListIndex !== null) {
        to = toList[1].concat([toListIndex]);
      } else {
        const lastChildPath = getLastChildPath(toList);
        to = Path.next(lastChildPath);
      }
    }

    if (!to) return;

    moved = moveChildren(editor, {
      at: fromListPath,
      to,
      fromStartIndex,
    });

    // Remove the empty list
    if (deleteFromList) {
      Transforms.delete(editor, { at: fromListPath });
    }
  });

  return moved;
};
