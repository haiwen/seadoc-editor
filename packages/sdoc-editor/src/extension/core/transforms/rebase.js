import { Editor, Transforms } from '@seafile/slate';
import { ELEMENT_TYPE } from '../../constants';
import { getNode } from '../queries';
import { removeNodeChildren } from './remove-node-children';

export const replaceRebaseNodeChildren = (editor, { at, nodes, insertOptions, removeOptions }) => {
  removeNodeChildren(editor, at, removeOptions);

  Transforms.insertNodes(editor, nodes, {
    ...insertOptions,
    at: at.concat([0])
  });
};

export const replaceRebaseNode = (editor, { at, nodes, insertOptions, removeOptions } = {}) => {
  const parentPath = at.slice(0, -1);
  const parentNode = at.length > 1 ? getNode(editor, parentPath) : {};
  if ([ELEMENT_TYPE.ORDERED_LIST, ELEMENT_TYPE.UNORDERED_LIST].includes(parentNode.type)) {
    const newChildren = parentNode.children.slice(0);
    newChildren.splice(at[at.length - 1], 1, ...nodes);
    replaceRebaseNodeChildren(editor, { at: parentPath, nodes: newChildren });
    return;
  }

  Transforms.removeNodes(editor, { at, ...removeOptions });

  Transforms.insertNodes(editor, nodes, {
    ...insertOptions,
    at
  });
};

export const deleteRebaseNodeMark = (editor, path, element, marks = []) => {
  const newElement = { ...element };
  marks.forEach(markItem => {
    newElement[markItem] && delete newElement[markItem];
  });

  Transforms.removeNodes(editor, { at: path, });
  Transforms.insertNodes(editor, newElement, { at: path });
};

export const rebaseNode = (editor, callback) => {
  if (!callback) return;
  Editor.withoutNormalizing(editor, () => {
    callback && callback();
  });
};
