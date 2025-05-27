import { Transforms, Node } from '@seafile/slate';

export const removeNodeChildren = (editor, path, options) => {
  const nodeChildren = Node.children(editor, path, { reverse: true, });
  for (const [, childPath] of nodeChildren) {
    Transforms.removeNodes(editor, { ...options, at: childPath });
  }
};
