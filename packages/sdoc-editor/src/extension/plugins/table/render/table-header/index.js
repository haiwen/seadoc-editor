import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import ObjectUtils from '../../../../../utils/object-utils';
import { TABLE_DRAG_KEY } from '../../../../constants';
import { DRAG_HANDLER_COLUMN, DRAG_HANDLER_ROW, EMPTY_SELECTED_RANGE } from '../../constants';
import { generateDragMoveElement, getTableDragType, getTableRowSelectedRange, getTableColumnSelectedRange } from '../../helpers';
import { useResizeHandlersContext, useTableSelectedRangeContext } from '../hooks';
import ColumnsHeader from './columns-header';
import RowsColumnsHeader from './rows-columns-header';
import RowsHeader from './rows-header';

import './index.css';

const TableHeader = ({ editor, table, setSelectedRange, setIsDragMove }) => {
  const { t } = useTranslation('sdoc-editor');
  const columns = useResizeHandlersContext();
  const selectedRange = useTableSelectedRangeContext() || EMPTY_SELECTED_RANGE;

  const selectColumn = useCallback((columnIndex) => {
    const selectedRange = getTableColumnSelectedRange(table, columnIndex);
    setSelectedRange(selectedRange);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, columns]);

  const selectRow = useCallback((rowIndex) => {
    const selectedRange = getTableRowSelectedRange(table, rowIndex);
    setSelectedRange(selectedRange);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, columns]);

  const selectTable = useCallback(() => {
    const columnsCount = columns.length;
    const rowsCount = table.children.length;

    const range = {
      minRowIndex: 0,
      maxRowIndex: rowsCount - 1,
      minColIndex: 0,
      maxColIndex: columnsCount - 1,
    };
    setSelectedRange(range);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, columns]);

  const tableSize = [table.children.length, columns.length];

  const handleDragStart = (event) => {
    event.stopPropagation();
    let { tableSelectedRange } = editor;
    if (ObjectUtils.isSameObject(tableSelectedRange, EMPTY_SELECTED_RANGE)) {
      event.preventDefault();
      return;
    }
    const tableId = table.id;
    const { minColIndex, maxColIndex, minRowIndex, maxRowIndex } = tableSelectedRange;
    const dragType = getTableDragType(table, selectedRange);
    const startIndex = dragType === DRAG_HANDLER_COLUMN ? minColIndex : minRowIndex;
    const endIndex = dragType === DRAG_HANDLER_ROW ? maxRowIndex : maxColIndex;
    const data = { tableId, dragType, startIndex, endIndex };
    const dragData = JSON.stringify(data);
    event.dataTransfer.setData(TABLE_DRAG_KEY, dragData);
    event.dataTransfer.effectAllowed = 'move';
    const moveCount = endIndex - startIndex + 1;
    const tipText = dragType === DRAG_HANDLER_COLUMN
      ? t('Move_column_count', { count: moveCount })
      : t('Move_row_count', { count: moveCount });
    const dragImage = generateDragMoveElement(tipText);
    event.dataTransfer.setDragImage(dragImage, 0, 0);
    setIsDragMove(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  const handleDragEnd = (event) => {
    setIsDragMove(false);
    const indicator = document.getElementById('sdoc-drag-image');
    if (indicator) {
      indicator.style.display = 'none';
    }
  };

  return (
    <div>
      <ColumnsHeader table={table} selectRange={selectColumn} tableSize={tableSize} handleDragStart={handleDragStart} handleDragEnd={handleDragEnd} />
      <RowsColumnsHeader selectRange={selectTable} tableSize={tableSize} />
      <RowsHeader table={table} selectRange={selectRow} tableSize={tableSize} handleDragStart={handleDragStart} handleDragEnd={handleDragEnd} />
    </div>
  );

};

TableHeader.propTypes = {
  table: PropTypes.object,
  setSelectedRange: PropTypes.func,
  setIsDragMove: PropTypes.func,
  editor: PropTypes.object,
};

export default TableHeader;
