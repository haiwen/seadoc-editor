import { Editor, Range, Transforms, Point, Node, Path } from '@seafile/slate';
import { ReactEditor } from '@seafile/slate-react';
import deepCopy from 'deep-copy';
import slugid from 'slugid';
import { INTERNAL_EVENT, PAGE_EDIT_AREA_WIDTH } from '../../../constants';
import { replacePastedDataId } from '../../../node-id/helpers';
import EventBus from '../../../utils/event-bus';
import ObjectUtils from '../../../utils/object-utils';
import { ELEMENT_TYPE, KEYBOARD, CLIPBOARD_FORMAT_KEY, INSERT_POSITION } from '../../constants';
import {
  getNodeType, getParentNode, getSelectedNodeByType, isTextNode, getSelectedElems, focusEditor,
  getNode, findPath, replaceNodeChildren, replaceNode, getSelectedNodeEntryByType, getAboveBlockNode
} from '../../core';
import {
  TABLE_MAX_ROWS, TABLE_MAX_COLUMNS, EMPTY_SELECTED_RANGE, TABLE_ROW_MIN_HEIGHT, TABLE_CELL_MIN_WIDTH,
  TABLE_ELEMENT, TABLE_ELEMENT_POSITION, TABLE_ROW_STYLE, INHERIT_CELL_STYLE_WHEN_SELECT_MULTIPLE, INHERIT_CELL_STYLE_WHEN_SELECT_SINGLE, TABLE_ALTERNATE_HIGHLIGHT_CLASS_MAP, CELL_SELECTED, DRAG_HANDLER_COLUMN, DRAG_HANDLER_ROW
} from './constants';

export const isTableMenuDisabled = (editor, readonly) => {
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

      if (type.startsWith('header')) return true;
      if (type === ELEMENT_TYPE.TITLE) return true;
      if (type === ELEMENT_TYPE.SUBTITLE) return true;
      if (type === ELEMENT_TYPE.CODE_BLOCK) return true;
      if (type === ELEMENT_TYPE.ORDERED_LIST) return true;
      if (type === ELEMENT_TYPE.UNORDERED_LIST) return true;
      if (type === ELEMENT_TYPE.BLOCKQUOTE) return true;
      if (type === ELEMENT_TYPE.LIST_ITEM) return true;
      if (type === ELEMENT_TYPE.TABLE) return true;
      if (type === ELEMENT_TYPE.TABLE_CELL) return true;
      if (type === ELEMENT_TYPE.TABLE_ROW) return true;
      if (type === ELEMENT_TYPE.CALL_OUT) return true;
      if (type === ELEMENT_TYPE.MULTI_COLUMN) return true;
      if (Editor.isVoid(editor, n)) return true;
      return false;
    },
    universal: true,
  });

  if (match) return true;

  return false;
};

export const isCombineCellsDisabled = (editor, readonly) => {
  if (readonly) return true;
  const { selection, tableSelectedRange } = editor;
  if (!selection) return true;
  if (!ObjectUtils.isSameObject(tableSelectedRange, EMPTY_SELECTED_RANGE)) {
    return false;
  }
  return true;
};

export const generateTableCell = (editor, rowIndex, cellIndex) => {
  let style = {};
  const tableNodeEntry = getSelectedNodeEntryByType(editor, ELEMENT_TYPE.TABLE);
  if (tableNodeEntry && rowIndex !== undefined && cellIndex !== undefined) {
    const [, tablePath] = tableNodeEntry;
    style = getCellInheritStyles(editor, tablePath, rowIndex, cellIndex);
  }

  return {
    id: slugid.nice(),
    type: ELEMENT_TYPE.TABLE_CELL,
    children: [{
      text: '',
      id: slugid.nice(),
    }],
    style,
    inherit_style: style,
  };
};

export const generateTableRow = (editor, colsCount, rowIndex) => {
  let children = [];
  for (let i = 0; i < colsCount; i++) {
    const tableCell = generateTableCell(editor, rowIndex, i);
    children.push(tableCell);
  }
  return {
    id: slugid.nice(),
    type: ELEMENT_TYPE.TABLE_ROW,
    children: children,
    style: {
      [TABLE_ROW_STYLE.MIN_HEIGHT]: TABLE_ROW_MIN_HEIGHT,
    },
  };
};

/**
 * @param {Editor} editor
 * @param {Object} tableProps
 * @param {[number,number]} tableProps.size - table size, [row,column]
 * @param {Boolean} tableProps.alternate_highlight - is alternate highlight
 * @param {string} tableProps.alternate_highlight_color - table alternate highlight color
 */
export const generateEmptyTable = (editor, tableProps) => {
  const { size = [0, 0], alternate_highlight = false, alternate_highlight_color } = tableProps;
  const rowsCount = size[0];
  const colsCount = size[1];
  let children = [];
  for (let i = 0; i < rowsCount; i++) {
    const tableRow = generateTableRow(editor, colsCount, i);
    children.push(tableRow);
  }
  const columnWidth = Math.max(TABLE_CELL_MIN_WIDTH, parseInt(editor.width / colsCount));
  let columns = [];
  for (let i = 0; i < colsCount; i++) {
    columns.push({ width: columnWidth });
  }
  return {
    id: slugid.nice(),
    type: ELEMENT_TYPE.TABLE,
    children: children,
    columns,
    ui: {
      alternate_highlight,
      alternate_highlight_color
    },
    style: {
      gridTemplateColumns: `repeat(${colsCount}, ${columnWidth}px)`,
      gridAutoRows: `minmax(${TABLE_ROW_MIN_HEIGHT}px, auto)`
    }
  };
};

export const insertTable = (editor, size, selection, position = INSERT_POSITION.CURRENT) => {
  if (!size) return;
  if (position !== INSERT_POSITION.AFTER) {
    if (isTableMenuDisabled(editor)) return;
  }

  const tableNode = generateEmptyTable(editor, { size });
  const validSelection = selection || editor.selection;
  const path = Editor.path(editor, validSelection);

  handleInsertTable(editor, position, path, tableNode);
};

// tableSize [tableHeight, tableWidth]
export const getSelectedInfo = (editor) => {
  const currentTable = getSelectedNodeByType(editor, ELEMENT_TYPE.TABLE);
  const currentRow = getSelectedNodeByType(editor, ELEMENT_TYPE.TABLE_ROW);
  const currentCell = getSelectedNodeByType(editor, ELEMENT_TYPE.TABLE_CELL);
  const currentCellPath = findPath(editor, currentCell);
  return {
    table: currentTable,
    tablePath: findPath(editor, currentTable),
    tableSize: [currentTable.children.length, currentRow.children.length],
    row: currentRow,
    rowPath: findPath(editor, currentRow),
    rowIndex: currentCellPath[currentCellPath.length - 2],
    cell: currentCell,
    cellPath: findPath(editor, currentCell),
    cellIndex: currentCellPath[currentCellPath.length - 1],
  };
};

export const isInTable = (editor) => {
  const selectedNodes = getSelectedElems(editor);
  if (!selectedNodes.some(node => node.type === ELEMENT_TYPE.TABLE)) return false;
  const firstSelectedNode = selectedNodes[0];
  return firstSelectedNode.type === ELEMENT_TYPE.TABLE;
};

export const isAllInTable = (editor) => {
  const selectedNodes = getSelectedElems(editor);
  if (!selectedNodes.some(node => node.type === ELEMENT_TYPE.TABLE)) return false;
  const firstSelectedNode = selectedNodes[0];
  if (firstSelectedNode.type !== ELEMENT_TYPE.TABLE) return false;
  return selectedNodes.slice(1,).every(node => [ELEMENT_TYPE.TABLE_ROW, ELEMENT_TYPE.TABLE_CELL].includes(node.type)); // same table element
};

export const isInTableSameCell = (editor) => {
  const { anchor, focus } = editor.selection;
  const match = (n) => n.type === ELEMENT_TYPE.TABLE_CELL;
  const anchorNode = getAboveBlockNode(editor, { at: anchor, match });
  const focusNode = getAboveBlockNode(editor, { at: focus, match });
  if (!anchorNode || !focusNode) return false;
  return Path.equals(anchorNode[1], focusNode[1]);
};

export const setCellStyle = (editor, style) => {
  // Select single cell
  if (ObjectUtils.isSameObject(editor.tableSelectedRange, EMPTY_SELECTED_RANGE)) {
    const selectedNodes = getSelectedElems(editor);
    let firstTableCellNodePath;
    selectedNodes.forEach(node => {
      if (node.type === ELEMENT_TYPE.TABLE_CELL) {
        const path = findPath(editor, node);
        if (path) {
          firstTableCellNodePath = firstTableCellNodePath ? firstTableCellNodePath : path;
          Transforms.setNodes(
            editor,
            {
              style: { ...node.style, ...style, },
              inherit_style: generateInheritStyle(INHERIT_CELL_STYLE_WHEN_SELECT_SINGLE, style, node)
            },
            { at: path }
          );
        }
      }
    });
    if (firstTableCellNodePath) {
      const start = Editor.start(editor, firstTableCellNodePath);
      const end = Editor.end(editor, firstTableCellNodePath);
      const newSelection = {
        anchor: start,
        focus: end,
      };
      Transforms.select(editor, newSelection);
    }
    return;
  }
  // Select multiple cells
  const { minColIndex, maxColIndex, minRowIndex, maxRowIndex } = editor.tableSelectedRange;
  const { tablePath } = getSelectedInfo(editor);
  for (let i = minRowIndex; i <= maxRowIndex; i++) {
    for (let j = minColIndex; j <= maxColIndex; j++) {
      const path = [...tablePath, i, j];
      const node = getNode(editor, path);
      Transforms.setNodes(
        editor,
        {
          style: { ...node.style, ...style },
          inherit_style: generateInheritStyle(INHERIT_CELL_STYLE_WHEN_SELECT_MULTIPLE, style, node)
        },
        { at: path });
    }
  }
};

export const insertTableRow = (editor, table, rowIndex, position = TABLE_ELEMENT_POSITION.AFTER) => {
  const tableRowCount = table.children.length;
  if (tableRowCount >= TABLE_MAX_ROWS) return;
  const tableColumnCount = table.children[0].children.length;
  const row = generateTableRow(editor, tableColumnCount, rowIndex);
  const tablePath = findPath(editor, table);
  const targetPath = position === TABLE_ELEMENT_POSITION.AFTER ? [...tablePath, rowIndex + 1] : [...tablePath, rowIndex];
  Transforms.insertNodes(editor, row, { at: targetPath });
  const focusPath = [...targetPath, 0];
  focusEditor(editor, focusPath);

  // handle cells with the rowspan > 1
  if (position === TABLE_ELEMENT_POSITION.AFTER) {
    handleCombinedCellsAfterInsertTableRow(editor, tablePath, table, rowIndex);
  }
};

export const handleCombinedCellsAfterInsertTableRow = (editor, tablePath, table, rowIndex) => {
  // important background info: the new row is inserted after rowIndex
  const cells = table.children[rowIndex].children;
  for (let i = 0, len = cells.length; i < len; i++) {
    const { is_combined, rowspan, colspan } = cells[i];
    if (is_combined) {
      for (let ri = rowIndex - 1; ri >= 0; ri--) {
        const { is_combined: ri_is_combined, rowspan: ri_rowspan, colspan: ri_colspan } = table.children[ri].children[i];
        if (!ri_is_combined && ri + ri_rowspan - 1 > rowIndex) {
          Transforms.setNodes(editor, { rowspan: ri_rowspan + 1 }, { at: [...tablePath, ri, i] });
          for (let j = 0; j < ri_colspan; j++) {
            Transforms.setNodes(editor, { 'is_combined': true }, { at: [...tablePath, rowIndex + 1, i + j] });
          }
          break;
        }
      }
    } else {
      if (rowspan > 1) {
        Transforms.setNodes(editor, { rowspan: rowspan + 1 }, { at: [...tablePath, rowIndex, i] });
        for (let j = 0; j < colspan; j++) {
          Transforms.setNodes(editor, { 'is_combined': true }, { at: [...tablePath, rowIndex + 1, i + j] });
        }
      }
    }
  }
};

export const insertTableColumn = (editor, table, columnIndex, position = TABLE_ELEMENT_POSITION.AFTER) => {
  const tableColumnCount = table.children[0].children.length;
  if (tableColumnCount >= TABLE_MAX_COLUMNS) return;
  const newCellIndex = position === TABLE_ELEMENT_POSITION.AFTER ? columnIndex + 1 : columnIndex;
  const newColumns = getTableColumnsAfterInsertColumn(editor, table, newCellIndex, 1);
  updateColumnWidth(editor, table, newColumns);
  const tablePath = findPath(editor, table);
  const tableRowCount = table.children.length;

  for (let i = 0; i < tableRowCount; i++) {
    const newCellPath = [...tablePath, i, newCellIndex];
    const newCell = generateTableCell(editor, i, columnIndex);
    Transforms.insertNodes(editor, newCell, { at: newCellPath });
  }

  const focusPath = [...tablePath, 0, newCellIndex, 0];
  focusEditor(editor, focusPath);

  // handle cells with the colspan > 1
  if (position === TABLE_ELEMENT_POSITION.AFTER) {
    handleCombinedCellsAfterInsertTableColumn(editor, tablePath, table, columnIndex);
  }
};

export const handleCombinedCellsAfterInsertTableColumn = (editor, tablePath, table, columnIndex) => {
  // important background info: the new column is inserted after columnIndex
  for (let i = 0, len = table.children.length; i < len; i++) {
    const { is_combined, rowspan, colspan } = table.children[i].children[columnIndex];
    if (is_combined) {
      for (let ci = columnIndex - 1; ci >= 0; ci--) {
        const { is_combined: ci_is_combined, rowspan: ci_rowspan, colspan: ci_colspan } = table.children[i].children[ci];
        if (!ci_is_combined && ci + ci_colspan - 1 > columnIndex) {
          Transforms.setNodes(editor, { colspan: ci_colspan + 1 }, { at: [...tablePath, i, ci] });
          for (let j = 0; j < ci_rowspan; j++) {
            Transforms.setNodes(editor, { 'is_combined': true }, { at: [...tablePath, i + j, columnIndex + 1] });
          }
          break;
        }
      }
    } else {
      if (colspan > 1) {
        Transforms.setNodes(editor, { colspan: colspan + 1 }, { at: [...tablePath, i, columnIndex] });
        for (let j = 0; j < rowspan; j++) {
          Transforms.setNodes(editor, { 'is_combined': true }, { at: [...tablePath, i + j, columnIndex + 1] });
        }
      }
    }
  }
};

export const insertTableElement = (editor, type, position = TABLE_ELEMENT_POSITION.AFTER, count = 1) => {
  const { table, tablePath, tableSize, rowIndex, cellIndex } = getSelectedInfo(editor);
  const eventBus = EventBus.getInstance();
  eventBus.dispatch(INTERNAL_EVENT.CANCEL_TABLE_SELECT_RANGE);
  if (type === TABLE_ELEMENT.ROW) {
    if (tableSize[0] >= TABLE_MAX_ROWS) return;
    const targetPath = position === TABLE_ELEMENT_POSITION.AFTER ? [...tablePath, rowIndex + 1] : [...tablePath, rowIndex];
    const validCount = Math.min(TABLE_MAX_ROWS - tableSize[0], count);
    for (let i = 0; i < validCount; i++) {
      const row = generateTableRow(editor, tableSize[1], rowIndex);
      Transforms.insertNodes(editor, row, { at: targetPath });
      // handle combined cells
      if (!(rowIndex === 0 && position === TABLE_ELEMENT_POSITION.BEFORE)) {
        const targetRowIndex = position === TABLE_ELEMENT_POSITION.AFTER ? rowIndex : rowIndex - 1;
        const currentTable = getSelectedNodeByType(editor, ELEMENT_TYPE.TABLE);
        handleCombinedCellsAfterInsertTableRow(editor, tablePath, currentTable, targetRowIndex);
      }
    }

    const focusPath = [...targetPath, cellIndex];
    focusEditor(editor, focusPath);
    return;
  }

  if (type === TABLE_ELEMENT.COLUMN) {
    if (tableSize[1] >= TABLE_MAX_COLUMNS) return;
    const newCellIndex = position === TABLE_ELEMENT_POSITION.AFTER ? cellIndex + 1 : cellIndex;
    const validCount = Math.min(TABLE_MAX_COLUMNS - tableSize[1], count);
    const newColumns = getTableColumnsAfterInsertColumn(editor, table, newCellIndex, validCount);
    updateColumnWidth(editor, table, newColumns);

    for (let j = 0; j < validCount; j++) {
      for (let i = 0; i < tableSize[0]; i++) {
        const newCellPath = [...tablePath, i, newCellIndex];
        const newCell = generateTableCell(editor, i, cellIndex);
        Transforms.insertNodes(editor, newCell, { at: newCellPath });
      }
      // handle combined cells
      if (!(cellIndex === 0 && position === TABLE_ELEMENT_POSITION.BEFORE)) {
        const targetColumnIndex = position === TABLE_ELEMENT_POSITION.AFTER ? cellIndex : cellIndex - 1;
        const currentTable = getSelectedNodeByType(editor, ELEMENT_TYPE.TABLE);
        handleCombinedCellsAfterInsertTableColumn(editor, tablePath, currentTable, targetColumnIndex);
      }
    }

    const focusPath = [...tablePath, rowIndex, cellIndex + 1, 0];
    focusEditor(editor, focusPath);
    return;
  }
};

export const combineCells = (editor) => {
  const { tablePath } = getSelectedInfo(editor);
  const { minColIndex, maxColIndex, minRowIndex, maxRowIndex } = editor.tableSelectedRange;
  let newCellContent = [];
  for (let i = minRowIndex; i < maxRowIndex + 1; i++) {
    for (let j = minColIndex; j < maxColIndex + 1; j++) {
      let nodePath = [...tablePath, i, j];
      let node = Editor.node(editor, nodePath);
      if (node[0].is_combined) {
        continue;
      }
      Transforms.setNodes(editor, { 'is_combined': true }, { at: nodePath });
      newCellContent = newCellContent.concat(node[0].children);
    }
  }
  const targetCellPath = [...tablePath, minRowIndex, minColIndex];
  const newCell = generateTableCell(editor);
  newCell.children = newCellContent;
  newCell.rowspan = maxRowIndex - minRowIndex + 1;
  newCell.colspan = maxColIndex - minColIndex + 1;
  // keep row.children.length not changed
  Transforms.removeNodes(editor, { at: targetCellPath });
  Transforms.insertNodes(editor, newCell, { at: targetCellPath });
  focusEditor(editor, targetCellPath);

  // for clicking the 'combine cell' icon in the toolbar
  const eventBus = EventBus.getInstance();
  eventBus.dispatch(INTERNAL_EVENT.CANCEL_TABLE_SELECT_RANGE);
};

export const splitCell = (editor, rowNumber, columnNumber) => {
  if (rowNumber === 1 && columnNumber === 1) {
    return;
  }

  const { cell, rowIndex, cellIndex, cellPath, tablePath } = getSelectedInfo(editor);

  const { rowspan, colspan } = cell;
  const rowspanBase = Math.floor(rowspan / rowNumber);
  const rowspanLeft = rowspan % rowNumber;
  const colspanBase = Math.floor(colspan / columnNumber);
  const colspanLeft = colspan % columnNumber;
  const cellNumber = rowNumber * columnNumber;
  const dataBlockNumber = Math.ceil(cell.children.length / cellNumber);

  let firstNewCell;
  let rowspanSum = 0;
  for (let i = 0; i < rowNumber; i++) {
    let newRowSpan = rowspanBase + ((i + 1) <= rowspanLeft ? 1 : 0);
    let colspanSum = 0;
    for (let j = 0; j < columnNumber; j++) {
      const newCell = generateTableCell(editor);

      let startIndex = (i * columnNumber + j) * dataBlockNumber;
      if (startIndex < cell.children.length) {
        let endIndex = Math.min(startIndex + dataBlockNumber, cell.children.length);
        newCell.children = cell.children.slice(startIndex, endIndex);
      }

      newCell.rowspan = newRowSpan;
      newCell.colspan = colspanBase + ((j + 1) <= colspanLeft ? 1 : 0);

      const newRowIndex = rowIndex + rowspanSum;
      const newCellIndex = cellIndex + colspanSum;
      const targetCellPath = [...tablePath, newRowIndex, newCellIndex];
      if (i === 0 && j === 0) {
        firstNewCell = newCell;
      } else {
        Transforms.removeNodes(editor, { at: targetCellPath });
        Transforms.insertNodes(editor, newCell, { at: targetCellPath });
      }

      colspanSum += newCell.colspan;
    }
    rowspanSum += newRowSpan;
  }

  Transforms.removeNodes(editor, { at: cellPath });
  Transforms.insertNodes(editor, firstNewCell, { at: cellPath });
};

export const syncRemoveTable = (editor, path) => {
  let validPath = path;
  if (!validPath) {
    const { tablePath } = getSelectedInfo(editor);
    validPath = tablePath;
  }

  editor.reSetTableSelectedRange();
  Transforms.removeNodes(editor, { at: validPath });
};

export const removeTable = (editor, path) => {
  let validPath = path;
  if (!validPath) {
    const { tablePath } = getSelectedInfo(editor);
    validPath = tablePath;
  }

  editor.reSetTableSelectedRange();

  // Clicking the menu causes the table to be re-rendered, and the deletion operation is performed synchronously. When rendering, it is found that the data is lost and an error is reported.
  setTimeout(() => {
    Transforms.removeNodes(editor, { at: validPath });
    if (Editor.hasPath(editor, validPath)) {
      const endOfLastNodePoint = Editor.end(editor, validPath);
      const range = {
        anchor: endOfLastNodePoint,
        focus: endOfLastNodePoint,
      };
      focusEditor(editor, range);
    }
  }, 0);
};

export const removeTableElement = (editor, type) => {
  const { table, tablePath, tableSize, rowPath, rowIndex, cellIndex } = getSelectedInfo(editor);
  const eventBus = EventBus.getInstance();
  eventBus.dispatch(INTERNAL_EVENT.CANCEL_TABLE_SELECT_RANGE);

  if (type === TABLE_ELEMENT.TABLE) {
    removeTable(editor, tablePath);
    return;
  }

  if (type === TABLE_ELEMENT.ROW) {
    if (tableSize[0] === 1) {
      removeTable(editor, tablePath);
      return;
    }

    if (!ObjectUtils.isSameObject(editor.tableSelectedRange, EMPTY_SELECTED_RANGE)) {
      const { minRowIndex, maxRowIndex } = editor.tableSelectedRange;

      if (minRowIndex === 0 && maxRowIndex === tableSize[0] - 1) {
        removeTable(editor, tablePath);
        return;
      }

      for (let i = minRowIndex; i <= maxRowIndex; i++) {
        queueMicrotask(() => {
          Transforms.removeNodes(editor, {
            at: [...tablePath, minRowIndex],
          });
        });
      }

      const focusPath = [...tablePath, minRowIndex === 0 ? 0 : minRowIndex - 1, cellIndex];
      focusEditor(editor, focusPath);

      return;
    }

    handleCombinedCellsBeforeDeleteTableRow(editor, tablePath, table, rowIndex);
    Transforms.removeNodes(editor, {
      at: rowPath,
    });

    const focusRowIndex = rowIndex === tableSize[0] - 1 ? rowIndex - 1 : rowIndex;
    const focusPath = [...tablePath, focusRowIndex, cellIndex];
    focusEditor(editor, focusPath);
    return;
  }

  if (type === TABLE_ELEMENT.COLUMN) {
    if (tableSize[1] === 1) {
      removeTable(editor, tablePath);
      return;
    }

    if (!ObjectUtils.isSameObject(editor.tableSelectedRange, EMPTY_SELECTED_RANGE)) {
      const { minColIndex, maxColIndex } = editor.tableSelectedRange;

      if (minColIndex === 0 && maxColIndex === tableSize[1] - 1) {
        removeTable(editor, tablePath);
        return;
      }

      const columns = getTableColumns(editor, table);
      const newColumns = [...columns.slice(0, minColIndex), ...columns.slice(maxColIndex + 1,)];
      updateColumnWidth(editor, table, newColumns);

      for (let i = 0; i < tableSize[0]; i++) {
        for (let j = minColIndex; j <= maxColIndex; j++) { // count
          const cellPath = [...tablePath, i, minColIndex];
          Transforms.removeNodes(editor, {
            at: cellPath
          });
        }
      }

      const focusPath = [...tablePath, rowIndex, minColIndex === 0 ? 0 : minColIndex - 1];
      focusEditor(editor, focusPath);
      return;
    }

    const columns = getTableColumns(editor, table);
    const newColumns = columns.slice(0);
    newColumns.splice(cellIndex, 1);
    updateColumnWidth(editor, table, newColumns);

    handleCombinedCellsBeforeDeleteTableColumn(editor, tablePath, table, cellIndex);
    for (let i = 0; i < tableSize[0]; i++) {
      const cellPath = [...tablePath, i, cellIndex];
      Transforms.removeNodes(editor, {
        at: cellPath
      });
    }

    const focusCellIndex = cellIndex === tableSize[1] - 1 ? cellIndex - 1 : cellIndex;
    const focusPath = [...tablePath, rowIndex, focusCellIndex];
    focusEditor(editor, focusPath);
    return;
  }
};

// handle combined cells before deleting a row
export const handleCombinedCellsBeforeDeleteTableRow = (editor, tablePath, table, rowIndex) => {
  const cells = table.children[rowIndex].children;
  for (let i = 0, len = cells.length; i < len; i++) {
    const { is_combined, rowspan, colspan } = cells[i];
    if (is_combined) {
      for (let ri = rowIndex - 1; ri >= 0; ri--) {
        const { is_combined: ri_is_combined, rowspan: ri_rowspan } = table.children[ri].children[i];
        if (!ri_is_combined && ri + ri_rowspan - 1 >= rowIndex) {
          Transforms.setNodes(editor, { rowspan: ri_rowspan - 1 }, { at: [...tablePath, ri, i] });
          break;
        }
      }
    } else {
      if (rowspan > 1) {
        const targetCellPath = [...tablePath, rowIndex + 1, i];
        const newCell = generateTableCell(editor);
        newCell.rowspan = rowspan - 1;
        newCell.colspan = colspan;
        Transforms.removeNodes(editor, { at: targetCellPath });
        Transforms.insertNodes(editor, newCell, { at: targetCellPath });
      }
    }
  }
};

// handle combined cells before deleting a column
export const handleCombinedCellsBeforeDeleteTableColumn = (editor, tablePath, table, columnIndex) => {
  for (let i = 0, len = table.children.length; i < len; i++) {
    const { is_combined, rowspan, colspan } = table.children[i].children[columnIndex];
    if (is_combined) {
      for (let ci = columnIndex - 1; ci >= 0; ci--) {
        const { is_combined: ci_is_combined, colspan: ci_colspan } = table.children[i].children[ci];
        if (!ci_is_combined && ci + ci_colspan - 1 >= columnIndex) {
          Transforms.setNodes(editor, { colspan: ci_colspan - 1 }, { at: [...tablePath, i, ci] });
          break;
        }
      }
    } else {
      if (colspan > 1) {
        const targetCellPath = [...tablePath, i, columnIndex + 1];
        const newCell = generateTableCell(editor);
        newCell.rowspan = rowspan;
        newCell.colspan = colspan - 1;
        Transforms.removeNodes(editor, { at: targetCellPath });
        Transforms.insertNodes(editor, newCell, { at: targetCellPath });
      }
    }
  }
};

export const setTableSelectedRange = (editor, range) => {
  if (range) {
    editor.tableSelectedRange = range;
    return;
  }
  editor.tableSelectedRange = EMPTY_SELECTED_RANGE;
};

export const updateTableRowHeight = (editor, element, rowHeight) => {
  const path = findPath(editor, element);
  const targetNode = getNode(editor, path);
  const { style = {} } = targetNode;
  if (style[TABLE_ROW_STYLE.MIN_HEIGHT] === rowHeight) return;

  Transforms.setNodes(editor, {
    style: {
      ...style,
      [TABLE_ROW_STYLE.MIN_HEIGHT]: rowHeight
    }
  }, { at: path });
};

export const updateColumnWidth = (editor, element, columns) => {
  const path = findPath(editor, element);
  Transforms.setNodes(editor, {
    columns: columns
  }, { at: path });
};

export const getTableColumnsWidth = (columns = []) => {
  if (!Array.isArray(columns) || columns.length === 0) return 0;
  return columns.reduce((pre, cur) => pre + cur.width, 0);
};

export const getTableColumnsAfterInsertColumn = (editor, element, targetColumnIndex, insertColumnCount) => {
  const columns = getTableColumns(editor, element);
  let newColumns = columns.slice(0);
  let totalColumnsWidth = getTableColumnsWidth(columns);
  const targetColumn = columns[targetColumnIndex] || columns[targetColumnIndex - 1];
  const targetInsertColumnsWidth = targetColumn.width * insertColumnCount;

  // Currently in scrolling state, insert directly
  if (totalColumnsWidth > editor.width) {
    for (let i = 0; i < insertColumnCount; i++) {
      newColumns.splice(targetColumnIndex, 0, targetColumn);
    }
    return newColumns;
  }

  // Not currently scrolling
  // It is not a scroll state after inserting a new column
  if (totalColumnsWidth + targetInsertColumnsWidth < editor.width) {
    for (let i = 0; i < insertColumnCount; i++) {
      newColumns.push(targetColumn);
    }
    return newColumns;
  }

  // After inserting a new column is a scrolling state
  for (let i = 0; i < insertColumnCount; i++) {
    totalColumnsWidth += targetColumn.width;
    newColumns.splice(targetColumnIndex, 0, targetColumn);
  }
  const proportion = totalColumnsWidth / (editor.width - 1);
  return newColumns.map(column => {
    return { ...column, width: Math.max(parseInt(column.width / proportion), TABLE_CELL_MIN_WIDTH) };
  });
};

export const getTableColumns = (editor, element) => {
  if (!element) return [];
  let tableElement = element;
  if (element.type === ELEMENT_TYPE.TABLE_CELL) {
    const cellPath = findPath(editor, element);
    const tablePath = cellPath.slice(0, -2);
    tableElement = getNode(editor, tablePath);
  }
  const { columns, children } = tableElement;
  if (columns) return columns;
  const columnsCount = children[0].children.length;
  let initColumns = [];
  const pageEditAreaWidth = editor.width || PAGE_EDIT_AREA_WIDTH;
  for (let i = 0; i < columnsCount; i++) {
    const column = { width: Math.max(TABLE_CELL_MIN_WIDTH, parseInt(pageEditAreaWidth / columnsCount)) };
    initColumns.push(column);
  }
  return initColumns;
};

export const getCellColumn = (editor, cellElement) => {
  let column = {
    width: TABLE_CELL_MIN_WIDTH
  };
  if (!editor || !cellElement) return column;
  const cellPath = findPath(editor, cellElement);
  if (!cellPath) return column;
  const pathLength = cellPath.length;
  const cellIndex = cellPath[pathLength - 1];
  const tablePath = cellPath.slice(0, -2);
  const tableElement = getNode(editor, tablePath);
  const { columns } = tableElement;
  const columnsCount = tableElement.children[0].children.length;
  const pageEditAreaWidth = editor.width || PAGE_EDIT_AREA_WIDTH;
  if (columns) {
    column = columns[cellIndex];
  }
  return column || { width: Math.max(TABLE_CELL_MIN_WIDTH, parseInt(pageEditAreaWidth / columnsCount)) };
};

export const getFirstTableCell = (element) => {
  let tableCellElement = element;
  while (tableCellElement && !(tableCellElement.hasAttribute('row-index') && tableCellElement.hasAttribute('cell-index'))) {
    tableCellElement = tableCellElement.parentNode;
  }
  return tableCellElement;
};

export const elementHasImage = (element) => {
  if (!element) return false;
  if (!Array.isArray(element.children) || element.children.length === 0) return false;

  return element.children.some(child => {
    if (child.type === ELEMENT_TYPE.IMAGE) return true;
    if (ObjectUtils.hasProperty(child, 'children')) {
      return elementHasImage(child);
    }
    return false;
  });
};

export const isSelectedAllCell = (editor) => {
  const { tableSize } = getSelectedInfo(editor);
  return ObjectUtils.isSameObject(editor.tableSelectedRange, {
    minColIndex: 0,
    maxColIndex: tableSize[1] - 1,
    minRowIndex: 0,
    maxRowIndex: tableSize[0] - 1,
  });
};

export const insertMultipleRowsAndColumns = (editor, rows, columns) => {
  const { table, tablePath, tableSize, rowIndex, cellIndex } = getSelectedInfo(editor);
  let newTable = deepCopy(table);
  const eventBus = EventBus.getInstance();
  eventBus.dispatch(INTERNAL_EVENT.CANCEL_TABLE_SELECT_RANGE);

  const insertRows = rows.slice(tableSize[0] - rowIndex);
  const insertColumns = columns.slice(tableSize[1] - cellIndex);
  const validInsertRows = insertRows.slice(0, Math.min(TABLE_MAX_ROWS - tableSize[0], insertRows.length));
  const validInsertColumns = insertColumns.slice(0, Math.min(TABLE_MAX_COLUMNS - tableSize[1], columns.length));

  for (let i = 0; i < validInsertRows.length; i++) {
    const insertRow = validInsertRows[i];
    const row = generateTableRow(editor, tableSize[1], rowIndex);
    row.style = insertRow.style;
    newTable.children.push(row);
  }

  if (validInsertColumns.length > 0) {
    newTable.columns = [...table.columns, ...validInsertColumns];
  }

  for (let j = 0; j < validInsertColumns.length; j++) {
    for (let i = 0; i < tableSize[0] + validInsertRows.length; i++) {
      const newCell = generateTableCell(editor);
      newTable.children[i].children.push(newCell);
    }
  }

  for (let i = rowIndex; i < Math.min(TABLE_MAX_ROWS, rowIndex + rows.length); i++) {
    const row = rows[i - rowIndex];
    const cells = row.children;
    for (let j = cellIndex; j < Math.min(TABLE_MAX_COLUMNS, cellIndex + columns.length); j++) {
      const replaceCellIndex = j - cellIndex;
      const replaceCell = cells[replaceCellIndex];
      newTable.children[i].children[j].children = replacePastedDataId(replaceCell.children);
    }
  }

  replaceNode(editor, { at: tablePath, nodes: newTable });
  focusEditor(editor, [...tablePath, rowIndex, cellIndex, 0]);
  const { focus: newFocus } = editor.selection;
  Transforms.select(editor, { focus: newFocus, anchor: newFocus });

  return;
};

export const setTableFragmentData = (editor, dataTransfer) => {
  const selectedNode = getSelectedNodeByType(editor, ELEMENT_TYPE.TABLE);
  const fragment = editor.getFragment();
  const string = JSON.stringify(fragment);
  const encoded = window.btoa(encodeURIComponent(string));
  dataTransfer.setData(`application/${CLIPBOARD_FORMAT_KEY}`, encoded);

  const tableDom = document.createElement('table');
  const { minColIndex, maxColIndex, minRowIndex, maxRowIndex } = editor.tableSelectedRange;
  const tablePath = findPath(editor, selectedNode);
  for (let i = minRowIndex; i <= maxRowIndex; i++) {
    const tr = document.createElement('tr');
    for (let j = minColIndex; j <= maxColIndex; j++) {
      const path = [...tablePath, i, j];
      const node = getNode(editor, path);
      const td = document.createElement('td');
      const div = document.createElement('div');
      div.innerHTML = ReactEditor.toDOMNode(editor, node).innerHTML;
      td.appendChild(div);
      tr.appendChild(td);
    }
    tableDom.appendChild(tr);
  }
  tableDom.setAttribute('data-slate-fragment', encoded);

  const div = document.createElement('div');
  div.appendChild(tableDom);

  dataTransfer.setData('text/html', div.innerHTML);
  dataTransfer.setData('text/plain', div.innerText);
  return dataTransfer;
};

export const deleteTableRangeData = (editor) => {
  const { tableSelectedRange } = editor;
  const { minRowIndex, maxRowIndex, minColIndex, maxColIndex } = tableSelectedRange;
  const { tablePath } = getSelectedInfo(editor);
  let forceCellPath;
  for (let i = minRowIndex; i <= maxRowIndex; i++) {
    for (let j = minColIndex; j <= maxColIndex; j++) {
      const path = [...tablePath, i, j];
      const node = getNode(editor, path);
      if (!forceCellPath && (Node.string(node) || elementHasImage(node))) {
        forceCellPath = path;
      }
      const firstNode = node.children[0];
      replaceNodeChildren(editor, {
        at: path,
        nodes: { ...firstNode, text: '' },
      });
    }
  }

  if (forceCellPath) {
    editor.tableSelectedRange = EMPTY_SELECTED_RANGE;
    const eventBus = EventBus.getInstance();
    eventBus.dispatch(INTERNAL_EVENT.CANCEL_TABLE_SELECT_RANGE);
    focusEditor(editor, forceCellPath);
    const { focus: newFocus } = editor.selection;
    Transforms.select(editor, { focus: newFocus, anchor: newFocus });
  }
};

export const deleteHandler = (editor) => {
  const { selection, tableSelectedRange } = editor;
  if (selection == null) return '';

  if (!ObjectUtils.isSameObject(tableSelectedRange, EMPTY_SELECTED_RANGE)) {
    if (isSelectedAllCell(editor)) return 'table';
    return 'range';
  }

  const [cellNodeEntry] = Editor.nodes(editor, {
    match: n => {
      let type = getNodeType(n);
      if (!type && isTextNode(n) && n.id) {
        const parentNode = getParentNode(editor.children, n.id);
        type = getNodeType(parentNode);
      }
      return type === ELEMENT_TYPE.TABLE_CELL;
    },
  });
  if (cellNodeEntry) {
    const [, cellPath] = cellNodeEntry;
    const start = Editor.start(editor, cellPath);
    if (Point.equals(selection.anchor, start)) {
      return 'default';
    }
  }
  return '';
};

export const isTableLocation = (editor, location) => {
  const tables = Editor.nodes(editor, {
    at: location,
    match: n => {
      let type = getNodeType(n);
      if (!type && isTextNode(n) && n.id) {
        const parentNode = getParentNode(editor.children, n.id);
        type = getNodeType(parentNode);
      }
      return type === ELEMENT_TYPE.TABLE_CELL;
    },
  });
  let hasTable = false;
  // eslint-disable-next-line no-unused-vars
  for (const table of tables) {
    hasTable = true;
  }
  return hasTable;
};

export const isCursorAtCellEnd = (cell, cursor = 0) => {
  if (!cell) return false;
  const childrenCount = cell.children.length;
  const lastChildren = cell.children[childrenCount - 1];
  const textCount = lastChildren.text.length;
  return cursor === textCount;
};

export const isCursorAtCellStart = (cursor = 0) => {
  return cursor === 0;
};

export const focusCell = (editor, event, keyboardName = '') => {
  const { tableSize, tablePath, rowIndex, cellIndex, cell } = getSelectedInfo(editor);
  const tableParentPath = tablePath.slice(0, -1);
  const tableIndex = tablePath[tablePath.length - 1];
  const { selection } = editor;
  const { focus } = selection;

  if (keyboardName === KEYBOARD.UP) {
    if (!isCursorAtCellStart(focus.offset)) {
      setTimeout(() => {
        if (getSelectedNodeByType(editor, ELEMENT_TYPE.TABLE)) {
          const { cellIndex: newCellIndex } = getSelectedInfo(editor);
          if (Math.abs(newCellIndex - cellIndex) !== 0) {
            if (rowIndex === 0) {
              if (tableIndex !== 0) {
                focusEditor(editor, [...tableParentPath, tableIndex - 1]);
              }
              return;
            }
            focusEditor(editor, [...tableParentPath, tableIndex, rowIndex - 1, cellIndex]);
            const { focus: newFocus } = editor.selection;
            Transforms.select(editor, { focus: newFocus, anchor: newFocus });
          }
        }
      }, 10);
      return;
    }

    event.preventDefault();
    if (rowIndex === 0) {
      if (tableIndex !== 0) {
        focusEditor(editor, [...tableParentPath, tableIndex - 1]);
      }
      return;
    }
    focusEditor(editor, [...tableParentPath, tableIndex, rowIndex - 1, cellIndex]);
    const { focus: newFocus } = editor.selection;
    Transforms.select(editor, { focus: newFocus, anchor: newFocus });
  }

  if (keyboardName === KEYBOARD.RIGHT) {
    if (!isCursorAtCellEnd(cell, focus.offset)) return;
    event.preventDefault();
    if (rowIndex === tableSize[0] - 1 && cellIndex === tableSize[1] - 1) {
      focusEditor(editor, [...tableParentPath, tableIndex + 1]);
      return;
    }
    if (cellIndex === tableSize[1] - 1) {
      focusEditor(editor, [...tableParentPath, tableIndex, rowIndex + 1, 0]);
    } else {
      focusEditor(editor, [...tableParentPath, tableIndex, rowIndex, cellIndex + 1]);
    }
    const { anchor: newAnchor } = editor.selection;
    Transforms.select(editor, { focus: newAnchor, anchor: newAnchor });
  }

  if (keyboardName === KEYBOARD.DOWN) {
    if (!isCursorAtCellEnd(cell, focus.offset)) {
      setTimeout(() => {
        if (getSelectedNodeByType(editor, ELEMENT_TYPE.TABLE)) {
          const { cellIndex: newCellIndex } = getSelectedInfo(editor);
          if (Math.abs(newCellIndex - cellIndex) !== 0) {
            if (rowIndex === tableSize[0] - 1) {
              const nextNode = getNode(editor, [...tableParentPath, tableIndex + 1]);
              if (!nextNode) return;
              focusEditor(editor, [...tableParentPath, tableIndex + 1]);
              return;
            }
            focusEditor(editor, [...tableParentPath, tableIndex, rowIndex + 1, cellIndex]);
            const { anchor: newAnchor } = editor.selection;
            Transforms.select(editor, { focus: newAnchor, anchor: newAnchor });
          }
        }
      }, 10);
      return;
    }
    event.preventDefault();
    if (rowIndex === tableSize[0] - 1) {
      const nextNode = getNode([...tableParentPath, tableIndex + 1]);
      if (!nextNode) return;
      focusEditor(editor, [...tableParentPath, tableIndex + 1]);
      return;
    }
    focusEditor(editor, [...tableParentPath, tableIndex, rowIndex + 1, cellIndex]);
    const { anchor: newAnchor } = editor.selection;
    Transforms.select(editor, { focus: newAnchor, anchor: newAnchor });
  }

  if (keyboardName === KEYBOARD.LEFT) {
    if (!isCursorAtCellStart(focus.offset)) return;
    event.preventDefault();
    if (rowIndex === 0 && cellIndex === 0) {
      if (tableIndex !== 0) {
        focusEditor(editor, [...tableParentPath, tableIndex - 1]);
      }
      return;
    }
    if (cellIndex === 0) {
      focusEditor(editor, [...tableParentPath, tableIndex, rowIndex - 1, tableSize[1] - 1]);
    } else {
      focusEditor(editor, [...tableParentPath, tableIndex, rowIndex, cellIndex - 1]);
    }
    const { focus: newFocus } = editor.selection;
    Transforms.select(editor, { focus: newFocus, anchor: newFocus });
  }

};

export const isLastTableCell = (editor, cellNode) => {
  if (cellNode[0].type !== ELEMENT_TYPE.TABLE_CELL) return false;
  const { tableSize } = getSelectedInfo(editor);
  const lastRowIndex = tableSize[0] - 1;
  const lastColumnIndex = tableSize[1] - 1;
  const cellNodePath = cellNode[1];
  const cellNodePathDeep = cellNodePath.length;
  return cellNodePath[cellNodePathDeep - 1] === lastColumnIndex && cellNodePath[cellNodePathDeep - 2] === lastRowIndex;
};

const getValidColor = (color) => {
  if (!color) return '';
  const validColor = color.length === 4 ? '#' + color.slice(1, 4).repeat(2) : color;
  return validColor.toUpperCase();
};

export const colorBlend = (c1, c2, ratio) => {
  const color1 = getValidColor(c1);
  const color2 = getValidColor(c2);
  if (!color1 && !color2) return 'unset';
  if (color1 && !color2) return color1;
  if (!color1 && color2) return color2;
  if (color1 === '#FFFFFF') return color2;
  if (color2 === '#FFFFFF') return color1;

  const validRatio = Math.max(Math.min(Number(ratio), 1), 0);
  let r1 = parseInt(color1.substring(1, 3), 16);
  let g1 = parseInt(color1.substring(3, 5), 16);
  let b1 = parseInt(color1.substring(5, 7), 16);
  let r2 = parseInt(color2.substring(1, 3), 16);
  let g2 = parseInt(color2.substring(3, 5), 16);
  let b2 = parseInt(color2.substring(5, 7), 16);
  let r = Math.round(r1 * (1 - validRatio) + r2 * validRatio);
  let g = Math.round(g1 * (1 - validRatio) + g2 * validRatio);
  let b = Math.round(b1 * (1 - validRatio) + b2 * validRatio);
  r = ('0' + (r || 0).toString(16)).slice(-2);
  g = ('0' + (g || 0).toString(16)).slice(-2);
  b = ('0' + (b || 0).toString(16)).slice(-2);
  return '#' + r + g + b;
};

export const getRowHeight = (element, rowIndex) => {
  const { style = {} } = element;
  const rowHeight = style[TABLE_ROW_STYLE.MIN_HEIGHT] || TABLE_ROW_MIN_HEIGHT;
  return rowIndex === 0 ? rowHeight + 1 : rowHeight;
};

export const getRowDomHeight = (editor, row) => {
  let height = 0;
  for (const cell of row.children) {
    const { is_combined, rowspan = 1 } = cell;
    if (is_combined || rowspan > 1) continue;
    let cellDom = null;
    try {
      cellDom = ReactEditor.toDOMNode(editor, cell);
    } catch (error) {
      if (!cellDom) break;
    }
    height = cellDom.getBoundingClientRect().height;
    break;
  }
  // if the row is empty, get the height from style
  if (!height) {
    height = row.style[TABLE_ROW_STYLE.MIN_HEIGHT] || TABLE_ROW_MIN_HEIGHT;
  }
  return height;
};

const normalizeTableCell = (editor, cell) => {
  if (!cell) return generateTableCell(editor);
  let newCell = { children: [{ text: '', id: slugid.nice() }], ...cell };

  // normalize cell children
  let newCellChildren = [];
  newCell.children.forEach((cellChild) => {
    const cellChildType = cellChild.type;
    if (cellChildType === ELEMENT_TYPE.PARAGRAPH) {
      newCellChildren.push(...cellChild.children);
    } else {
      newCellChildren.push(cellChild);
    }
  });
  newCell.children = newCellChildren.map(item => {
    if (item.BOLD) {
      item.bold = item.BOLD;
      delete item['BOLD'];
    }
    if (item.ITALIC) {
      item.italic = item.ITALIC;
      delete item['ITALIC'];
    }
    return item;
  });

  // normalize cell style
  if (newCell.data) {
    const cellStyle = { ...newCell.data };
    delete newCell['data'];
    Object.keys(cellStyle).forEach((cellStyleKey) => {
      if (cellStyleKey === 'align') {
        cellStyle['text_align'] = cellStyle['align'];
        delete cellStyle['align'];
      }
    });
    newCell.style = cellStyle;
  }
  return newCell;
};

export const normalizeTableELement = (editor, element) => {
  if (element.type !== ELEMENT_TYPE.TABLE) {
    const size = [element.children.length, element.children[0].children.length];
    return generateEmptyTable(editor, { size });
  }
  let newElement = { ...element };
  for (let i = 0; i < element.children.length; i++) {
    const row = newElement.children[i];
    for (let j = 0; j < row.children.length; j++) {
      row.children[j] = normalizeTableCell(editor, row.children[j]);
    }
    newElement.children[i] = row;
  }
  return newElement;
};

export const insertTableByTemplate = (editor, alternateColor) => {
  const size = [4, 4];
  const tableNode = generateEmptyTable(editor, {
    size,
    alternate_highlight_color: alternateColor,
    alternate_highlight: true
  });

  const path = Editor.path(editor, editor.selection);
  const insertPosition = getInsertPosition(editor);
  handleInsertTable(editor, insertPosition, path, tableNode);
};

/**
 * @param {Editor} editor
 * @param {InsertPosition} insertPosition
 * @param {Path} path
 * @param {Node} tableNode
 * Insert table by insertPosition
 */
export const handleInsertTable = (editor, insertPosition, path, tableNode) => {
  const { selection } = editor;
  if (insertPosition === INSERT_POSITION.BEFORE) {
    const insertPath = [path[0]];
    Transforms.insertNodes(editor, tableNode, { at: insertPath });
  } else if (insertPosition === INSERT_POSITION.AFTER) {
    const insertPath = [path[0] + 1];
    Transforms.insertNodes(editor, tableNode, { at: insertPath });
  } else if (insertPosition === INSERT_POSITION.CURRENT) {
    Transforms.splitNodes(editor, { at: selection, always: true });
    Transforms.insertNodes(editor, tableNode, { at: selection.anchor });
  }
  ReactEditor.focus(editor);
};

export const getInsertPosition = (editor) => {
  const { selection } = editor;

  if (!selection) return INSERT_POSITION.CURRENT;
  if (!Range.isCollapsed(selection)) return INSERT_POSITION.CURRENT;

  const aboveNodeEntry = getAboveBlockNode(editor);
  if (!aboveNodeEntry) return INSERT_POSITION.CURRENT;

  const isAtStart = Editor.isStart(editor, selection.anchor, aboveNodeEntry[1]);
  if (isAtStart) return INSERT_POSITION.BEFORE;

  const isAtEnd = Editor.isEnd(editor, selection.anchor, aboveNodeEntry[1]);
  if (isAtEnd) return INSERT_POSITION.AFTER;

  return INSERT_POSITION.CURRENT;
};

export const generateInheritStyle = (allowedInheritStyleList, style, cell) => {
  const inheritStyle = { ...cell['inherit_style'] } || {};
  for (const key in style) {
    if (Object.hasOwnProperty.call(style, key) && allowedInheritStyleList.includes(key)) {
      inheritStyle[key] = style[key];
    }
  }
  return inheritStyle;
};

export const getCellInheritStyles = (editor, tablePath, rowIndex, colIndex) => {
  const [tableNodeEntry] = Editor.nodes(editor, {
    match: n => n.type === ELEMENT_TYPE.TABLE,
    at: tablePath,
  });
  if (!tableNodeEntry) return {};
  const table = tableNodeEntry[0];
  const tableCell = table.children[rowIndex]?.children[colIndex];
  if (!tableCell) return {};
  return tableCell['inherit_style'] ?? {};
};

export const getCellHighlightClassName = (primaryColorClassName, rowIndex) => {
  let className = '';
  if (rowIndex === 0) {
    className = primaryColorClassName;
  } else if (rowIndex % 2 === 0) {
    className = TABLE_ALTERNATE_HIGHLIGHT_CLASS_MAP[primaryColorClassName];
  }
  return className;
};


export const focusClosestCellWhenJustifyCellSize = (editor, adjustingCell) => {
  const cellPath = ReactEditor.findPath(editor, adjustingCell);
  focusEditor(editor, Editor.end(editor, cellPath));
};

// Search main cell of combined cell
const searchCombinedMainCell = (table, startRowIndex, startColIndex) => {
  for (let rowIndex = startRowIndex; rowIndex >= 0; rowIndex--) {
    const row = table.children[rowIndex];
    for (let cellIndex = startColIndex; cellIndex >= 0; cellIndex--) {
      const currentCell = row.children[cellIndex];
      const { colspan = 0, rowspan = 0 } = currentCell;
      if (colspan <= 1 && rowspan <= 1) continue;
      const isInColRange = cellIndex + colspan >= startColIndex;
      const isInRowRange = rowIndex + rowspan >= startRowIndex;
      if (isInColRange && isInRowRange) {
        return { currentCell, rowIndex, cellIndex };
      } else break;
    }
  }
};

export const getResizeMaskCellInfo = (editor, table, rowIndex, cellIndex) => {
  // The cell shown cursor as resize (mouse is on this cell)
  const focusCellIndex = cellIndex;
  let focusCell = table.children[rowIndex].children[cellIndex];
  // The cell dominating resize handlers (the true cell to be resized)
  let cell = table.children[rowIndex].children[cellIndex];
  // Resolve combined cell
  if (cell.is_combined) {
    const targetCellInfo = searchCombinedMainCell(table, rowIndex, cellIndex);
    cellIndex = targetCellInfo.cellIndex;
    rowIndex = targetCellInfo.rowIndex;
    cell = targetCellInfo.currentCell;
  }
  const columns = table.columns;
  const focussedCell = ReactEditor.toDOMNode(editor, cell);
  const { colspan, rowspan } = focusCell;
  let width = columns[cellIndex].width;
  let height = focussedCell.getBoundingClientRect().height;
  // Calculate cell width and height
  if (colspan > 1) {
    let index = cellIndex + 1;
    while (index < cellIndex + colspan) {
      width += columns[index].width;
      index++;
    }
  }
  if (rowspan > 1) {
    let index = rowIndex + 1;
    while (index < rowIndex + rowspan) {
      const currentCell = table.children[index].children[cellIndex];
      const currentHeight = ReactEditor.toDOMNode(editor, currentCell).getBoundingClientRect().height;
      height += currentHeight;
      index++;
    }
  }
  return { width, height, top: focussedCell.offsetTop, left: focussedCell.offsetLeft, rowIndex, cellIndex, cell, focusCellIndex };
};

// Table alternate highlight
export const getHighlightClass = (editor, cellPath) => {
  const [tableEntry] = Editor.nodes(editor, { at: cellPath, match: n => n.type === ELEMENT_TYPE.TABLE });
  const { alternate_highlight, alternate_highlight_color } = tableEntry[0]?.ui || {};
  if (!alternate_highlight) return '';
  const rowIndex = cellPath[cellPath.length - 2];
  const className = getCellHighlightClassName(alternate_highlight_color, rowIndex);
  return className;
};

// Correct the selected range when combined cell are selected
export const adjustCombinedCellRange = (table, range) => {
  const { minRowIndex, maxRowIndex, minColIndex, maxColIndex } = range;
  const firstCell = table.children[minRowIndex].children[minColIndex];
  const { colspan = 0, rowspan = 0 } = firstCell;
  if (rowspan > 1 || colspan > 1) {
    const isRowCombined = minRowIndex + rowspan === maxRowIndex + 1;
    const isColCombined = minColIndex + colspan === maxColIndex + 1;
    if (isRowCombined && isColCombined) return EMPTY_SELECTED_RANGE;
  }
  return range;
};

/**
 *  Do not reset table selected range, when drag table column / row
 * @param {MouseEvent} event
 * @returns {Boolean}
 */
export const isPreventResetTableSelectedRange = (event) => {
  const { target } = event;
  const draggable = target.getAttribute('draggable');
  const isColumnHeader = target.classList.contains('sdoc-table-column-header');
  const isRowHeader = target.classList.contains('sdoc-table-row-header');
  const isHeader = isColumnHeader || isRowHeader;
  const isPreventReset = isHeader || draggable === 'true';
  return isPreventReset;
};

/**
 * Check drag type, column or row
 */
export const getTableDragType = (table, selectedRange) => {
  const rowCount = table.children.length;
  const { minRowIndex, maxRowIndex } = selectedRange;
  const isSelectColumn = minRowIndex === 0 && maxRowIndex === rowCount - 1;
  return isSelectColumn ? DRAG_HANDLER_COLUMN : DRAG_HANDLER_ROW;
};

const updateTableColumns = (editor, table, targetColIndex, startColIndex, endColIndex) => {
  const columns = [...table.columns];
  const deleteCount = endColIndex - startColIndex + 1;
  const newColumns = columns.splice(startColIndex, deleteCount);
  columns.splice(targetColIndex, 0, ...newColumns);
  updateColumnWidth(editor, table, columns);
};

export const moveColumns = (editor, targetColIndex, startColIndex, endColIndex) => {
  // Get selected table information
  const { table, tablePath } = getSelectedInfo(editor);
  // Check if moving columns forward or backward
  const isMoveToFroward = targetColIndex < startColIndex;

  // Iterate over each row in the table
  table.children.forEach((row, rowIndex) => {
    if (isMoveToFroward) {
      // Calculate target and source paths for moving columns forward
      const targetPath = [...tablePath, rowIndex, targetColIndex];
      const sourcePath = [...tablePath, rowIndex, endColIndex];

      // Move columns forward by inserting nodes
      for (let insertIndex = endColIndex; insertIndex >= startColIndex; insertIndex--) {
        const insertNode = row.children[insertIndex];
        Transforms.removeNodes(editor, { at: sourcePath });
        Transforms.insertNodes(editor, insertNode, { at: targetPath });
      }
    } else {
      // Calculate target and source paths for moving columns backward
      const targetPath = [...tablePath, rowIndex, targetColIndex - 1];
      const sourcePath = [...tablePath, rowIndex, startColIndex];

      // Move columns backward by inserting nodes
      for (let insertIndex = startColIndex; insertIndex <= endColIndex; insertIndex++) {
        const insertNode = row.children[insertIndex];
        Transforms.removeNodes(editor, { at: sourcePath });
        Transforms.insertNodes(editor, insertNode, { at: targetPath });
      }
    }
  });

  // Update table columns after moving
  updateTableColumns(editor, table, targetColIndex, startColIndex, endColIndex);

  // Set new selected range after moving columns
  const newSelectRange = {
    minRowIndex: 0,
    maxRowIndex: table.children.length - 1,
    minColIndex: targetColIndex,
    maxColIndex: targetColIndex + endColIndex - startColIndex,
  };
  setTableSelectedRange(editor, newSelectRange);
};

/**
 * Calculate the new selected range after dragging a column or row in the table.
 * @param {Object} table - The table object containing columns and rows.
 * @param {string} moveType - The type of drag operation (DRAG_HANDLER_COLUMN for column, DRAG_HANDLER_ROW for row).
 * @param {number} targetIndex - The index of the target column or row after dragging.
 * @param {number} startIndex - The index of the starting column or row before dragging.
 * @param {number} endIndex - The index of the ending column or row before dragging.
 * @returns {Object} - The new selected range after the drag operation.
 */
export const getTableSelectedRangeAfterDrag = (table, moveType, targetIndex, startIndex, endIndex) => {
  // Calculate the total number of columns and rows in the table
  const colCount = table.columns.length;
  const rowCount = table.children.length;

  // Initialize the new selected range with full table range
  const newSelectRange = {
    minRowIndex: 0,
    maxRowIndex: rowCount - 1,
    minColIndex: 0,
    maxColIndex: colCount - 1
  };

  // Determine if the drag movement is forward or backward
  const isMoveToFroward = targetIndex < startIndex;

  // Adjust selected range based on the type of drag operation
  if (moveType === DRAG_HANDLER_COLUMN) {
    if (isMoveToFroward) {
      newSelectRange.minColIndex = targetIndex;
      newSelectRange.maxColIndex = targetIndex + endIndex - startIndex;
    } else {
      const moveCount = endIndex - startIndex + 1;
      newSelectRange.minColIndex = targetIndex - moveCount;
      newSelectRange.maxColIndex = targetIndex - 1;
    }
  } else {
    if (isMoveToFroward) {
      newSelectRange.minRowIndex = targetIndex;
      newSelectRange.maxRowIndex = targetIndex + endIndex - startIndex;
    } else {
      const moveCount = endIndex - startIndex + 1;
      newSelectRange.minRowIndex = targetIndex - moveCount;
      newSelectRange.maxRowIndex = targetIndex - 1;
    }
  }

  return newSelectRange;
};

export const moveRows = (editor, targetRowIndex, startRowIndex, endRowIndex) => {
  const { table, tablePath } = getSelectedInfo(editor);
  const isMoveToFroward = targetRowIndex < startRowIndex;
  const targetPath = [...tablePath, isMoveToFroward ? targetRowIndex : targetRowIndex - 1];
  const sourcePath = [...tablePath, isMoveToFroward ? endRowIndex : startRowIndex];
  if (isMoveToFroward) {
    for (let insertIndex = endRowIndex; insertIndex >= startRowIndex; insertIndex--) {
      const insertNode = table.children[insertIndex];
      Transforms.removeNodes(editor, { at: sourcePath });
      Transforms.insertNodes(editor, insertNode, { at: targetPath });
    }
  } else {
    for (let insertIndex = startRowIndex; insertIndex <= endRowIndex; insertIndex++) {
      const insertNode = table.children[insertIndex];
      Transforms.removeNodes(editor, { at: sourcePath });
      Transforms.insertNodes(editor, insertNode, { at: targetPath });
    }
  }
  const newSelectRange = {
    minRowIndex: targetRowIndex,
    maxRowIndex: targetRowIndex + endRowIndex - startRowIndex,
    minColIndex: 0,
    maxColIndex: table.children.length - 1,
  };
  setTableSelectedRange(editor, newSelectRange);
};

export const generateDragMoveElement = (tipText) => {
  const canvasId = 'sdoc-drag-image';
  let canvas = document.getElementById(canvasId);
  if (!canvas) {
    let dpr = window.devicePixelRatio;
    canvas = document.createElement('canvas');
    canvas.width = 115;
    canvas.height = 30;
    canvas.id = canvasId;
    document.body.appendChild(canvas);
    let { width: cssWidth, height: cssHeight } = canvas.getBoundingClientRect();
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';
    canvas.width = dpr * cssWidth;
    canvas.height = dpr * cssHeight;
    canvas.style.position = 'fixed';
  }
  canvas.style.display = 'block';
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'rgb(241,243,246)';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.font = '22px Arial';
  context.textBaseline = 'middle';
  context.textAlign = 'center';
  context.fillStyle = 'black';
  context.fillText(tipText, canvas.width / 2, canvas.height / 2);
  return canvas;
};

export const isHideDragHandlerLine = (editor, displayType, table, cellPath, isDragOverCellHalf ) => {
  const pathLength = cellPath.length;
  let rowIndex = cellPath[pathLength - 2];
  let cellIndex = cellPath[pathLength - 1];

  // Check is above cell selected
  let currentCellDom = ReactEditor.toDOMNode(editor, table.children[rowIndex].children[cellIndex]);
  let isCurrentCellSelected = currentCellDom.classList.contains(CELL_SELECTED);
  if (isCurrentCellSelected) return true;


  if (isDragOverCellHalf) {
    if (displayType === DRAG_HANDLER_COLUMN) {
      cellIndex = cellIndex + 1;
    } else {
      rowIndex = rowIndex + 1;
    }
  }

  const isEndOfRowOrColumn = (displayType === DRAG_HANDLER_COLUMN && cellIndex === table.columns.length) || (displayType === DRAG_HANDLER_ROW && rowIndex === table.children.length);
  if (isEndOfRowOrColumn) return false;

  let preCellDom = null;
  if (displayType === DRAG_HANDLER_COLUMN && cellIndex > 0) {
    const prevCell = table.children[rowIndex].children[cellIndex - 1];
    preCellDom = ReactEditor.toDOMNode(editor, prevCell);

    // Check if there are merged cells in the columns before and after the drag line
    const beforeLineColumnHasCombined = table.children.find((item) => {
      const cell = item.children[cellIndex - 1];
      return cell.children.length > 1;
    });
    const afterLineColumnHasCombined = table.children.find((item) => {
      const cell = item.children[cellIndex];
      return cell?.is_combined === true;
    });
    if (beforeLineColumnHasCombined && afterLineColumnHasCombined) return true;
  } else if (displayType === DRAG_HANDLER_ROW && rowIndex > 0) {
    const prevCell = table.children[rowIndex - 1].children[cellIndex];
    preCellDom = ReactEditor.toDOMNode(editor, prevCell);

    // Check whether there are merged cells in the rows before and after the drag line
    const beforeLineRow = table.children[rowIndex - 1];
    const afterLineRow = table.children[rowIndex];
    const beforeLineRowHasCombined = beforeLineRow.children.find(item => item.children.length > 1);
    const afterLineRowHasCombined = afterLineRow.children.find(item => item?.is_combined === true);
    if (beforeLineRowHasCombined && afterLineRowHasCombined) return true;
  }

  // Check is above cell selected
  currentCellDom = ReactEditor.toDOMNode(editor, table.children[rowIndex].children[cellIndex]);
  isCurrentCellSelected = currentCellDom.classList.contains(CELL_SELECTED);
  if (isCurrentCellSelected) return true;

  // Check if the previous cell is selected
  const isPrevCellSelected = preCellDom && preCellDom.classList.contains(CELL_SELECTED);
  if (isPrevCellSelected) return true;

  let isCombined = false;
  // Check if the combined cell
  if (displayType === DRAG_HANDLER_COLUMN) {
    isCombined = table.children.some((row) => row.children[cellIndex - isDragOverCellHalf].is_combined);
  } else {
    isCombined = table.children[rowIndex - isDragOverCellHalf].children.some((cell) => cell.is_combined);
  }
  if (isCombined) return true;

  // Check is the last column
  if (displayType === DRAG_HANDLER_COLUMN) {
    const isLastColumn = cellIndex === table.columns.length - 1;
    if (isLastColumn) return false;
  }
};

export const getTableRowSelectedRange = (table, rowIndex) => {
  const row = table.children[rowIndex];
  const columnCount = row.children.length;
  let minRowIndex = rowIndex;
  let maxRowIndex = rowIndex;
  let minColIndex = 0;
  let maxColIndex = columnCount - 1;

  const findRowRange = (findRowIndex) => {
    let checkRow = table.children[findRowIndex];
    const combinedIndexes = checkRow.children.reduce((acc, cell, index) => {
      if (cell.is_combined) acc.push(index);
      if (cell.rowspan > 1) {
        maxRowIndex = Math.max(maxRowIndex, findRowIndex + cell.rowspan - 1);
        findRowRange(maxRowIndex);
      }
      return acc;
    }, []);
    combinedIndexes.some((combinedIndex) => {
      const { rowIndex: mainCellRowIndex, currentCell } = searchCombinedMainCell(table, findRowIndex, combinedIndex);
      if (minRowIndex > mainCellRowIndex) {
        minRowIndex = mainCellRowIndex;
        findRowRange(minRowIndex, 0);
        return false;
      } else if (maxRowIndex < mainCellRowIndex + currentCell.rowspan - 1) {
        maxRowIndex = mainCellRowIndex + currentCell.rowspan - 1;
        findRowRange(maxRowIndex, 0);
        return false;
      }
      return false;
    });
  };

  findRowRange(rowIndex);
  return { minRowIndex, maxRowIndex, minColIndex, maxColIndex };
};


export const getTableColumnSelectedRange = (table, columnIndex) => {
  let minRowIndex = 0;
  let maxRowIndex = table.children.length - 1;
  let minColIndex = columnIndex;
  let maxColIndex = columnIndex;

  const findColRange = (findColIndex) => {
    let combinedIndexes = [];
    table.children.forEach((row, rowIndex) => {
      const cell = row.children[findColIndex];
      if (cell.is_combined) combinedIndexes.push(rowIndex);
      if (cell.colspan > 1) {
        maxColIndex = Math.max(maxColIndex, findColIndex + cell.colspan - 1);
        findColRange(maxColIndex);
      }
    });
    combinedIndexes.some((combinedIndex) => {
      const { cellIndex: mainCellColIndex, currentCell } = searchCombinedMainCell(table, combinedIndex, findColIndex);
      if (minColIndex > mainCellColIndex) {
        minColIndex = mainCellColIndex;
        findColRange(minColIndex, 0);
        return false;
      } else if (maxColIndex < mainCellColIndex + currentCell.colspan - 1) {
        maxColIndex = mainCellColIndex + currentCell.colspan - 1;
        findColRange(maxColIndex, 0);
        return false;
      }
      return false;
    });
  };

  findColRange(columnIndex);
  return { minRowIndex, maxRowIndex, minColIndex, maxColIndex };
};

export const isTableWidthFitScreen = (editor) => {
  const { table } = getSelectedInfo(editor);
  const tableNode = ReactEditor.toDOMNode(editor, table);
  if (!tableNode) return;
  const tableDom = tableNode.querySelector('.sdoc-table-scroll-wrapper');
  const { width: tableWidth } = tableDom.getBoundingClientRect();
  const sdocWidth = editor.width;
  if (tableWidth >= sdocWidth) return true;

  return false;
};

export const fitTableColumnToScreen = (editor) => {
  const { table, tablePath } = getSelectedInfo(editor);
  const colCount = table.columns.length;
  const columnWidth = Math.max(TABLE_CELL_MIN_WIDTH, parseInt(editor.width / colCount));
  const columns = table.columns.map((column) => ({ ...column, width: columnWidth }));
  Transforms.setNodes(editor, { columns }, { at: tablePath });

};

export const deleteTableSelectCells = (editor, deleteRange) => {
  // eslint-disable-next-line no-unused-vars
  const { start, end, rowsLength, columnLength } = deleteRange;
  // table path [tableIdx, rowIdx, colIdx, ...];
  if (start.length <= 3) return;

  const tableIndex = start[0];
  const minRowIndex = start[1];

  let deletePaths = [];
  if (start[1] === end[1]) {
    const minColIndex = start[2];
    const maxColIndex = end[2];
    for (let colIndex = minColIndex; colIndex <= maxColIndex; colIndex++) {
      deletePaths.push([tableIndex, minRowIndex, colIndex]);
    }
  }

  if (start[1] !== end[1]) {
    const isAfter = end[1] - start[1] === 1;
    // push first row
    const minColIndex = start[2];
    for (let colIndex = minColIndex; colIndex <= columnLength - 1; colIndex++) {
      deletePaths.push([tableIndex, minRowIndex, colIndex]);
    }

    // push center row
    if (!isAfter) {
      for (let i = start[1] + 1; i <= end[1] - 1; i++) {
        for (let j = 0; j <= columnLength - 1; j++) {
          deletePaths.push([tableIndex, i, j]);
        }
      }
    }

    // push last row
    const maxColIndex = end[2];
    const maxRowIndex = end[1];
    for (let colIndex = 0; colIndex <= maxColIndex; colIndex++) {
      deletePaths.push([tableIndex, maxRowIndex, colIndex]);
    }
  }

  for (let i = 0; i < deletePaths.length; i++) {
    const path = deletePaths[i];
    const node = getNode(editor, path);
    const firstNode = node.children[0];
    replaceNodeChildren(editor, {
      at: path,
      nodes: { ...firstNode, text: '' },
    });
  }
};
