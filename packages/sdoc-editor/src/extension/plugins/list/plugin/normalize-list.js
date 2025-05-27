import { Element, Transforms, Path } from '@seafile/slate';
import { LIST_ITEM, GROUP } from '../../../constants';
import { getChildren, getNode, getPreviousPath, match } from '../../../core';
import { generateEmptyListItem } from '../model';
import { getListTypes } from '../queries';
import { moveListItemsToList, normalizeListItem, normalizeNestedList } from '../transforms';

const validChildrenTypes = [GROUP, LIST_ITEM];

export const normalizeList = (editor) => {
  const { normalizeNode } = editor;
  return ([node, path]) => {
    if (!Element.isElement(node)) {
      return normalizeNode([node, path]);
    }

    const listTypes = getListTypes();

    // root
    if (listTypes.includes(node.type)) {
      const children = getChildren([node, path]);
      const nonLiChild = children.find(([child]) => !validChildrenTypes.includes(child.type));

      if (nonLiChild) {
        const listItem = generateEmptyListItem();
        Transforms.wrapNodes(editor, listItem, { at: nonLiChild[1] });
        return;
      }
    }

    if (match(node, [], { type: listTypes })) {
      if (!node.children.length || !node.children.find(child => validChildrenTypes.includes(child.type))) {
        Transforms.removeNodes(editor, { at: path });
        return;
      }

      const nextPath = Path.next(path);
      const nextNode = getNode(editor, nextPath);

      if (nextNode?.type === node.type) {
        moveListItemsToList(editor, {
          fromList: [nextNode, nextPath],
          toList: [node, path],
          deleteFromList: true,
        });
      }

      const prevPath = getPreviousPath(path);
      const prevNode = getNode(editor, prevPath);

      if (prevNode?.type === node.type) {
        editor.normalizeNode([prevNode, prevPath]);
        return;
      }

      if (normalizeNestedList(editor, { nestedListItem: [node, path] })) {
        return;
      }
    }

    if (node.type === LIST_ITEM) {
      if (normalizeListItem(editor, { listItem: [node, path] })) {
        return;
      }
    }

    normalizeNode([node, path]);
  };
};
