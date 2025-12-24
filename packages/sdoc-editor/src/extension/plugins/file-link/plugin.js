import { Transforms, Node, Editor } from '@seafile/slate';
import { FILE_LINK } from '../../constants';

const withFileLink = (editor) => {
  const { isInline, isVoid, deleteBackward } = editor;
  const newEditor = editor;

  // Rewrite isInline
  newEditor.isInline = elem => {
    const { type } = elem;
    if (type === FILE_LINK) {
      return true;
    }
    return isInline(elem);
  };

  newEditor.isVoid = elem => {
    const { type } = elem;

    if (type === FILE_LINK) {
      return true;
    }

    return isVoid(elem);
  };

  newEditor.deleteBackward = (unit) => {
    const { selection } = newEditor;
    if (selection === null) {
      return deleteBackward(unit);
    }

    // Delete file link node
    const nodeEntry = Editor.node(newEditor, newEditor.selection);
    if (nodeEntry && Node.string(nodeEntry[0]).length === 0) {
      const beforePath = nodeEntry[1];
      beforePath.splice(-1, 1, Math.max(nodeEntry[1].at(-1) - 1, 0));
      const beforeNodeEntry = Editor.node(newEditor, beforePath);
      if (beforeNodeEntry && beforeNodeEntry[0].type === FILE_LINK) {
        Transforms.delete(newEditor, { at: beforeNodeEntry[1] });
        return;
      }
      return deleteBackward(unit);
    }

    return deleteBackward(unit);
  };

  return newEditor;
};

export default withFileLink;
