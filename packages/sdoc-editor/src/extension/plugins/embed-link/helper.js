import { Editor, Path, Range, Transforms } from '@seafile/slate';
import { ReactEditor } from '@seafile/slate-react';
import slugid from 'slugid';
import { CODE_BLOCK, INSERT_POSITION, SUBTITLE, TITLE, LIST_ITEM, CHECK_LIST_ITEM, MULTI_COLUMN, BLOCKQUOTE, CALL_OUT, TOGGLE_CONTENT, TOGGLE_TITLE_TYPES } from '../../constants';
import { EMBED_LINK } from '../../constants/element-type';
import { focusEditor, generateDefaultParagraph, getNode, getNodeType, getParentNode, getSelectedNodeEntryByType, isTextNode } from '../../core';
import { EMBED_LINK_SOURCE } from './constants';

export const isInsertEmbedLinkDisabled = (editor, readonly) => {
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

      if (TOGGLE_TITLE_TYPES.includes(type)) return true;
      if (type === CODE_BLOCK) return true;
      if (type.startsWith('header')) return true;
      if (type === TITLE) return true;
      if (type === SUBTITLE) return true;
      if (type === LIST_ITEM) return true;
      if (type === CHECK_LIST_ITEM) return true;
      if (type === MULTI_COLUMN) return true;
      if (type === BLOCKQUOTE) return true;
      if (type === CALL_OUT) return true;
      if (Editor.isVoid(editor, n)) return true;

      return false;
    },
    universal: true,
  });

  if (match) return true;

  return false;
};

export const getEmbedLinkType = (text) => {
  const link = text.trim();
  try {
    const url = new URL(link);
    const host = url.hostname.toLowerCase();
    const path = url.pathname.toLowerCase();
    // SeaTable
    const isSeaTable =
      /(^|\.)seatable\.cn$/.test(host) &&
      /^\/workspace\/\d+\/dtable\/.+/.test(path);

    if (isSeaTable) return EMBED_LINK_SOURCE.SEATABLE;

    // Figma
    const isFigma =
      /(^|\.)figma\.com$/.test(host) &&
      /^\/(design|file|proto|board|slides)\//.test(path);

    if (isFigma) return EMBED_LINK_SOURCE.FIGMA;

    return null;
  } catch (e) {
    return null;
  }
};

export const normalizeFigmaEmbedLink = (text) => {
  const link = text.trim();
  try {
    const url = new URL(link);
    const host = url.hostname.toLowerCase();

    if (host === 'embed.figma.com') {
      return url.toString();
    }

    if (!/(^|\.)figma\.com$/i.test(host)) return null;
    if (!/^\/(design|file|proto|board|slides)\//i.test(url.pathname)) return null;

    const embedUrl = new URL(url);
    embedUrl.hostname = 'embed.figma.com';
    embedUrl.searchParams.delete('t');
    embedUrl.searchParams.set('embed-host', 'share');

    return embedUrl.toString();
  } catch (e) {
    return null;
  }
};

export const generateEmbedLinkNode = (link, type) => {
  const embedLinkNode = {
    id: slugid.nice(),
    type: EMBED_LINK,
    link: link,
    link_type: type,
    children: [{
      id: slugid.nice(),
      text: '',
    }],
  };

  return embedLinkNode;
};

export const insertEmbedLink = (editor, link, type) => {
  if (isInsertEmbedLinkDisabled(editor)) return;
  if (editor.selection == null) return;

  const embedLinkNode = generateEmbedLinkNode(link, type);
  let path = editor.selection?.anchor.path;

  // When inserting embed link in the toggle content, insert current
  const currentToggleContentEntry = getSelectedNodeEntryByType(editor, TOGGLE_CONTENT);
  if (currentToggleContentEntry) {
    Transforms.insertNodes(editor, embedLinkNode, { at: path.slice(0, -1) });
    Transforms.select(editor, Editor.start(editor, path));
    ReactEditor.focus(editor);
    return;
  }


  const position = 'after';
  if (position === INSERT_POSITION.AFTER) {
    Transforms.insertNodes(editor, embedLinkNode, { at: [path[0] + 1] });
    const nextPath = Path.next([path[0] + 1]);
    if (!getNode(editor, nextPath)) {
      Transforms.insertNodes(editor, generateDefaultParagraph(), { at: nextPath });
    }
    const endOfFirstNode = Editor.start(editor, nextPath);
    const range = {
      anchor: endOfFirstNode,
      focus: endOfFirstNode,
    };
    focusEditor(editor, range);
    return;
  }
};
