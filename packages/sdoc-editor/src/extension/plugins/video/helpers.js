import { Editor, Range, Transforms, Path, Node } from '@seafile/slate';
import { ReactEditor } from '@seafile/slate-react';
import copy from 'copy-to-clipboard';
import urlJoin from 'url-join';
import context from '../../../context';
import { CODE_BLOCK, ELEMENT_TYPE, VIDEO, INSERT_POSITION, PARAGRAPH, SUBTITLE, TITLE, LIST_ITEM, CHECK_LIST_ITEM, MULTI_COLUMN, BLOCKQUOTE, CALL_OUT, TABLE } from '../../constants';
import { generateEmptyElement, getNodeType, isTextNode, isLastNode, getParentNode, focusEditor, getAboveBlockNode, generateDefaultParagraph } from '../../core';
import { ONE_GB, ONE_MB, ONE_KB } from './constants';

export const isInsertVideoMenuDisabled = (editor, readonly) => {
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
      if (type === MULTI_COLUMN) return true;
      if (type === BLOCKQUOTE) return true;
      if (type === CALL_OUT) return true;
      if (type === TABLE) return true;
      if (Editor.isVoid(editor, n)) return true;

      return false;
    },
    universal: true,
  });

  if (match) return true;

  return false;
};

export const generateVideoNode = (src, videoInfo) => {
  const element = generateEmptyElement(VIDEO);
  const { name, size, is_embeddable_link } = videoInfo;
  return [{ ...element, data: { src, name, size, is_embeddable_link } }];
};

export const parseVideoLink = (url) => {
  if (!url) return false;

  // Youtube url conversion
  if (url.includes('youtube.com')) {
    const videoId = new URL(url).searchParams.get('v');
    const videoUrl = videoId ? `https://www.youtube.com/embed/${videoId}/?rel=0` : false;
    return videoUrl;
  }

  // Tencent url conversion
  if (url.includes('v.qq.com')) {
    const vidMatch = url.match(/\/([^\/]+)\.html/);
    const videoUrl = vidMatch?.[1] ? `https://v.qq.com/txp/iframe/player.html?vid=${vidMatch[1]}` : false;
    return videoUrl;
  }

  // Bilibili url conversion
  if (url.includes('bilibili.com')) {
    const vidMatch = url.match(/\/video\/(BV[0-9A-Za-z]+)/);
    const videoUrl = vidMatch?.[1] ? `https://player.bilibili.com/player.html?bvid=${vidMatch[1]}` : false;
    return videoUrl;
  }

  // Youku url conversion
  if (url.includes('v.youku.com')) {
    const vidMatch = url.match(/id_([A-Za-z0-9=]+)\.html/);
    const videoUrl = vidMatch?.[1] ? `https://player.youku.com/embed/${vidMatch[1]}` : false;
    return videoUrl;
  }

  // Unsupported url
  return false;
};

export const insertVideo = (editor, videoFiles, srcList, selection, position = INSERT_POSITION.CURRENT) => {
  if (!srcList) return;
  if (position !== INSERT_POSITION.AFTER) {
    if (isInsertVideoMenuDisabled(editor)) return;
  }

  const videoInfo = { name: videoFiles[0].name || null, size: videoFiles[0].size || null, is_embeddable_link: videoFiles[0].isEmbeddableLink || false };
  let videoNodes;
  // Return when embedding an invalid youtube, tencent or bilibili video url
  if (videoInfo.is_embeddable_link) {
    const parsedSrc = parseVideoLink(srcList[0]);
    if (!parsedSrc) return;
    videoNodes = generateVideoNode(parsedSrc, videoInfo);
  } else {
    videoNodes = generateVideoNode(srcList[0], videoInfo);
  }

  const validSelection = selection || editor.selection;
  let path = Editor.path(editor, validSelection);

  if (position === INSERT_POSITION.AFTER) {
    const p = generateEmptyElement(ELEMENT_TYPE.PARAGRAPH);
    videoNodes.forEach((item, index) => {
      p.children[index] = item;
    });
    Transforms.insertNodes(editor, p, { at: [path[0] + 1] });
    focusEditor(editor, [path[0] + 1, 2]);
    return;
  }

  const aboveNodeEntry = getAboveBlockNode(editor);
  const nodePath = [aboveNodeEntry[1][0]];
  const nextPath = Path.next(nodePath);
  const isEmptyParagraph = aboveNodeEntry[0].type === PARAGRAPH && Node.string(aboveNodeEntry[0]).length === 0;
  if (videoNodes.length === 1 && isEmptyParagraph) {
    Transforms.setNodes(editor, videoNodes[0], { at: validSelection });
    Transforms.insertNodes(editor, generateDefaultParagraph(), { at: nextPath });
    const endOfFirstNode = Editor.start(editor, nextPath);
    const range = {
      anchor: endOfFirstNode,
      focus: endOfFirstNode,
    };

    focusEditor(editor, range);
    return;
  }

  let videoEndSelection;
  if (isLastNode(editor, aboveNodeEntry[0]) && Editor.isEnd(editor, validSelection.anchor, [validSelection.anchor.path[0]])) {
    // Insert video into empty paragraph node at the end if in the last position
    Transforms.splitNodes(editor, { at: selection, always: true });
    Transforms.insertNodes(editor, videoNodes[0], { at: validSelection });
    Transforms.insertNodes(editor, generateDefaultParagraph(), { at: [nextPath[0] + 1] });
    videoEndSelection = [nextPath[0] + 1];
  } else {
    Transforms.splitNodes(editor, { at: selection, always: true });
    Transforms.insertNodes(editor, videoNodes[0], { at: validSelection });
    videoEndSelection = Editor.start(editor, Path.next(nextPath));
  }

  focusEditor(editor, videoEndSelection);
};

export const getVideoURL = (data, editor) => {
  const { src: url } = data;

  if (url && url.startsWith('http')) return url;

  const serviceUrl = context.getSetting('serviceUrl');
  let assetsUrl = context.getSetting('assetsUrl');

  // If in sdoc link preview
  const docUuid = editor.preview_docUuid;

  if (docUuid) {
    const baseUrl = assetsUrl.split('/');
    baseUrl[baseUrl.length - 1] = docUuid;
    assetsUrl = baseUrl.join('/');
  }
  return urlJoin(serviceUrl, assetsUrl, url);
};

export const formatFileSize = (size) => {
  if (typeof size !== 'number') {
    return '';
  }
  if (size >= ONE_GB) {
    return (size / (ONE_GB)).toFixed(1) + ' G';
  }
  if (size >= ONE_MB) {
    return (size / (ONE_MB)).toFixed(1) + ' M';
  }
  if (size >= ONE_KB) {
    return (size / ONE_KB).toFixed(1) + ' K';
  }
  return size.toFixed(1) + ' B';
};

export const videoFileIcon = () => {
  const server = context.getSetting('serviceUrl');
  return `${server}/media/img/file/256/video.png`;
};

export const onCopyVideoNode = (editor, element) => {
  if (editor.selection == null || Range.isExpanded(editor.selection)) return;

  const p = ReactEditor.findPath(editor, element);
  Transforms.select(editor, p);
  const newData = editor.setFragmentData(new DataTransfer());
  copy('copy', {
    onCopy: (clipboardData) => {
      newData.types.forEach((type) => {
        const data = newData.getData(type);
        clipboardData.setData(type, data);
      });
    }
  });
};
