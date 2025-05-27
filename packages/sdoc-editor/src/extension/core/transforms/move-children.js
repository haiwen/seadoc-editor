import { Editor, Path, Transforms } from '@seafile/slate';
import { getNode } from '../queries';

export const moveChildren = (editor, { at, to, match, fromStartIndex = 0 }) => {
  let moved = 0;
  const parentPath = Path.isPath(at) ? at : at[1];
  const parentNode = Path.isPath(at) ? getNode(editor, parentPath) : at[0];

  if (!parentNode) return moved;
  // There have none children in a not block element
  if (!Editor.isBlock(editor, parentNode)) return moved;

  for (let i = parentNode.children.length - 1; i >= fromStartIndex; i--) {
    const childPath = [...parentPath, i];
    const childNode = getNode(editor, childPath);
    if (!match || (childNode && match([childNode, childPath]))) {
      Transforms.moveNodes(editor, { at: childPath, to });
      moved++;
    }
  }

  return moved;
};
