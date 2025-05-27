import { Editor, Path, Transforms } from '@seafile/slate';
import { LIST_TYPE_ARRAY } from '../../../constants';
import { findDescendant, getLastChildPath, moveChildren } from '../../../core';
import { generateEmptyList } from '../model';

export const moveListItemSublistItemsToListItemSublist = (editor, { fromListItem, start, toListItem }) => {
  const [, fromListItemPath] = fromListItem;
  const [, toListItemPath] = toListItem;

  let moved = 0;
  Editor.withoutNormalizing(editor, () => {
    const fromListItemSublist = findDescendant(editor, { at: fromListItemPath, match: { type: LIST_TYPE_ARRAY } });
    if (!fromListItemSublist) return;

    const [, fromListItemSublistPath] = fromListItemSublist;

    const toListItemSublist = findDescendant(editor, { at: toListItemPath, match: { type: LIST_TYPE_ARRAY } });

    let to = null;
    if (!toListItemSublist) {
      const fromList = Editor.parent(editor, fromListItemPath);
      if (!fromList) return;

      const [fromListNode] = fromList;
      const fromListType = fromListNode.type;
      const toListItemSublistPath = toListItemPath.concat([1]);
      const list = generateEmptyList(fromListType);
      Transforms.insertNodes(editor, list, { at: toListItemSublistPath });

      to = toListItemSublistPath.concat([0]);
    } else if (start) {
      const [, toListItemSublistPath] = toListItemSublist;
      to = toListItemSublistPath.concat([0]);
    } else {
      to = Path.next(getLastChildPath(toListItemSublist));
    }

    moved = moveChildren(editor, { at: fromListItemSublistPath, to });

    Transforms.delete(editor, { at: fromListItemSublistPath });
  });

  return moved;
};
