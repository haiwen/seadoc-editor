import { Editor, Node, Text, Transforms } from '@seafile/slate';
import deepCopy from 'deep-copy';
import slugid from 'slugid';
import context from '../context';
import { CLIPBOARD_CUT_COMMENT_KEY, CLIPBOARD_ORIGIN_SDOC_KEY } from '../extension/constants';
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

const getCommentTextLengths = (nodes) => {
  const lengths = {};
  for (const [node] of Node.texts({ children: nodes })) {
    if (node.text === '') continue;
    for (const key of Object.keys(node)) {
      if (key.startsWith('sdoc_comment_')) {
        lengths[key] = (lengths[key] || 0) + node.text.length;
      }
    }
  }
  return lengths;
};

export const getFullyCutCommentKeys = (editor) => {
  const selectedLengths = getCommentTextLengths(editor.getFragment());
  const documentLengths = getCommentTextLengths(editor.children);
  return Object.keys(selectedLengths).filter(key => selectedLengths[key] === documentLengths[key]);
};

export const setCutCommentData = (editor, data) => {
  const commentKeys = getFullyCutCommentKeys(editor);
  data.setData(`application/${CLIPBOARD_CUT_COMMENT_KEY}`, JSON.stringify({ id: slugid.nice(), commentKeys }));
};

const pastedCutCommentIds = new Set();
const pastedCutCommentBatches = new WeakMap();

export const getPastedCommentKeys = (data, editor, replacedNodes = []) => {
  const commentKeys = data.getData(`application/${CLIPBOARD_CUT_COMMENT_KEY}`);
  if (!commentKeys || data.getData(`text/${CLIPBOARD_ORIGIN_SDOC_KEY}`) !== context.getSetting('docUuid')) return;
  const { id, commentKeys: keys } = JSON.parse(commentKeys);
  if (pastedCutCommentIds.has(id)) return [];
  if (!editor) return keys;
  const documentLengths = getCommentTextLengths(editor.children);
  const replacedLengths = getCommentTextLengths(replacedNodes);
  return keys.filter(key => (documentLengths[key] || 0) === (replacedLengths[key] || 0));
};

export const consumePastedCommentKeys = (data, editor, previousChildren) => {
  if (editor.children === previousChildren || !getPastedCommentKeys(data)?.length) return;
  const { id } = JSON.parse(data.getData(`application/${CLIPBOARD_CUT_COMMENT_KEY}`));
  pastedCutCommentIds.add(id);
  const { undos } = editor.history;
  const batch = undos[undos.length - 1];
  const ids = pastedCutCommentBatches.get(batch) || new Set();
  ids.add(id);
  pastedCutCommentBatches.set(batch, ids);
};

export const setPastedCommentBatchConsumed = (batch, consumed) => {
  for (const id of pastedCutCommentBatches.get(batch) || []) {
    if (consumed) {
      pastedCutCommentIds.add(id);
    } else {
      pastedCutCommentIds.delete(id);
    }
  }
};

export const removeEmptyCommentMarks = (editor) => {
  Editor.withoutNormalizing(editor, () => {
    for (const [node, path] of Editor.nodes(editor, {
      at: [],
      match: n => Text.isText(n) && n.text === '',
    })) {
      const commentKeys = Object.keys(node).filter(key => key.startsWith('sdoc_comment_'));
      if (commentKeys.length) {
        Transforms.unsetNodes(editor, commentKeys, { at: path });
      }
    }
  });
};

export const removeCommentMarks = (fragment, preservedCommentKeys = [], elementCommentsMap) => {
  const comments = {};
  if (elementCommentsMap && preservedCommentKeys.length) {
    for (const comment of Object.values(elementCommentsMap).flat()) {
      comments[`sdoc_comment_${comment.detail.text_comment_id}`] = comment;
    }
  }

  const cleanNode = (node) => {
    if (Text.isText(node)) {
      const newNode = { ...node };
      for (const key of Object.keys(newNode)) {
        if ((key.startsWith('sdoc_comment') && !preservedCommentKeys.includes(key)) || key.startsWith('removed_')) {
          delete newNode[key];
        } else if (elementCommentsMap && key.startsWith('sdoc_comment_')) {
          const comment = comments[key];
          if (comment) {
            newNode[key] = !comment.resolved;
          } else {
            delete newNode[key];
          }
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
