import { Editor, Transforms } from '@seafile/slate';
import context from '../../../context';
import { IMAGE } from '../../constants';
import { getImageURL, isCommentEditor, isWechatImageUrl } from './helpers';

const MAX_BATCH_SIZE = 10;

const walkNodes = (nodes, callback) => {
  if (!Array.isArray(nodes)) return;

  nodes.forEach(node => {
    if (!node || typeof node !== 'object') return;
    callback(node);
    walkNodes(node.children, callback);
  });
};

export const collectPastedWechatImages = (fragment) => {
  const groups = new Map();

  walkNodes(fragment, (node) => {
    const url = node.type === IMAGE ? node.data?.src : '';
    if (!node.id || !isWechatImageUrl(url)) return;

    const nodeIds = groups.get(url) || [];
    nodeIds.push(node.id);
    groups.set(url, nodeIds);
  });

  return groups;
};

const getStoredImageUrl = (editor, url) => {
  if (isCommentEditor(editor)) return getImageURL({ src: url }, editor);
  return url;
};

const updateImageNodes = (editor, nodeIds, url, isError) => {
  nodeIds.forEach((nodeId) => {
    const [nodeEntry] = Editor.nodes(editor, {
      at: [],
      match: node => node.id === nodeId,
      voids: true,
    });
    if (!nodeEntry) return;

    const [node, path] = nodeEntry;
    const data = { ...node.data, src: getStoredImageUrl(editor, url), is_copy_error: isError };
    Transforms.setNodes(editor, { data }, { at: path });
  });
};

const importImageBatch = async (editor, docUuid, batch) => {
  try {
    const images = await context.importRemoteImages(docUuid, batch.map(([url]) => url));
    const imageMap = new Map(images.map(image => [image.source_url, image]));

    batch.forEach(([url, nodeIds]) => {
      const image = imageMap.get(url);
      const isSuccess = image?.status === 'success' && image.relative_path;
      updateImageNodes(editor, nodeIds, isSuccess ? image.relative_path : url, !isSuccess);
    });
  } catch (error) {
    batch.forEach(([url, nodeIds]) => updateImageNodes(editor, nodeIds, url, true));
  }
};

// Import pasted WeChat images through Seahub and update the inserted Slate nodes.
export const importPastedWechatImages = async (editor, fragment) => {
  const imageGroups = Array.from(collectPastedWechatImages(fragment).entries());
  if (imageGroups.length === 0) return;

  const docUuid = context.getSetting('docUuid');
  for (let index = 0; index < imageGroups.length; index += MAX_BATCH_SIZE) {
    await importImageBatch(editor, docUuid, imageGroups.slice(index, index + MAX_BATCH_SIZE));
  }
};
