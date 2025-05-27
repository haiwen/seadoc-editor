import { Node, Text } from '@seafile/slate';
import deepCopy from 'deep-copy';
import slugid from 'slugid';
import ObjectUtils from '../utils/object-utils';
import * as OPERATION from './constants';

export const decorateOperation = (editor, operation) => {
  let newOperation = deepCopy(operation);
  const { type } = newOperation;
  switch (type) {
    case OPERATION.INSERT_TEXT:
    case OPERATION.REMOVE_TEXT: {
      const { path } = newOperation;
      const node = Node.get(editor, path);
      newOperation['node_id'] = node.id;
      break;
    }
    case OPERATION.INSERT_NODE: {
      let { path, node } = newOperation;
      if (!node.id) node.id = slugid.nice(); // generate an id for insert node

      const parent = Node.parent(editor, path);
      newOperation['parent_node_id'] = parent.id;
      break;
    }
    case OPERATION.REMOVE_NODE: {
      let { path } = newOperation;
      const node = Node.get(editor, path);
      newOperation['node_id'] = node.id; // remove node's id
      break;
    }
    case OPERATION.MERGE_NODE: {
      // merge next node into prev node
      const { path } = newOperation;
      const node = Node.get(editor, path);
      newOperation['node_id'] = node.id;
      break;
    }
    case OPERATION.SPLIT_NODE: {
      // child: split [7, 0] -> [[7, 0],[7, 1]]
      // parent: split [[7, 0], [7, 1]] -> [[7], [8]]
      const { path, properties = {} } = newOperation;
      // need generate a new id for new node
      properties.id = slugid.nice();
      const node = Node.get(editor, path);
      newOperation['node_id'] = node.id; // split node's id
      break;
    }
    case OPERATION.SET_NODE: {
      const { path } = newOperation;
      const node = Node.get(editor, path);
      newOperation['node_id'] = node.id; // the node which will be set to another type
      break;
    }
    case OPERATION.MOVE_NODE: {
      const { path } = newOperation;
      const node = Node.get(editor, path);
      // move operation not change the node's id
      newOperation['node_id'] = node.id; // moved node's id
      break;
    }
    default: { // set_selection
      break;
    }
  }

  return newOperation;
};

export const replaceNodeId = (node) => {
  if (!ObjectUtils.isObject(node)) return node;
  if (ObjectUtils.hasProperty(node, 'children')) {
    return {
      ...node,
      id: slugid.nice(),
      children: replacePastedDataId(node.children),
    };
  }

  return {
    ...node,
    id: slugid.nice(),
  };
};

export const replacePastedDataId = (pastedData) => {
  // If children is malformed, return a list of correct child nodes

  if (ObjectUtils.isObject(pastedData)) {
    return replaceNodeId(pastedData);
  }

  if (!Array.isArray(pastedData)) return [{ id: slugid.nice(), text: '' }];
  return pastedData.map(item => {
    item.id = slugid.nice();
    if (item.children) {
      item.children = replacePastedDataId(item.children);
    }
    return item;
  });
};

export const removeCommentMarks = (fragment) => {
  const cleanNode = (node) => {
    if (Text.isText(node)) {
      const newNode = { ...node };
      for (const key of Object.keys(newNode)) {
        if (key.startsWith('sdoc_comment') || key.startsWith('removed_')) {
          delete newNode[key];
        }
      }
      return newNode;
    }

    if (node.children) {
      return {
        ...node,
        children: node.children.map(cleanNode),
      };
    }

    return node;
  };

  return fragment.map(cleanNode);
};
