import { Editor, Operation } from '@seafile/slate';
import deepCopy from 'deep-copy';
import { setCursor } from '../cursor/helper';
import { getNode } from '../extension/core';
import * as OPERATION from '../node-id/constants';

export const getNodePathById = (rootNode, nodeId, path = []) => {
  if (rootNode.id === nodeId) return path;
  const { children = [] } = rootNode;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    path.push(i);
    const nodePath = getNodePathById(child, nodeId, path);
    if (nodePath) return nodePath;
    path.pop();
  }
  return null;
};

export const validateOperation = (editor, operation) => {
  let isValid = false;
  let newOperation = deepCopy(operation);
  const { type } = newOperation;
  switch (type) {
    case OPERATION.INSERT_TEXT:
    case OPERATION.REMOVE_TEXT: {
      const { node_id, path } = newOperation;
      const node = getNode(editor, path);
      // node is exist and node path is not changed
      if (node && node.id === node_id) {
        isValid = true;
        break;
      }

      // node is exist but node path is changed
      const nodePath = getNodePathById(editor, node_id);
      if (nodePath) {
        isValid = true;
        newOperation.path = nodePath;
        break;
      }
      // node is not exist
      isValid = false;
      break;
    }
    case OPERATION.INSERT_NODE: {
      let { parent_node_id, path } = newOperation;
      const parentNodePath = getNodePathById(editor, parent_node_id);
      if (!parentNodePath) {
        isValid = false;
        break;
      }
      const parentPath = path.slice(0, path.length - 1);
      if (parentPath.join() === parentNodePath.join()) {
        isValid = true;
        break;
      }

      // reset insert node path
      const parentNode = getNode(editor, path);
      if (parentNode) {
        const childLength = parentNode.children.length;
        const index = Math.min(path[path.length - 1], childLength);
        newOperation.path = parentNodePath.concat([index]);
        isValid = true;
      }
      break;
    }
    case OPERATION.REMOVE_NODE: {
      const { node_id, path } = newOperation;
      const node = getNode(editor, path);
      // node is exist and node path is not changed
      if (node && node.id === node_id) {
        isValid = true;
        break;
      }

      // node is exist but node path is changed
      const nodePath = getNodePathById(editor, node_id);
      if (nodePath) {
        isValid = true;
        newOperation.path = nodePath;
        break;
      }

      // node is not exist
      isValid = false;
      break;
    }
    case OPERATION.MERGE_NODE: {
      // merge next node into prev node
      const { node_id, path } = newOperation;
      const node = getNode(editor, path);
      // node is exist and node path is not changed
      if (node && node.id === node_id) {
        isValid = true;
        break;
      }

      // node is exist but node path is changed
      const nodePath = getNodePathById(editor, node_id);
      if (nodePath) {
        isValid = true;
        newOperation.path = nodePath;
        break;
      }

      // node is not exist
      isValid = false;
      break;
    }
    case OPERATION.SPLIT_NODE: {
      const { node_id, path } = newOperation;
      const node = getNode(editor, path);
      // node is exist and node path is not changed
      if (node && node.id === node_id) {
        isValid = true;
        break;
      }

      // node is exist but node path is changed
      const nodePath = getNodePathById(editor, node_id);
      if (nodePath) {
        isValid = true;
        newOperation.path = nodePath;
        break;
      }

      // node is not exist
      isValid = false;
      break;
    }
    case OPERATION.SET_NODE: {
      const { node_id, path, properties } = newOperation;
      const node = getNode(editor, path);
      // node is exist and node path is not changed
      if (node && node.id === node_id) {
        isValid = true;
        newOperation.properties = { ...properties, type: node.type };
        break;
      }

      // node is exist but node path is changed
      const nodePath = getNodePathById(editor, node_id);
      if (nodePath) {
        isValid = true;
        const node = getNode(editor, nodePath);
        newOperation.properties = { ...properties, type: node.type };
        newOperation.path = nodePath;
        break;
      }

      // node is not exist
      isValid = false;
      break;
    }
    case OPERATION.MOVE_NODE: {
      const { node_id, path } = newOperation;

      const node = getNode(editor, path);
      // node is exist and node path is not changed
      if (node && node.id === node_id) {
        isValid = true;
        break;
      }

      // TODO: newPath can not calculate by nodePath
      // node is exist but node path is changed
      // const nodePath = getNodePathById(editor, node_id);
      // if (nodePath) {}

      // node is not exist
      isValid = false;
      break;
    }
    default: { // set_selection
      break;
    }
  }
  if (isValid) return newOperation;
  return isValid;
};

export const getRevertOperationList = (operationList) => {
  if (operationList.length === 0) return [];

  // Generate a duplicate operationList, The original value cannot be modified here
  let revertOperationList = deepCopy(operationList);
  revertOperationList = revertOperationList.reverse();
  return revertOperationList.map(operations => {
    const ops = operations.reverse();
    return ops.map(item => Operation.inverse(item));
  });
};

export const revertOperationList = (editor, operationList) => {
  if (operationList.length === 0) return [];
  const revertOperationList = getRevertOperationList(operationList);

  // Cancel locale execute operations
  for (let i = 0; i < revertOperationList.length; i++) {
    const operations = revertOperationList[i];
    Editor.withoutNormalizing(editor, () => {
      for (let j = 0; j < operations.length; j++) {
        const op = operations[j];
        editor.apply(op);
      }
    });
  }
};

export const reExecRevertOperationList = (editor, revertOperationList) => {
  if (revertOperationList.length === 0) return;

  // Re-execute revert operations
  for (let i = 0; i < revertOperationList.length; i++) {
    const operations = revertOperationList[i];
    Editor.withoutNormalizing(editor, () => {
      for (let j = 0; j < operations.length; j++) {
        const op = validateOperation(editor, operations[j]);
        if (op) {
          editor.apply(op);
        }
      }
    });
  }
};

export const syncRemoteOperations = (editor, remoteOperations) => {
  if (remoteOperations.length === 0) return;

  Editor.withoutNormalizing(editor, () => {
    for (let i = 0; i < remoteOperations.length; i++) {
      const op = remoteOperations[i];
      if (op.type === 'set_selection'){
        continue;
      }
      editor.apply(op);
    }
  });
};

export const syncRemoteCursorLocation = (editor, user, location, cursorData) => {
  const currentUser = editor.user;
  if (user && user.username !== currentUser.username) {
    setCursor(editor, user, location, cursorData);

    // sync cursor position
    editor.onCursor && editor.onCursor(editor.cursors);
  }
};
