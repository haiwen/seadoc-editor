import { Editor, Transforms, Node } from '@seafile/slate';
import { ReactEditor } from '@seafile/slate-react';
import slugid from 'slugid';
import { FULL_WIDTH_MODE } from '../../../constants';
import { getStyleByFullWidthMode } from '../../../utils/full-width-mode';
import LocalStorage from '../../../utils/local-storage-utils';
import { ELEMENT_TYPE, IMAGE, IMAGE_BLOCK, INSERT_POSITION, PARAGRAPH } from '../../constants';
import { findPath, getSelectedNodeEntryByType } from '../../core';
import { COLUMN_MIN_WIDTH, LAST_COLUMN_MARGIN_RIGHT_WIDTH } from './constants';

export const insertMultiColumn = (editor, selection, position = INSERT_POSITION.CURRENT, type) => {
  const multiColumnNode = generateEmptyMultiColumn(editor, type);
  const validSelection = selection || editor.selection;
  const path = Editor.path(editor, validSelection);
  handleInsertMultiColumn(editor, position, path, multiColumnNode);
};

export const generateEmptyMultiColumn = (editor, MultiColumnType) => {
  let columnNodes = [];
  let column = [];
  let multiColumnNumber;

  switch (MultiColumnType) {
    case ELEMENT_TYPE.TWO_COLUMN:
      multiColumnNumber = 2;
      break;
    case ELEMENT_TYPE.THREE_COLUMN:
      multiColumnNumber = 3;
      break;
    case ELEMENT_TYPE.FOUR_COLUMN:
      multiColumnNumber = 4;
      break;
    case ELEMENT_TYPE.FIVE_COLUMN:
      multiColumnNumber = 5;
      break;
    default:
      break;
  }
  const currentPageWidth = getCurrentPageWidth(editor) + LAST_COLUMN_MARGIN_RIGHT_WIDTH;
  const initialColumnWidth = Math.max(COLUMN_MIN_WIDTH, parseInt(currentPageWidth / multiColumnNumber));
  for (let i = 0; i < multiColumnNumber; i++) {
    const columnWidthKey = slugid.nice();
    column.push({ key: columnWidthKey, width: initialColumnWidth });
    const columnWidth = column.find(col => col.key === columnWidthKey).width;
    columnNodes.push({
      id: columnWidthKey,
      type: ELEMENT_TYPE.COLUMN,
      width: columnWidth,
      children: [{
        id: slugid.nice(),
        type: PARAGRAPH,
        children: [{ text: '', id: slugid.nice() }],
      }]
    });
  }

  return {
    id: slugid.nice(),
    type: ELEMENT_TYPE.MULTI_COLUMN,
    children: columnNodes,
    column,
    style: { gridTemplateColumns: `repeat(${multiColumnNumber}, ${initialColumnWidth}px)` }
  };
};

export const updateColumnWidth = (editor, element, column, newPath) => {
  const path = findPath(editor, element, newPath);
  const gridTemplateColumns = column.map(column => `${column.width}px`).join(' ');
  Transforms.setNodes(editor, { column: column, style: { gridTemplateColumns } }, { at: path });
};

export const handleInsertMultiColumn = (editor, insertPosition, path, multiColumnNode) => {
  const { selection } = editor;
  if (!selection) return;

  let insertPath;
  if (insertPosition === INSERT_POSITION.BEFORE) {
    insertPath = [path[0]];
    Transforms.insertNodes(editor, multiColumnNode, { at: insertPath });
  } else if (insertPosition === INSERT_POSITION.AFTER) {
    insertPath = [path[0] + 1];
    Transforms.insertNodes(editor, multiColumnNode, { at: insertPath });
  } else if (insertPosition === INSERT_POSITION.CURRENT) {
    // Insert a new multi_column on the next line if insertion operation happens in existed multi_column
    const currentMultiColumnEntry = getSelectedNodeEntryByType(editor, ELEMENT_TYPE.MULTI_COLUMN);
    if (currentMultiColumnEntry) {
      Transforms.splitNodes(editor, { at: selection });
      insertPath = [selection.anchor.path[0] + 1];
      Transforms.insertNodes(editor, multiColumnNode, { at: insertPath });
    }
    // If there are multiple children in the editor, insert the new multi-column node at the current selection
    if (editor.children.length !== 1 && !currentMultiColumnEntry) {
      Transforms.insertNodes(editor, multiColumnNode, { at: selection });
      Transforms.removeNodes(editor, { at: [path[0]] });
    }
    // If there is only one children in the editor, insert the new multi-column node at the next line
    if (editor.children.length === 1 && !currentMultiColumnEntry) {
      Transforms.splitNodes(editor, { at: selection });
      Transforms.insertNodes(editor, multiColumnNode, { at: selection });
      insertPath = [selection.anchor.path[0] + 1];
    }
  }

  Transforms.select(editor, Editor.start(editor, insertPath));
  ReactEditor.focus(editor);
};

export const updateColumnWidthOnDeletion = (editor, selection, column, deletionDirection, isDragged = false) => {
  const multiColumnPath = !isDragged ? [selection.anchor.path[0]] : [selection[0]];
  const newMultiColumnNode = Node.get(editor, multiColumnPath);
  const targetColumnIndex = !isDragged ? (selection.anchor.path[1] + (deletionDirection === 'deleteForward' ? 1 : 0))
    : (selection[1] + (deletionDirection === 'deleteForward' ? 1 : 0));
  const remainingColumn = column.filter((_, index) => index !== targetColumnIndex);
  const currentPageWidth = getCurrentPageWidth(editor);
  const columnWidth = Math.max(COLUMN_MIN_WIDTH, parseInt(currentPageWidth / remainingColumn.length));

  // Recalculate width of every left column
  const newColumn = remainingColumn.map((column, index) => ({
    ...column,
    left: index * columnWidth,
    width: columnWidth
  }));
  updateColumnWidth(editor, newMultiColumnNode, newColumn, multiColumnPath);
};

export const getCurrentPageWidth = (editor) => {
  const sdocEditorPage = document.getElementById('sdoc-editor');

  let pageWidth;
  pageWidth = sdocEditorPage?.getBoundingClientRect().width;

  // Get pageWidth if on is_full_width mode
  if (LocalStorage.getItem(FULL_WIDTH_MODE)) {
    const sdocEditorPageContent = document.getElementsByClassName('sdoc-editor-page-content')[0];
    const pageContentWidth = sdocEditorPageContent?.getBoundingClientRect().width;

    const pageWidthString = getStyleByFullWidthMode(undefined, editor)?.width;
    const numbers = pageWidthString.match(/\d+/g).map(Number);

    // 120 is padding and 2 is border width of 'sdoc-editor' dom;
    pageWidth = pageContentWidth - numbers.slice(1).reduce((sum, num) => sum + num, 0) - 120 - 2;
  }

  return pageWidth;
};

export const hasImageInColumn = (editor, columnPath) => {
  for (const [node] of Editor.nodes(editor, { at: columnPath })) {
    if ([IMAGE_BLOCK, IMAGE].includes(node?.type)) {
      return true;
    }
  }
  return false;
};
