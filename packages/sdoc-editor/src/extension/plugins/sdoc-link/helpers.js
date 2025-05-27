import { Editor, Transforms, Range, Text, Path, Node } from '@seafile/slate';
import { ReactEditor } from '@seafile/slate-react';
import copy from 'copy-to-clipboard';
import slugid from 'slugid';
import context from '../../../context';
import { SDOC_LINK, LINK, INSERT_FILE_DISPLAY_TYPE, CODE_BLOCK, CODE_LINE, PARAGRAPH, FILE_LINK_INSET_INPUT_TEMP, HEADERS, TITLE, SUBTITLE } from '../../constants';
import { focusEditor, generateEmptyElement, getNodeType, getSelectedElems } from '../../core';
import { isSelectionInHeader } from '../header/helpers';

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

export const generateSdocFileNode = (uuid, text = '') => {
  const sdocFileName = text.replace(/\.sdoc$/, '');
  const sdocFileNode = {
    id: slugid.nice(),
    type: SDOC_LINK,
    doc_uuid: uuid,
    title: sdocFileName,
    display_type: INSERT_FILE_DISPLAY_TYPE[1],
    children: [{
      id: slugid.nice(),
      text: sdocFileName
    }],
  };
  return sdocFileNode;
};

export const getType = (editor) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => getNodeType(n) === LINK,
    universal: true,
  });

  if (!match) return PARAGRAPH;
  const [n] = match;

  return getNodeType(n);
};

export const insertSdocFileLink = (editor, text, uuid) => {
  if (isMenuDisabled(editor)) return;
  // Selection folded or not
  const { selection } = editor;
  if (selection == null) return;
  const isCollapsed = Range.isCollapsed(selection);

  // Remove shortcut symbol,if trigger by shortcut
  removeShortCutSymbol(editor);

  const sdocFileNode = generateSdocFileNode(uuid, text);
  if (isCollapsed) {
    const { anchor, focus } = editor.selection;
    const [targetNode,] = Editor.node(editor, editor.selection, { depth: 2 }) || [];

    // When the current cursor position is on a link, change the position to after the link
    if (targetNode && targetNode.type === SDOC_LINK && anchor.path.length === 3) {
      editor.selection = {
        anchor: { offset: anchor.offset, path: [anchor.path[0], anchor.path[1] + 1] },
        focus: { offset: focus.offset, path: [focus.path[0], focus.path[1] + 1] }
      };
    }

    Transforms.insertNodes(editor, sdocFileNode);
  } else {
    const selectedText = Editor.string(editor, selection); // Selected text
    if (selectedText !== text) {
      // If the selected text is different from the typed text, delete the text and insert the link
      editor.deleteFragment();
      Transforms.insertNodes(editor, sdocFileNode);
    } else {
      // If the selected text is the same as the entered text, only the link can be wrapped
      Transforms.wrapNodes(editor, sdocFileNode, { split: true });
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

export const getNewFileListData = (fileListData, indexId, children) => {
  fileListData.forEach((item) => {
    if (item.indexId === indexId) {
      item.children = children;
    }
    if (item?.children) {
      getNewFileListData(item.children, indexId, children);
    }
  });
  return fileListData;
};

export const getUrl = (uuid) => {
  return context.getSdocLocalFileUrl(uuid);
};

export const onCopySdocLinkNode = (editor, element) => {
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

export const getBeforeText = (editor) => {
  const { selection } = editor;
  if (selection == null) return { beforeText: '', range: null };
  const { anchor } = selection;
  // Find the near text node above the current text
  const [[, beforeNodePath]] = Editor.nodes(editor, {
    match: node => Text.isText(node),
    mode: 'lowest'
  });
  const beforeNodeStartPoint = Editor.start(editor, beforeNodePath); // The starting position of the text node
  const range = { anchor, focus: beforeNodeStartPoint };
  const beforeText = Editor.string(editor, range) || '';
  return { beforeText, range };
};

export const isTriggeredByShortcut = (editor) => {
  if (isSelectionInHeader(editor)) {
    return false;
  }
  const { beforeText } = getBeforeText(editor);
  const fileSearchInput = getFileSearchInputEntry(editor);
  if (fileSearchInput) return false;
  return beforeText.endsWith('[');
};

// If insert operation is triggered by shortcut, remove the '[[' symbol
export const removeShortCutSymbol = (editor) => {
  // Check is trigger by short cut
  const { selection } = editor;
  const { beforeText, range: beforeRange } = getBeforeText(editor);
  const isTriggeredByShortCut = beforeText.slice(-2) === '[[';
  isTriggeredByShortCut && Transforms.delete(editor, {
    at: {
      anchor: {
        path: beforeRange.focus.path,
        offset: beforeText.length - 2
      },
      focus: { ...selection.focus }
    },
    voids: true
  });
  focusEditor(editor);
};

// Generate temp input for collecting file name
const generateFileLinkInput = () => {
  const input = generateEmptyElement(FILE_LINK_INSET_INPUT_TEMP);
  return input;
};

// Insert temp input collecting file name
export const insertTempInput = (editor) => {
  const { selection } = editor;
  if (!Range.isCollapsed(selection)) return;
  const tempInput = generateFileLinkInput();
  const insertPoint = Editor.start(editor, selection);
  Transforms.insertNodes(editor, tempInput, { at: insertPoint });
  const path = Editor.path(editor, insertPoint);
  const insertPath = Path.next(path);
  const focusPoint = insertPath.concat(0);
  focusEditor(editor, focusPoint);
};

// Remove temp input collecting file name
export const removeTempInput = (editor, element) => {
  const path = ReactEditor.findPath(editor, element);
  Transforms.delete(editor, { at: path });
};

export const getFileSearchInputEntry = (editor) => {
  const [searchInputNodeEntry] = Editor.nodes(editor, {
    match: n => n.type === FILE_LINK_INSET_INPUT_TEMP,
  });
  return searchInputNodeEntry;
};

// Insert text when remove file name collector, such as inserting 'filename' into prevNode when close collector entered '[[filename'
export const insertTextWhenRemoveFileNameCollector = (editor, searchInputNode) => {
  const inputNodePath = ReactEditor.findPath(editor, searchInputNode);
  if (!inputNodePath) return;
  const prevNodeEntry = Editor.previous(editor, { at: inputNodePath });
  if (!prevNodeEntry) return;
  const searchContent = Node.string(searchInputNode);
  const insertPoint = Editor.end(editor, prevNodeEntry[1]);
  Transforms.insertText(editor, searchContent, { at: insertPoint });
  removeTempInput(editor, searchInputNode);
};

export const getSdocFileIcon = () => {
  const server = context.getSetting('serviceUrl');
  return `${server}/media/img/file/256/sdoc.png`;
};

export const getSdocLinkEntry = (editor, at = editor.selection) => {
  const aboveNodeEntry = Editor.above(editor, {
    match: (n) => n.type === SDOC_LINK,
    mode: 'highest',
    at
  });
  return aboveNodeEntry;
};
