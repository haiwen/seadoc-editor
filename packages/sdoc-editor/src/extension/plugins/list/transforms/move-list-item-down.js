import { Transforms, Path, Editor } from '@seafile/slate';
import { generateEmptyList } from '../model';
import { getListTypes } from '../queries';

export const movedListItemDown = (editor, { list, listItem }) => {
  let moved = false;
  const [listNode] = list;
  const [, listItemPath] = listItem;

  let previousListItemPath = null;

  try {
    previousListItemPath = Path.previous(listItemPath);
  } catch (e) {
    return;
  }

  const previousSiblingItem = Editor.node(editor, previousListItemPath);

  if (previousSiblingItem) {
    const [previousNode, previousPath] = previousSiblingItem;

    const subList = previousNode.children.find(n => {
      return getListTypes().includes(n.type);
    });
    const newPath = previousPath.concat(subList ? [1, subList.children.length] : [1]);

    Editor.withoutNormalizing(editor, () => {
      if (!subList) {
        // Insert a list child element
        const list = generateEmptyList(listNode.type);
        Transforms.wrapNodes(editor, list, { at: listItemPath });
      }
      Transforms.moveNodes(editor, { at: listItemPath, to: newPath });
      moved = true;
    });
  }

  return moved;
};
