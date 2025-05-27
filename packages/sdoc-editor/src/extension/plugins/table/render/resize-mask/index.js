import React, { useCallback, useEffect, useState } from 'react';
import { INTERNAL_EVENT } from '../../../../../constants';
import EventBus from '../../../../../utils/event-bus';
import {
  RESIZE_MASK_TOP,
  RESIZE_MASK_RIGHT,
  RESIZE_MASK_BOTTOM,
  RESIZE_MASK_LEFT,
  RESIZE_HANDLER_ROW,
  RESIZE_HANDLER_COLUMN,
  RESIZE_HANDLER_FIRST_COLUMN
} from '../../constants';
import { getResizeMaskCellInfo } from '../../helpers';

import '../index.css';

const ResizeMask = ({ editor, table, handleShowResizeHandler, hideResizeHandlers, handlerStartDragging, isDraggingResizeHandler }) => {
  const [cellInfo, setCellInfo] = useState({});
  const [maskStyle, setMaskStyle] = useState({});

  const handleCellMouseMove = useCallback((cellInfo) => {
    const { mouseDownEvent, rowIndex, cellIndex, tableId } = cellInfo;
    if (table.id !== tableId) return;
    const resizeMaskCellInfo = getResizeMaskCellInfo(editor, table, rowIndex, cellIndex);
    const { width, height, top, left } = resizeMaskCellInfo;
    setMaskStyle({ width, height, top, left });
    setCellInfo({ ...resizeMaskCellInfo, mouseDownEvent });
  }, [editor, table]);

  useEffect(() => {
    const eventBus = EventBus.getInstance();
    const unSubscribe = eventBus.subscribe(INTERNAL_EVENT.TABLE_CELL_MOUSE_ENTER, handleCellMouseMove);

    return () => {
      unSubscribe();
    };
  }, [handleCellMouseMove]);

  const getHandlerDisplayInfo = useCallback((mode) => {
    let resizeHandlerInfo = {};
    if (mode === RESIZE_MASK_BOTTOM) resizeHandlerInfo = { ...cellInfo, ...maskStyle, displayType: RESIZE_HANDLER_ROW };
    if (mode === RESIZE_MASK_RIGHT) resizeHandlerInfo = { ...cellInfo, ...maskStyle, displayType: RESIZE_HANDLER_COLUMN };
    if (mode === RESIZE_MASK_LEFT) {
      const { cellIndex, rowIndex, focusCellIndex, mouseDownEvent } = cellInfo;
      const calculateCellIndex = cellIndex === 0 ? 0 : cellIndex - 1;
      const resizeMaskCellInfo = getResizeMaskCellInfo(editor, table, rowIndex, calculateCellIndex);
      const displayType = focusCellIndex === 0 ? RESIZE_HANDLER_FIRST_COLUMN : RESIZE_HANDLER_COLUMN;
      resizeHandlerInfo = { displayType, ...resizeMaskCellInfo, mouseDownEvent };
    }
    if (mode === RESIZE_MASK_TOP) {
      const { rowIndex, cellIndex, mouseDownEvent } = cellInfo;
      const resizeMaskCellInfo = getResizeMaskCellInfo(editor, table, rowIndex - 1, cellIndex);
      resizeHandlerInfo = { displayType: RESIZE_HANDLER_ROW, ...resizeMaskCellInfo, mouseDownEvent: mouseDownEvent };
    }
    return resizeHandlerInfo;
  }, [cellInfo, editor, maskStyle, table]);

  const handleMouseDown = useCallback((event, mode) => {
    event.stopPropagation();
    event.preventDefault();
    handlerStartDragging();
    const handlerInfo = getHandlerDisplayInfo(mode);
    handleShowResizeHandler(handlerInfo);
  }, [getHandlerDisplayInfo, handleShowResizeHandler, handlerStartDragging]);

  const handleMouseOut = useCallback((event) => {
    event.stopPropagation();
    event.preventDefault();
    if (isDraggingResizeHandler) return;
    hideResizeHandlers();
  }, [hideResizeHandlers, isDraggingResizeHandler]);

  return (
    <div className='sdoc-table-resize-mask' style={maskStyle}>
      {cellInfo.rowIndex !== 0 && (
        <div onMouseOut={handleMouseOut} onMouseDown={(e) => handleMouseDown(e, RESIZE_MASK_TOP)} className='sdoc-table-resize-top'></div>
      )}
      <div onMouseOut={handleMouseOut} onMouseDown={(e) => handleMouseDown(e, RESIZE_MASK_RIGHT)} className='sdoc-table-resize-right'></div>
      <div onMouseOut={handleMouseOut} onMouseDown={(e) => handleMouseDown(e, RESIZE_MASK_BOTTOM)} className='sdoc-table-resize-bottom'></div>
      <div onMouseOut={handleMouseOut} onMouseDown={(e) => handleMouseDown(e, RESIZE_MASK_LEFT)} className='sdoc-table-resize-left'></div>
    </div>
  );
};

export default ResizeMask;
