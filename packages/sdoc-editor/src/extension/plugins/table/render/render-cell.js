import React, { useCallback, useMemo, useRef } from 'react';
import { Editor, Transforms } from '@seafile/slate';
import { useSlateStatic, useReadOnly } from '@seafile/slate-react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { INTERNAL_EVENT } from '../../../../constants';
import EventBus from '../../../../utils/event-bus';
import ObjectUtils from '../../../../utils/object-utils';
import { TABLE_DRAG_KEY } from '../../../constants';
import { findPath, focusEditor } from '../../../core';
import { CELL_SELECTED, DRAG_HANDLER_COLUMN, EMPTY_SELECTED_RANGE, SELECTED_TABLE_CELL_BACKGROUND_COLOR, TABLE_CELL_STYLE } from '../constants';
import { colorBlend, getHighlightClass, getResizeMaskCellInfo, getTableDragType, moveColumns, moveRows, isHideDragHandlerLine, getTableSelectedRangeAfterDrag } from '../helpers';
import { useTableSelectedRangeContext } from './hooks';

const TableCell = ({ attributes, element, children }) => {
  const editor = useSlateStatic();
  const selectedRange = useTableSelectedRangeContext() || EMPTY_SELECTED_RANGE;
  const cellPath = findPath(editor, element, [0, 0]);
  const pathLength = cellPath.length;
  const rowIndex = cellPath[pathLength - 2];
  const cellIndex = cellPath[pathLength - 1];
  const rowEntry = Editor.parent(editor, cellPath);
  const tableEntry = Editor.parent(editor, rowEntry[1]);
  const { minColIndex, maxColIndex, minRowIndex, maxRowIndex } = selectedRange;
  const isRowSelected = rowIndex >= minRowIndex && rowIndex <= maxRowIndex;
  const isSelected = isRowSelected && cellIndex >= minColIndex && cellIndex <= maxColIndex;
  const isSelectedFirstCell = isSelected && cellIndex === minColIndex;
  const isSelectedLastCell = isSelected && cellIndex === maxColIndex;
  const isSelectedFirstRow = isSelected && rowIndex === minRowIndex;
  const isSelectedLastRow = isSelected && rowIndex === maxRowIndex;
  const eventBus = EventBus.getInstance();
  const tableId = tableEntry[0].id;
  const canDrop = useRef(false);
  const isDragOverHalfCell = useRef(false);


  const onContextMenu = useCallback((event) => {
    const path = findPath(editor, element);
    focusEditor(editor, path);
    Transforms.collapse(editor, { edge: 'end' });
  }, [editor, element]);

  let style = attributes.style || {};
  if (ObjectUtils.hasProperty(element.style, TABLE_CELL_STYLE.TEXT_ALIGN)) {
    style['textAlign'] = element.style[TABLE_CELL_STYLE.TEXT_ALIGN];
  }

  if (isSelected) {
    style['backgroundColor'] = SELECTED_TABLE_CELL_BACKGROUND_COLOR;
  }

  if (ObjectUtils.hasProperty(element.style, TABLE_CELL_STYLE.BACKGROUND_COLOR)) {
    const color = element.style[TABLE_CELL_STYLE.BACKGROUND_COLOR];
    if (color && (color !== 'transparent' && color !== 'unset')) {
      style['backgroundColor'] = isSelected ? colorBlend(SELECTED_TABLE_CELL_BACKGROUND_COLOR, color, 0.9) : color;
    }
  }

  if (element.is_combined) {
    style.display = 'none';
  }

  if (rowIndex === 0) {
    style.borderTop = '1px solid #ddd';
  }

  if (cellIndex === 0) {
    style.borderLeft = '1px solid #ddd';
  }

  const { rowspan = 1, colspan = 1 } = element;
  style.gridArea = `${rowIndex + 1} / ${cellIndex + 1} / span ${rowspan} / span ${colspan}`;

  if (element.style) {
    style = { ...element.style, ...style };
  }

  const onMouseMove = (mouseDownEvent) => {
    eventBus.dispatch(INTERNAL_EVENT.TABLE_CELL_MOUSE_ENTER, { mouseDownEvent, cell: element, rowIndex, cellIndex, tableId });
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const highlightClass = useMemo(() => getHighlightClass(editor, cellPath), []);

  const onDragOver = useCallback((event) => {
    const { target } = event;
    const table = tableEntry[0];
    const displayType = getTableDragType(table, selectedRange);
    const resizeMaskCellInfo = getResizeMaskCellInfo(editor, table, rowIndex, cellIndex);
    const cellInfo = { ...resizeMaskCellInfo, displayType, mouseDownEvent: event, tableId };

    if (cellInfo.displayType === DRAG_HANDLER_COLUMN) {
      const offsetX = cellInfo.mouseDownEvent.nativeEvent.offsetX;
      const cellWidth = cellInfo.width;
      const cellIndex = cellInfo.cellIndex;
      // To avoid the drag handler line being covered by the table border
      if (cellIndex === 0) cellInfo.left += 1;
      if (cellIndex === table.children[0].children.length - 1) cellInfo.left -= 2;

      if (offsetX >= cellWidth / 2) {
        cellInfo.left = cellInfo.left + cellWidth;
        isDragOverHalfCell.current = true;
      } else {
        isDragOverHalfCell.current = false;
      }
    } else {
      const offsetY = cellInfo.mouseDownEvent.nativeEvent.offsetY;
      const cellHeight = cellInfo.height;
      const rowIndex = cellInfo.rowIndex;
      // To avoid the drag handler line being covered by the table border
      if (rowIndex === 0) cellInfo.top += 1;
      if (rowIndex === table.children.length - 1) cellInfo.top -= 2;

      if (offsetY >= cellHeight / 2) {
        cellInfo.top = cellInfo.top + cellHeight;
        isDragOverHalfCell.current = true;
      } else {
        isDragOverHalfCell.current = false;
      }
    }

    const isHideHandleLine = isHideDragHandlerLine(editor, displayType, table, cellPath, isDragOverHalfCell.current);
    canDrop.current = !isHideHandleLine;
    if (target.classList.contains(CELL_SELECTED) || isHideHandleLine) {
      cellInfo.top = -9999;
      cellInfo.left = -9999;
    }

    eventBus.dispatch(INTERNAL_EVENT.TABLE_SHOW_DRAG_HANDLER, cellInfo);
  }, [cellIndex, cellPath, editor, eventBus, rowIndex, selectedRange, tableEntry, tableId]);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    if (!canDrop.current) return;
    const { target } = event;
    if (target.classList.contains(CELL_SELECTED)) return;
    const dragDataJson = event.dataTransfer.getData(TABLE_DRAG_KEY);
    if (!dragDataJson) return;
    const dragData = JSON.parse(dragDataJson);
    if (dragData) {
      const offset = isDragOverHalfCell.current ? 1 : 0;
      const { tableId: dragTableId, startIndex, endIndex, dragType } = dragData;
      if (dragTableId !== tableId) return;
      dragType === DRAG_HANDLER_COLUMN
        ? moveColumns(editor, cellIndex + offset, startIndex, endIndex)
        : moveRows(editor, rowIndex + offset, startIndex, endIndex);
      const range = dragType === DRAG_HANDLER_COLUMN
        ? getTableSelectedRangeAfterDrag(tableEntry[0], dragType, cellIndex + offset, startIndex, endIndex)
        : getTableSelectedRangeAfterDrag(tableEntry[0], dragType, rowIndex + offset, startIndex, endIndex);
      eventBus.dispatch(INTERNAL_EVENT.SET_TABLE_SELECT_RANGE, tableEntry[0], range );
    }
  }, [cellIndex, editor, eventBus, rowIndex, tableEntry, tableId]);


  return (
    <div
      {...attributes}
      style={{ ...element.style, ...style }}
      className={classnames('table-cell', attributes.className, highlightClass, {
        [CELL_SELECTED]: isSelected,
        'cell-light-height-left-border': isSelectedFirstCell,
        'cell-light-height-right-border': isSelectedLastCell,
        'cell-light-height-top-border': isSelectedFirstRow,
        'cell-light-height-bottom-border': isSelectedLastRow,
      })}
      data-id={element.id}
      row-index={rowIndex}
      cell-index={cellIndex}
      onContextMenu={onContextMenu}
      onMouseMove={onMouseMove}
      onDragOver={onDragOver}
      onDrop={handleDrop}
    >
      <div className='sdoc-cell-container'>{children}</div>
    </div>
  );
};

TableCell.propTypes = {
  className: PropTypes.string,
  attributes: PropTypes.object,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.array]),
};

function renderTableCell(props) {

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const readOnly = useReadOnly();

  if (readOnly) {
    const { attributes, children, element } = props;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const editor = useSlateStatic();
    const cellPath = findPath(editor, element, [0, 0]);
    if (!cellPath) return null;
    const pathLength = cellPath.length;
    const rowIndex = cellPath[pathLength - 2];
    const cellIndex = cellPath[pathLength - 1];

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const highlightClass = useMemo(() => getHighlightClass(editor, cellPath), [cellPath, editor]);

    // const cellValue = element;
    let style = attributes.style || {};
    if (ObjectUtils.hasProperty(element.style, TABLE_CELL_STYLE.TEXT_ALIGN)) {
      style['textAlign'] = element.style[TABLE_CELL_STYLE.TEXT_ALIGN];
    }

    if (ObjectUtils.hasProperty(element.style, TABLE_CELL_STYLE.BACKGROUND_COLOR) && element.style[TABLE_CELL_STYLE.BACKGROUND_COLOR]) {
      style['backgroundColor'] = element.style[TABLE_CELL_STYLE.BACKGROUND_COLOR];
    }

    if (element.is_combined) {
      style.display = 'none';
    }

    if (rowIndex === 0) {
      style.borderTop = '1px solid #ddd';
    }

    if (cellIndex === 0) {
      style.borderLeft = '1px solid #ddd';
    }

    const { rowspan = 1, colspan = 1 } = element;
    style.gridArea = `${rowIndex + 1} / ${cellIndex + 1} / span ${rowspan} / span ${colspan}`;


    return (
      <div
        {...attributes}
        style={{ ...element.style, ...style }}
        className={classnames('table-cell', highlightClass, attributes.className)}
        data-id={element.id}
      >
        <div className='sdoc-cell-container'>{children}</div>
      </div>
    );
  }

  return (
    <TableCell {...props} />
  );
}

export default renderTableCell;
