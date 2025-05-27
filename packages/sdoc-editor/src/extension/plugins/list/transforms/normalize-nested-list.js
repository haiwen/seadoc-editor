import { Transforms, Path, Editor } from '@seafile/slate';
import { ORDERED_LIST, UNORDERED_LIST } from '../../../constants';
import { match } from '../../../core';

export const normalizeNestedList = (editor, { nestedListItem } = {}) => {
  const [, path] = nestedListItem;

  const parentNodeEntry = Editor.parent(editor, path);
  const hasParentList = parentNodeEntry && match(parentNodeEntry[0], [], { type: [ORDERED_LIST, UNORDERED_LIST] });

  if (!hasParentList) return false;

  let previousListItemPath = null;

  try {
    previousListItemPath = Path.previous(path);
  } catch (e) {
    return false;
  }

  const previousSiblingItem = Editor.node(editor, previousListItemPath);
  if (previousSiblingItem) {
    const [, previousPath] = previousSiblingItem;
    const newPath = previousPath.concat([1]);

    Transforms.moveNodes(editor, { at: path, to: newPath });
    return true;
  }

  return false;
};
