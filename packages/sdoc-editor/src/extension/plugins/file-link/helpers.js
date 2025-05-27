import { Editor, Transforms, Range } from '@seafile/slate';
import { ReactEditor } from '@seafile/slate-react';
import copy from 'copy-to-clipboard';
import slugid from 'slugid';
import context from '../../../context';
import { FILE_LINK, INSERT_FILE_DISPLAY_TYPE, CODE_BLOCK, CODE_LINE, LINK, PARAGRAPH, HEADERS, SUBTITLE, TITLE } from '../../constants';
import { getNodeType, getSelectedElems } from '../../core';

export const isMenuDisabled = (editor, readonly) => {
  if (readonly) return true;
  if (editor.selection == null) return true;

  const selectedElems = getSelectedElems(editor);
  const notMatch = selectedElems.some(elem => {
    const { type } = elem;
    if (editor.isVoid(elem)) return true;
    if ([CODE_BLOCK, CODE_LINE, LINK, TITLE, SUBTITLE, ...HEADERS].includes(type)) return true;
    return false;
  });
  if (notMatch) return true; // disabled
  return false; // enable
};

export const generateFileNode = (uuid, text) => {
  const fileNode = {
    id: slugid.nice(),
    type: FILE_LINK,
    doc_uuid: uuid,
    title: text,
    display_type: INSERT_FILE_DISPLAY_TYPE[0],
    children: [{
      id: slugid.nice(),
      text: text || ''
    }],
  };
  return fileNode;
};

export const getType = (editor) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => getNodeType(n) === FILE_LINK,
    universal: true,
  });

  if (!match) return PARAGRAPH;
  const [n] = match;

  return getNodeType(n);
};

export const insertFileLink = (editor, text, uuid) => {
  if (isMenuDisabled(editor)) return;
  // Selection folded or not
  const { selection } = editor;
  if (selection == null) return;
  const isCollapsed = Range.isCollapsed(selection);
  if (isCollapsed) {
    const fileNode = generateFileNode(uuid, text);
    Transforms.insertNodes(editor, fileNode);
  } else {
    const selectedText = Editor.string(editor, selection); // Selected text
    if (selectedText !== text) {
      // If the selected text is different from the typed text, delete the text and insert the link
      editor.deleteFragment();

      const fileNode = generateFileNode(uuid, text);
      Transforms.insertNodes(editor, fileNode);
    } else {
      // If the selected text is the same as the entered text, only the link can be wrapped
      const fileNode = generateFileNode(uuid, text);
      Transforms.wrapNodes(editor, fileNode, { split: true });
      Transforms.collapse(editor, { edge: 'end' });
    }
  }
};

export const unwrapLinkNode = (editor, element) => {
  if (editor.selection == null) return;

  const path = ReactEditor.findPath(editor, element);
  if (path) {
    Transforms.unwrapNodes(editor, { at: path });
  }
};

export const getUrl = (uuid) => {
  return context.getSdocLocalFileUrl(uuid);
};

export const onCopyFileLinkNode = (editor, element) => {
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

export const getFileLinkEntry = (editor, at = editor.selection) => {
  const aboveNodeEntry = Editor.above(editor, {
    match: (n) => n.type === FILE_LINK,
    mode: 'highest',
    at
  });
  return aboveNodeEntry;
};
