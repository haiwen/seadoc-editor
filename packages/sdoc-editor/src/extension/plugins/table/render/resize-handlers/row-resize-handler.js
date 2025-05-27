import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useSlateStatic, ReactEditor } from '@seafile/slate-react';
import PropTypes from 'prop-types';
import { useScrollContext } from '../../../../../hooks/use-scroll-context';
import { eventStopPropagation, getMouseDownInfo, getMouseMoveInfo, registerResizeEvents, unregisterResizeEvents } from '../../../../../utils/mouse-event';
import { TABLE_ROW_MIN_HEIGHT } from '../../constants';
import { focusClosestCellWhenJustifyCellSize, getRowHeight, updateTableRowHeight } from '../../helpers';

const RowResizeHandler = ({ rowIndex, initRowBottom = 0, table, hideResizeHandlers, mouseDownEvent, adjustingCell, isDraggingResizeHandler }) => {
  const editor = useSlateStatic();
  const [rowBottom, setRowBottom] = useState(initRowBottom);
  const [mouseDownInfo, setMouseDownInfo] = useState({});
  const [style, setStyle] = useState({});
  const row = table.children[rowIndex];
  const rowHeight = getRowHeight(row, rowIndex);
  const tableRow = useRef(rowHeight);
  const [height, setHeight] = useState(rowHeight);
  const scrollContent = useScrollContext();

  useLayoutEffect(() => {
    const mouseDownInfo = getMouseDownInfo(mouseDownEvent, scrollContent.current);
    setMouseDownInfo(mouseDownInfo);
    const lastRowOffset = rowIndex === table.children.length - 1 ? -2 : 0;
    setStyle({ top: rowBottom + lastRowOffset });
  }, [mouseDownEvent, rowBottom, rowIndex, scrollContent, table.children.length]);

  useEffect(() => {
    if (!isDraggingResizeHandler) return;
    const onMouseMove = (event) => {
      eventStopPropagation(event);
      const mouseMoveInfo = getMouseMoveInfo(event, mouseDownInfo, scrollContent.current);
      const newHeight = tableRow.current + mouseMoveInfo.displacementY;
      const validHeight = Math.max(TABLE_ROW_MIN_HEIGHT, newHeight);
      setHeight(validHeight);
      setStyle({ top: rowBottom - tableRow.current + validHeight });
    };

    const onMouseUp = (event) => {
      eventStopPropagation(event);
      tableRow.current = height;
      updateTableRowHeight(editor, row, height);
      focusClosestCellWhenJustifyCellSize(editor, adjustingCell);
      hideResizeHandlers();
    };
    registerResizeEvents({
      'mousemove': onMouseMove,
      'mouseup': onMouseUp,
    });
    return () => {
      unregisterResizeEvents({
        'mousemove': onMouseMove,
        'mouseup': onMouseUp,
      });
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDraggingResizeHandler, mouseDownInfo, rowBottom, table, height]);

  useEffect(() => {
    const cell = row.children.filter(cell => !cell.is_combined && (!cell.rowspan || cell.rowspan === 1))[0];
    if (!cell) return;
    const rowDom = ReactEditor.toDOMNode(editor, cell);
    if (!rowDom) return;
    tableRow.current = rowDom.clientHeight;
    setRowBottom(initRowBottom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row, initRowBottom]);

  return (
    <div
      className='table-row-height-just position-absolute resizing'
      contentEditable={false}
      style={style}
    >
      <div className="table-row-height-just-color-tip"></div>
    </div>
  );
};

RowResizeHandler.propTypes = {
  rowIndex: PropTypes.number,
  initRowBottom: PropTypes.number,
  table: PropTypes.object,
  editor: PropTypes.object,
  adjustingCell: PropTypes.object,
};

export default RowResizeHandler;
