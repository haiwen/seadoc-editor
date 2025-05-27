import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { useSlateStatic } from '@seafile/slate-react';
import PropTypes from 'prop-types';
import { eventStopPropagation, getMouseDownInfo, getMouseMoveInfo, registerResizeEvents, unregisterResizeEvents } from '../../../../../utils/mouse-event';
import { TABLE_CELL_MIN_WIDTH } from '../../constants';
import { focusClosestCellWhenJustifyCellSize, getTableColumns, updateColumnWidth } from '../../helpers';
import { useTableRootContext } from '../hooks';

const FirstColumnResizeHandler = ({ column, left: initLeft, table, cellIndex, rowBottoms, hideResizeHandlers, mouseDownEvent, adjustingCell, isDraggingResizeHandler }) => {
  const editor = useSlateStatic();
  const resizeHandler = useRef(null);
  const [left, setLeft] = useState(initLeft);
  const [mouseDownInfo, setMouseDownInfo] = useState({});
  const [style, setStyle] = useState({});
  const width = column.width;
  const tableRootScrollContainer = useTableRootContext();

  useLayoutEffect(() => {
    const mouseDownInfo = getMouseDownInfo(mouseDownEvent, tableRootScrollContainer);
    const { top } = tableRootScrollContainer.getBoundingClientRect();
    setStyle({ left: mouseDownInfo.positionX - 2, height: tableRootScrollContainer.clientHeight, top });
    setMouseDownInfo(mouseDownInfo);
  }, [mouseDownEvent, tableRootScrollContainer]);

  useEffect(() => {
    if (!isDraggingResizeHandler) return;
    const onMouseMove = (event) => {
      eventStopPropagation(event);
      const mouseMoveInfo = getMouseMoveInfo(event, mouseDownInfo, tableRootScrollContainer);
      const newWidth = width - mouseMoveInfo.displacementX;
      if (newWidth < TABLE_CELL_MIN_WIDTH) return;
      const left = initLeft - mouseMoveInfo.displacementX;
      const { top } = tableRootScrollContainer.getBoundingClientRect();
      setStyle({ left: event.clientX - 2, height: tableRootScrollContainer.clientHeight, top });
      setLeft(left);
    };

    const onMouseUp = (event) => {
      eventStopPropagation(event);
      setStyle({});
      const columns = getTableColumns(editor, table);
      const newColumns = columns.slice(0,);
      const column = newColumns[cellIndex];
      const newWidth = width + left - initLeft;
      newColumns[cellIndex] = { ...column, width: newWidth };
      updateColumnWidth(editor, table, newColumns);
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
  }, [isDraggingResizeHandler, mouseDownInfo, left, width, column, editor, table, cellIndex, initLeft, rowBottoms]);

  return (
    <div
      className='table-cell-width-just resizing position-fixed'
      contentEditable={false}
      style={style}
      ref={resizeHandler}
    >
      <div className="table-cell-width-just-color-tip"></div>
    </div>
  );

};

FirstColumnResizeHandler.propTypes = {
  column: PropTypes.object,
  cellIndex: PropTypes.number,
  left: PropTypes.number,
  table: PropTypes.object,
  editor: PropTypes.object,
  adjustingCell: PropTypes.object,
};

export default FirstColumnResizeHandler;
