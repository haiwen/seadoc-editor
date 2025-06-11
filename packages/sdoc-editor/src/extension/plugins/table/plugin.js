import { Editor, Transforms, Path, Element, Range } from '@seafile/slate';
import { ReactEditor } from '@seafile/slate-react';
import isHotkey from 'is-hotkey';
import { INTERNAL_EVENT } from '../../../constants';
import EventBus from '../../../utils/event-bus';
import ObjectUtils from '../../../utils/object-utils';
import { ELEMENT_TYPE, KEYBOARD, PARAGRAPH, CLIPBOARD_FORMAT_KEY, CHECK_LIST_ITEM, ORDERED_LIST, UNORDERED_LIST, TABLE_ROW, TABLE, TABLE_CELL } from '../../constants';
import { getNodeType, getParentNode, getSelectedNodeByType, isLastNode, generateEmptyElement, focusEditor, getAboveBlockNode, isRangeAcrossBlocks, getStartPoint, getEndPoint, isStartPoint, isEndPoint, getTopLevelBlockNode } from '../../core';
import { TABLE_MAX_ROWS, EMPTY_SELECTED_RANGE, TABLE_ELEMENT, TABLE_ELEMENT_POSITION, TABLE_CELL_MIN_WIDTH, TABLE_ROW_MIN_HEIGHT } from './constants';
import { getSelectedInfo, insertTableElement, removeTable, insertMultipleRowsAndColumns, setTableFragmentData,
  deleteTableRangeData, focusCell, deleteHandler, isTableLocation, isLastTableCell,
  deleteTableSelectCells,
  isAllInTable,
  isInTableSameCell } from './helpers';

const withTable = (editor) => {
  const { insertBreak, deleteBackward, deleteForward, insertData, selectAll, normalizeNode, handleTab, getFragment,
    setFragmentData, insertFragment, deleteFragment } = editor;
  const newEditor = editor;
  newEditor.tableSelectedRange = EMPTY_SELECTED_RANGE;
  const eventBus = EventBus.getInstance();

  newEditor.tableOnKeyDown = (event) => {
    // Handle special keyboard events
    if (isHotkey('mod+a', event)) {
      event.preventDefault();
      const { table, tableSize } = getSelectedInfo(newEditor);
      const allTableRange = {
        minRowIndex: 0,
        maxRowIndex: tableSize[0] - 1,
        minColIndex: 0,
        maxColIndex: tableSize[1] - 1,
      };
      newEditor.tableSelectedRange = allTableRange;
      eventBus.dispatch(INTERNAL_EVENT.SET_TABLE_SELECT_RANGE, table, allTableRange);
    }

    if (isHotkey(KEYBOARD.UP, event)) {
      focusCell(newEditor, event, KEYBOARD.UP);
    }

    if (isHotkey(KEYBOARD.RIGHT, event)) {
      focusCell(newEditor, event, KEYBOARD.RIGHT);
    }

    if (isHotkey(KEYBOARD.DOWN, event)) {
      focusCell(newEditor, event, KEYBOARD.DOWN);
    }

    if (isHotkey(KEYBOARD.LEFT, event)) {
      focusCell(newEditor, event, KEYBOARD.LEFT);
    }

    if (isHotkey('tab', event)) {
      event.preventDefault();
    }

    if (isHotkey('shift+enter', event)) {
      event.preventDefault();
      const [, tablePath] = getAboveBlockNode(newEditor);
      const focusPath = [tablePath[0] + 1];
      const focusPoint = Editor.start(newEditor, focusPath );
      focusEditor(newEditor, focusPoint);
    }
  };

  newEditor.insertBreak = () => {
    const selectedNode = getSelectedNodeByType(newEditor, ELEMENT_TYPE.TABLE);
    if (selectedNode != null) {
      newEditor.insertText('\n\uFEFF'); // If table is selected, wrap in cell
      return;
    }
    insertBreak();
  };

  newEditor.deleteBackward = unit => {
    const deleteType = deleteHandler(newEditor);
    if (deleteType === 'table') {
      const { tablePath } = getSelectedInfo(editor);
      removeTable(editor, tablePath);
      return;
    }

    // range selection delete
    if (deleteType === 'range') {
      deleteTableRangeData(newEditor);
      return;
    }

    if (deleteType === 'default') return;

    const { selection } = newEditor;
    if (selection) {
      const before = Editor.before(newEditor, selection);
      if (before) {
        const isTableOnBeforeLocation = isTableLocation(newEditor, before);
        const isTableOnCurSelection = isTableLocation(newEditor, selection);
        // If the current is not a table and the previous one is a table.
        if (isTableOnBeforeLocation && !isTableOnCurSelection) {
          const [currentNodeEntry] = Editor.nodes(editor, {
            match: n => Element.isElement(n) && !Editor.parent(n, ReactEditor.findPath(editor, n))[1].length
          });

          if (!currentNodeEntry) return;

          const [currentNode, currentPath] = Array.from(currentNodeEntry);

          // If the current is paragraph.
          if (currentNode.type === PARAGRAPH) {
            const { path } = before;
            Transforms.select(editor, {
              anchor: {
                offset: 0,
                path: [path[0], 0, 0, 0]
              },
              focus: {
                offset: 0,
                path: [path[0], 0, 0, 0]
              }
            });
            const beforeTable = Editor.node(editor, [path[0]]);
            const beforeRow = Editor.node(editor, [path[0], path[1]]);
            const tableSize = [beforeTable[0].children.length, beforeRow[0].children.length];
            const allTableRange = {
              minRowIndex: 0,
              maxRowIndex: tableSize[0] - 1,
              minColIndex: 0,
              maxColIndex: tableSize[1] - 1,
            };
            newEditor.tableSelectedRange = allTableRange;
            eventBus.dispatch(INTERNAL_EVENT.SET_TABLE_SELECT_RANGE, beforeTable[0], allTableRange);
            return;
          }

          // If deleting node is empty check-list, order-list, unordered-list, change to paragraph
          const transformTypes = [CHECK_LIST_ITEM, ORDERED_LIST, UNORDERED_LIST];
          if (transformTypes.includes(currentNode.type)) {
            Transforms.delete(newEditor, { at: currentPath });
            Transforms.insertNodes(newEditor, generateEmptyElement(PARAGRAPH), { at: currentPath });
            focusEditor(editor, Editor.start(editor, currentPath));
          }
          return;
        }
      }
    }

    deleteBackward(unit);
  };

  newEditor.deleteFragment = (unit) => {
    const { selection } = editor;
    if (!selection) {
      return deleteFragment(unit);
    }

    const match = (n) => n.type === TABLE;
    if (Range.isRange(selection) && isRangeAcrossBlocks(editor, { at: selection, match })) {
      const anchorEntry = getAboveBlockNode(editor, { at: selection.anchor, match });
      if (anchorEntry) {
        const columnLength = anchorEntry[0].columns.length;
        const { anchor } = selection;
        const isForward = Range.isForward(selection);
        if (isForward) {
          if (!isStartPoint(editor, anchor, anchorEntry[1])) {
            // delete table cells
            const endPoint = getEndPoint(editor, anchorEntry[1]);
            deleteTableSelectCells(editor, { start: anchor.path, end: endPoint.path, columnLength });

            // delete other module
            const newAnchor = getStartPoint(editor, Path.next(anchorEntry[1]));
            Transforms.delete(editor, { at: { ...selection, anchor: newAnchor } });
            focusEditor(editor, newAnchor.path);
            return;
          }
        } else {
          if (!isEndPoint(editor, anchor, anchorEntry[1])) {
            // delete table cells
            const startPoint = getStartPoint(editor, anchorEntry[1]);
            deleteTableSelectCells(editor, { start: startPoint.path, end: anchor.path, columnLength });

            // delete other module
            const newAnchor = getEndPoint(editor, Path.previous(anchorEntry[1]));
            Transforms.delete(editor, { at: { ...selection, anchor: newAnchor } });
            focusEditor(editor, newAnchor.path);
            return;
          }
        }
      } else {
        const focusEntry = getAboveBlockNode(editor, { at: selection.focus, match });
        const columnLength = focusEntry[0].columns.length;
        if (focusEntry) {
          const { focus } = selection;
          const isForward = Range.isForward(selection);
          if (isForward) {
            if (!isEndPoint(editor, focus, focusEntry[1])) {
              const startPoint = getStartPoint(editor, focusEntry[1]);
              deleteTableSelectCells(editor, { start: startPoint.path, end: focus.path, columnLength });

              // delete other module
              const newFocus = getEndPoint(editor, Path.previous(focusEntry[1]));
              Transforms.delete(editor, { at: { ...selection, focus: newFocus } });
              focusEditor(editor, focus.path);
              return;
            }
          } else {
            if (!isEndPoint(editor, focus, focusEntry[1])) {
              const endPoint = getEndPoint(editor, focusEntry[1]);
              deleteTableSelectCells(editor, { start: focus.path, end: endPoint.path, columnLength });

              // delete other module
              const newFocus = getStartPoint(editor, Path.next(focusEntry[1]));
              Transforms.delete(editor, { at: { ...selection, focus: newFocus } });
              focusEditor(editor, focus.path);
              return;
            }
          }
        }
      }
    }

    if (Range.isRange(selection) && isAllInTable(editor) && !isInTableSameCell(editor)) {
      const [node] = getTopLevelBlockNode(editor);
      if (Range.isRange(selection) && node?.type === ELEMENT_TYPE.TABLE) {
        newEditor.deleteBackward();
        return;
      }
    }

    deleteFragment(unit);
  };

  newEditor.deleteForward = (unit) => {
    const nextNode = Editor.next(newEditor);
    const newNodeParent = getParentNode(newEditor.children, nextNode[0].id);
    if (newNodeParent.type === ELEMENT_TYPE.TABLE_CELL) return;

    deleteForward(unit);
  };

  newEditor.getFragment = () => {
    const selectedNode = getSelectedNodeByType(newEditor, ELEMENT_TYPE.TABLE);
    if (!selectedNode) {
      return getFragment();
    }

    const { tableSelectedRange } = newEditor;
    if (ObjectUtils.isSameObject(tableSelectedRange, EMPTY_SELECTED_RANGE)) {
      const fragment = getFragment();

      // When a cell is selected, it should be converted to text
      return [
        Object.freeze({
          children: fragment[0].children[0].children[0]['children'],
          id: fragment[0]['id'],
          type: ELEMENT_TYPE.PARAGRAPH,
        })
      ];
    }

    const { minColIndex, maxColIndex, minRowIndex, maxRowIndex } = tableSelectedRange;
    const rows = selectedNode.children;
    const columns = selectedNode.columns;
    let selectedRows = [];
    let selectedColumns = [];
    for (let i = minRowIndex; i <= maxRowIndex; i++) {
      const row = rows[i];
      const rowChildren = row.children;
      let newRowChildren = [];
      for (let j = minColIndex; j <= maxColIndex; j++) {
        const column = rowChildren[j];
        newRowChildren.push(column);
      }
      selectedRows.push({ ...row, children: newRowChildren });
    }

    for (let j = minColIndex; j <= maxColIndex; j++) {
      const column = columns[j];
      selectedColumns.push(column);
    }

    return [Object.freeze({
      ...selectedNode,
      children: selectedRows,
      columns: selectedColumns
    })];

  };

  // copy: mod + c
  newEditor.setFragmentData = (dataTransfer) => {

    const selectedNode = getSelectedNodeByType(newEditor, ELEMENT_TYPE.TABLE);
    if (!selectedNode) {
      return setFragmentData(dataTransfer);
    }

    const { tableSelectedRange } = newEditor;
    if (ObjectUtils.isSameObject(tableSelectedRange, EMPTY_SELECTED_RANGE)) {
      return setFragmentData(dataTransfer);
    }

    return setTableFragmentData(newEditor, dataTransfer);
  };

  newEditor.cut = (event) => {
    const selectedNode = getSelectedNodeByType(newEditor, ELEMENT_TYPE.TABLE);
    const { tableSelectedRange } = newEditor;

    if (selectedNode && !ObjectUtils.isSameObject(tableSelectedRange, EMPTY_SELECTED_RANGE)) {
      setTableFragmentData(newEditor, event.clipboardData);

      const deleteType = deleteHandler(newEditor);

      if (deleteType === 'table') {
        const { tablePath } = getSelectedInfo(editor);
        removeTable(editor, tablePath);
        return;
      }

      // range selection delete
      if (deleteType === 'range') {
        deleteTableRangeData(newEditor);
        return;
      }
      return;
    }
  };

  // copy insert text
  newEditor.insertData = (data) => {
    const selectedNode = getSelectedNodeByType(newEditor, ELEMENT_TYPE.TABLE_CELL);
    if (!selectedNode) {
      insertData(data);
      return;
    }

    const fragment = data.getData(`application/${CLIPBOARD_FORMAT_KEY}`);
    if (fragment) {
      const decoded = decodeURIComponent(window.atob(fragment));
      const parsedData = JSON.parse(decoded);
      if (Array.isArray(parsedData) && parsedData.some(item => item.type === ELEMENT_TYPE.TABLE)) {
        const tableElement = parsedData.find(item => item.type === ELEMENT_TYPE.TABLE);
        insertMultipleRowsAndColumns(newEditor, tableElement.children, tableElement.columns);
        return;
      }
    }

    const text = data.getData('text/plain');
    if (!text) return;
    Editor.insertText(newEditor, text);
  };

  newEditor.insertFragment = (data) => {
    if (data.type === ELEMENT_TYPE.TABLE) {
      Transforms.insertNodes(editor, data);
      return;
    }

    return insertFragment(data);
  };

  newEditor.selectAll = () => {
    const selection = newEditor.selection;
    if (!selection) {
      selectAll();
      return;
    }

    const selectedCell = getSelectedNodeByType(newEditor, ELEMENT_TYPE.TABLE_CELL);
    if (!selectedCell) {
      selectAll();
      return;
    }

    const { anchor, focus } = selection;
    if (!Path.equals(anchor.path.slice(0, 3), focus.path.slice(0, 3))) {
      selectAll();
      return;
    }

    const { table, tableSize } = getSelectedInfo(newEditor);
    eventBus.dispatch(INTERNAL_EVENT.SET_TABLE_SELECT_RANGE, table, {
      minRowIndex: 0,
      maxRowIndex: tableSize[0] - 1,
      minColIndex: 0,
      maxColIndex: tableSize[1] - 1,
    });
  };

  // Rewrite normalizeNode
  newEditor.normalizeNode = ([node, path]) => {
    const type = getNodeType(node);

    if (node.type === TABLE_ROW) {
      const parentEntry = Editor.parent(editor, path);

      if (parentEntry?.[0].type !== TABLE) {
        Transforms.unwrapNodes(editor, {
          at: path,
        });
        return;
      }
    }

    if (node.type === TABLE_CELL) {
      const parentEntry = Editor.parent(editor, path);

      if (parentEntry?.[0].type !== TABLE_ROW) {
        Transforms.unwrapNodes(editor, {
          at: path,
        });
        return;
      }
    }

    if (type !== ELEMENT_TYPE.TABLE) {
      return normalizeNode([node, path]);
    }

    // Check field integrity
    // Check table - columns
    const isMissColumn = !node.columns;
    if (isMissColumn) {
      if (!node.columns) {
        const columnCount = node.children[0].children.length;
        const width = Math.max(TABLE_CELL_MIN_WIDTH, parseInt(editor.width / columnCount));
        const columns = Array(node.children[0].children.length).fill({ width });
        Transforms.setNodes(newEditor, { columns }, { at: path });
      }
    }

    // Check table - style
    if (!node.style) {
      const columnCount = node.children[0].children.length;
      const columnWidth = Math.max(TABLE_CELL_MIN_WIDTH, parseInt(editor.width / columnCount));
      Transforms.setNodes(newEditor, { style: { gridTemplateColumns: `repeat(${columnCount}, ${columnWidth}px)`, gridAutoRows: `minmax(${TABLE_ROW_MIN_HEIGHT}}px, auto)` } }, { at: path });
    }

    // Check table - ui
    if (!node.ui) {
      Transforms.setNodes(newEditor, { ui: { alternate_highlight: false } }, { at: path });
    }

    // Check row - style
    if (!node.children[0].style) {
      const style = { min_height: TABLE_ROW_MIN_HEIGHT };
      node.children.forEach((row, index) => {
        if (!row.style) {
          Transforms.setNodes(newEditor, { style }, { at: path.concat(index) });
        }
      }
      );
    }

    // Check cell - style & inherit_style
    if (node?.children[0]?.children[0]?.style || node?.children[0]?.children[0]?.inherit_style) {
      node.children.forEach((row, rowIndex) => {
        row.children.forEach((cell, cellIndex) => {
          if (!cell.style || !cell.inherit_style) {
            const style = cell.style || {};
            const inherit_style = cell.inherit_style || {};
            Transforms.setNodes(newEditor, { style, inherit_style }, { at: path.concat(rowIndex, cellIndex) });
          }
        });
      });
    }

    // insert empty node，continue editor
    const isLast = isLastNode(newEditor, node);
    if (isLast) {
      const p = generateEmptyElement(PARAGRAPH);
      Transforms.insertNodes(newEditor, p, { at: [path[0] + 1] });
    }
  };

  // Jump to the next cell when pressing tab in the table
  newEditor.handleTab = (event) => {
    const selectedNode = getSelectedNodeByType(newEditor, ELEMENT_TYPE.TABLE);
    if (!selectedNode) {
      handleTab(event);
      return;
    }
    const above = Editor.above(newEditor);

    // Select multiple cells, jump to the first selected cell
    if (above[0].type === ELEMENT_TYPE.TABLE) {
      const { selection } = newEditor;
      const { anchor } = selection;
      Transforms.select(newEditor, [...anchor.path.slice(0, -1)]);
      return;
    }

    // Add row to the last cell
    if (isLastTableCell(newEditor, above)) {
      const { tablePath, tableSize } = getSelectedInfo(newEditor);
      if (tableSize[0] === TABLE_MAX_ROWS) return;
      insertTableElement(newEditor, TABLE_ELEMENT.ROW, TABLE_ELEMENT_POSITION.AFTER);
      Transforms.select(newEditor, [...tablePath, tableSize[0], 0]);
      return;
    }

    const { selection } = newEditor;

    // The default behavior, the cursor is in the middle of the text, and the current text content is selected
    // Change to jump to next cell
    if (selection.anchor.offset === selection.focus.offset) {
      const { tableSize, tablePath, rowIndex, cellIndex } = getSelectedInfo(newEditor);
      const lastColumnIndex = tableSize[1] - 1;
      let nextCell = [rowIndex, cellIndex + 1];
      if (lastColumnIndex < nextCell[1]) {
        nextCell = [rowIndex + 1, 0];
      }
      Transforms.select(newEditor, [...tablePath, ...nextCell] );
      return;
    }

    const next = Editor.next(newEditor);
    Transforms.select(newEditor, next[1]);
  };

  newEditor.reSetTableSelectedRange = () => {
    newEditor.tableSelectedRange = EMPTY_SELECTED_RANGE;
  };

  return newEditor;
};

export default withTable;
