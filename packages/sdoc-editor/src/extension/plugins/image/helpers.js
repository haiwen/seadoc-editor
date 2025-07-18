import { Editor, Range, Transforms, Path, Node } from '@seafile/slate';
import { ReactEditor } from '@seafile/slate-react';
import slugId from 'slugid';
import urlJoin from 'url-join';
import { COMMENT_EDITOR, INTERNAL_EVENT } from '../../../constants';
import context from '../../../context';
import EventBus from '../../../utils/event-bus';
import { CODE_BLOCK, ELEMENT_TYPE, IMAGE, IMAGE_BLOCK, INSERT_POSITION, PARAGRAPH, SUBTITLE, TITLE, LIST_ITEM, CHECK_LIST_ITEM, BLOCKQUOTE, CALL_OUT } from '../../constants';
import { generateEmptyElement, getNodeType, isTextNode, getParentNode, focusEditor, getAboveBlockNode, generateDefaultParagraph } from '../../core';
import base64ToUnit8Array from './base64-to-unit8array';
import ImageCache from './image-cache';

// TODO: seatable_column
export const getDigitalSignImgUrl = (partUrl) => {
  const server = context.getSetting('serviceUrl');
  const workspaceID = context.getSetting('workspaceID');
  const dtableUuid = context.getSetting('dtableUuid');

  if (!partUrl || typeof partUrl !== 'string') return '';
  return `${server}/workspace/${workspaceID}/asset/${dtableUuid}${partUrl}`;
};

export const getColumnByKey = (columns, key) => {
  const column = columns.find(item => item.key === key);
  return column || null;
};

export const isInsertImageMenuDisabled = (editor, readonly) => {
  if (readonly) return true;
  const { selection } = editor;
  if (selection === null) return true;
  if (!Range.isCollapsed(selection)) return true;

  const [match] = Editor.nodes(editor, {
    match: n => {
      let type = getNodeType(n);
      if (!type && isTextNode(n) && n.id) {
        const parentNode = getParentNode(editor.children, n.id);
        type = getNodeType(parentNode);
      }

      if (type === CODE_BLOCK) return true;
      if (type.startsWith('header')) return true;
      if (type === TITLE) return true;
      if (type === SUBTITLE) return true;
      if (type === LIST_ITEM) return true;
      if (type === CHECK_LIST_ITEM) return true;
      if (Editor.isVoid(editor, n)) return true;

      return false;
    },
    universal: true,
  });

  if (match) return true;

  return false;
};

export const generateImageNode = (src, file_uuid) => {
  const element = generateEmptyElement(IMAGE);
  let data = {
    src,
  };
  if (file_uuid) {
    data.file_uuid = file_uuid;
  }
  return { ...element, data };
};

export const insertImage = (editor, imgInfos, selection, position = INSERT_POSITION.CURRENT) => {
  if (!imgInfos) return;
  if (position !== INSERT_POSITION.AFTER) {
    if (isInsertImageMenuDisabled(editor)) return;
  }

  const imageNodes = imgInfos.map(({ src, file_uuid }) => {
    const imgSrc = src;
    return generateImageNode(imgSrc, file_uuid);
  });

  const validSelection = selection || editor.selection;
  let path = Editor.path(editor, validSelection);

  if (position === INSERT_POSITION.AFTER) {
    const p = generateEmptyElement(ELEMENT_TYPE.PARAGRAPH);
    imageNodes.forEach((item, index) => {
      p.children[index] = item;
    });
    Transforms.insertNodes(editor, p, { at: [path[0] + 1] });
    focusEditor(editor, [path[0] + 1, 2]);
    return;
  }

  const aboveNodeEntry = getAboveBlockNode(editor);
  const isEmptyParagraph = aboveNodeEntry[0].type === PARAGRAPH && Node.string(aboveNodeEntry[0]).length === 0;
  if (imageNodes.length === 1 && isEmptyParagraph) {
    const imageNode = imageNodes[0];
    Transforms.insertNodes(editor, imageNode, { at: validSelection });

    // BLOCKQUOTE and CALL_OUT use inline images
    let imageType = IMAGE_BLOCK;
    const [topNode,] = Editor.node(editor, [aboveNodeEntry[1][0]]);
    if ([BLOCKQUOTE, CALL_OUT].includes(topNode?.type)) {
      imageType = '';
    }

    if (imageType === IMAGE_BLOCK) {
      Transforms.setNodes(editor, { type: imageType }, { at: validSelection });
      const nodePath = [aboveNodeEntry[1][0]];
      const nextPath = Path.next(nodePath);
      Transforms.insertNodes(editor, generateDefaultParagraph(), { at: nextPath });
      const endOfFirstNode = Editor.start(editor, nextPath);
      const range = {
        anchor: endOfFirstNode,
        focus: endOfFirstNode,
      };

      focusEditor(editor, range);
    }
    return;
  }

  Transforms.insertNodes(editor, imageNodes, { at: validSelection });
  const imageEndSelection = Path.next(Path.next(path));
  focusEditor(editor, imageEndSelection);
};

export const updateImage = (editor, data) => {
  Transforms.setNodes(editor, { data }, {
    match: (n) => getNodeType(n) === IMAGE,
    at: editor.selection,
    voids: true
  });
};

export const getImageURL = (data, editor) => {
  const { src: url, column_key } = data;

  if (column_key) {
    const column = getColumnByKey(editor.columns || [], column_key);
    const { type } = column || {};
    // TODO: Plugin contants, image digital-sign
    if (type === 'image') {
      const imgUrl = editor.getColumnCellValue(column_key) || '';
      const firstSrc = imgUrl.split(',')[0];
      return firstSrc;
    } else if (type === 'digital-sign') {
      const partUrl = editor.getColumnCellValue(column_key) || '';
      const imgUrl = getDigitalSignImgUrl(partUrl);
      return imgUrl;
    }
  }

  // upload image | drag drop image | cut image
  if (isImageUrlIsFromUpload(url)) return url;

  // copy from others doc
  if (isImageUrlIsFromCopy(url)) return url;

  const serviceUrl = context.getSetting('serviceUrl');
  const assetsUrl = context.getSetting('assetsUrl');
  return urlJoin(serviceUrl, assetsUrl, url);
};

export const hasSdocImages = (originSdocUuid, fragmentData) => {
  const sdocUuid = context.getSetting('docUuid');
  const hasImg = fragmentData.some((item) => item.children.some((child) => child?.type === IMAGE));
  return originSdocUuid !== sdocUuid && hasImg;
};

export const getImageData = (fragmentData) => {
  let imageData = new Set();
  fragmentData.forEach((item) => item.children.forEach((child) => {
    if (child?.type === IMAGE && !child.data.src.startsWith('http')) {
      imageData.add(child.data.src.slice(1));
    }
  }));
  return Array.from(imageData);
};

export const queryCopyMoveProgressView = (taskId, interval = 300) => {
  let timer;
  const stop = () => {
    clearTimeout(timer);
  };
  const start = async () => {
    const res = await context.getCopyMoveProgressView(taskId);
    const { successful } = res.data;
    if (successful) {
      stop();
      // Reload image
      const eventBus = EventBus.getInstance();
      eventBus.dispatch(INTERNAL_EVENT.RELOAD_IMAGE);
    } else {
      timer = setTimeout(start, interval);
    }
  };

  start();
};

export const resetCursor = (editor) => {
  const { selection } = editor;
  const currentPath = selection.focus.path;
  const targetPath = Path.next(Path.next(currentPath));

  // Set cursor after image insertion
  queueMicrotask(() => {
    Transforms.select(editor, targetPath);
  });
};

export const getSingleImageFromFragment = (data) => {
  if (data.length !== 1) return null;
  if (Node.string(data[0]).length !== 0) return null;
  const children = data[0].children;
  const images = children.filter((item) => item?.type === IMAGE);
  if (images.length !== 1) return null;
  return images[0];
};

export const insertImageFiles = (files, editor, targetPath) => {
  const imgInfos = generateImageInfos(files);
  insertImage(editor, imgInfos, targetPath, INSERT_POSITION.AFTER);
};

export const selectImageWhenSelectPartial = (event, editor, imageNode, isImageSelected) => {
  if (isImageSelected) return;
  const isMouseLeftDown = event.buttons === 1;
  if (!isMouseLeftDown) return;
  const { selection } = editor;
  if (Range.isCollapsed(selection)) return;
  let imagePath = ReactEditor.findPath(editor, imageNode);
  if (imageNode.type === IMAGE_BLOCK) {
    const imageIndex = imageNode.children.findIndex((item) => item.type === IMAGE);
    imagePath = imagePath.concat([imageIndex]);
  }
  const isIncludedSelection = Range.includes(selection, imagePath);
  if (isIncludedSelection) return;
  // When the mouse hovers over an image, the image is selected.
  const nextPath = Path.next(imagePath.slice(0, imagePath.length - 1));
  const focusRange = { ...selection, focus: { offset: 0, path: [...nextPath, 0] } };
  focusEditor(editor, focusRange);
};

// Upload image when the image is pasted from the clipboard in base64
export const handleBase64Image = (editor, path, imgData) => {
  const unit8Array = base64ToUnit8Array(imgData.src);
  const blob = new Blob([unit8Array.u8arr], { type: unit8Array.mime });
  const file = new File([blob], `${slugId.nice()}.jpg`, { type: unit8Array.mime });
  context.uploadLocalImage([file]).then((res) => {
    const _data = { ...imgData, src: res[0] };
    Transforms.setNodes(editor, { data: _data }, { at: path });
  });
};

export const isImageUrlIsFromCopy = (url) => {
  if (url && url.startsWith('http')) return true;
  if (url && url.startsWith('attachment')) return true; // from yuque
  return false;
};

export const isImageUrlIsFromUpload = (url) => {
  if (url && url.startsWith('blob:http')) return true;
  return false;
};

export const isCommentEditor = (editor) => {
  return editor.editorType === COMMENT_EDITOR;
};

export const generateImageInfos = (files) => {
  const newFiles = Array.from(files);

  const imgInfos = newFiles.filter(item => {
    if (item && !item.type.startsWith('image/')) return false;
    if (item && item.type === 'image/svg+xml') return false;
    return true;
  }).map(file => {
    const url = window.URL.createObjectURL(file);
    const file_uuid = slugId.nice();
    ImageCache.saveImage(file_uuid, file);
    return { src: url, file_uuid: file_uuid };
  });
  return imgInfos;
};

export const removeImageBlockNode = (editor, path) => {
  Transforms.removeNodes(editor, { at: path });
  const p = generateEmptyElement(ELEMENT_TYPE.PARAGRAPH);
  Transforms.insertNodes(editor, p, { at: path });
  focusEditor(editor, path);
};
