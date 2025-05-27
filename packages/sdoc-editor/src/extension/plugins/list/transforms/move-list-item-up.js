import { Transforms, Path, Editor } from '@seafile/slate';
import { LIST_ITEM } from '../../../constants';
import { getAboveNode, getNode, isLastChild } from '../../../core';
import { generateEmptyList } from '../model';
import { hasListChild } from '../queries';
import { moveListItemsToList } from './move-list-items-to-list';
import { unwrapList } from './unwrap-list';

export const movedListItemUp = (editor, { list, listItem }) => {
  const move = () => {
    const [listNode, listPath] = list;
    const [liNode, liPath] = listItem;

    // 获取上层 list-item 节点
    const liParent = getAboveNode(editor, {
      at: listPath,
      match: { type: [LIST_ITEM] }
    });

    // 如果上层节点不存在, 说明当前 list 为顶层 list, list[ol] > 'li'
    if (!liParent) {
      let toListPath = null;
      try {
        toListPath = Path.next(listPath);
      } catch (err) {
        return;
      }

      const condA = hasListChild(liNode);
      const condB = !isLastChild(list, liPath);

      if (condA || condB) {
        // 创建一个新的兄弟节点
        const list = generateEmptyList(listNode.type);
        Transforms.insertNodes(editor, list, { at: toListPath });
      }

      // 如果包含子节点，将子节点移动到新创建的节点中
      if (condA) {
        const toListNode = getNode(editor, toListPath);
        if (!toListNode) return;

        // 将子节点，移动到新创建的节点中
        moveListItemsToList(editor, {
          formListItem: listItem,
          toList: [toListNode, toListPath]
        });
      }

      // 如果不是最后一个节点
      if (condB) {
        const toListNode = getNode(editor, toListPath);
        if (!toListNode) return;

        // 将当前节点之后的兄弟节点，移动到新创建的 list 中
        moveListItemsToList(editor, {
          fromList: list,
          fromStartIndex: liPath[liPath.length - 1] + 1,
          toList: [toListNode, toListPath],
          deleteFromList: false,
        });
      }

      // unwrap the list
      unwrapList(editor, { at: liPath.concat(0) });
      return true;
    }

    // 如果上层节点存在，说明当前 list 为 子 list, li > list[ol] > 'li'
    const [, liParentPath] = liParent;
    // is last: false
    // li > list[ol] > li
    //               > li
    const toListPath = liPath.concat([1]);
    if (!isLastChild(list, liPath)) {
      // 此处取巧：
      // 第一步：把当前节点的兄弟节点，移动到当前节点 “子节点（ol）” 的孩子节点中
      // 第二步：把当前节点的字节点，移动为当前节点 “父节点” 的 “兄弟” 节点
      if (!hasListChild(liNode)) {
        const list = generateEmptyList(listNode.type);
        Transforms.insertNodes(editor, list, { at: toListPath });
      }

      const toListNode = getNode(editor, toListPath);
      if (!toListNode) return;

      // move next siblings to li sublist
      moveListItemsToList(editor, {
        fromListItem: liParent,
        toList: [toListNode, toListPath],
        fromStartIndex: liPath[liPath.length - 1] + 1,
        deleteFromList: false,
      });
    }

    // is last: true
    // li > list[ol] > li
    const movedUpLiPath = Path.next(liParentPath);
    Transforms.moveNodes(editor, { at: liPath, to: movedUpLiPath });
    return true;
  };

  let moved = false;
  Editor.withoutNormalizing(editor, () => {
    moved = move();
  });
  return moved;
};
