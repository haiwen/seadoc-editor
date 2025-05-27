/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';
import { useSlateStatic } from '@seafile/slate-react';
import PropTypes from 'prop-types';
import { getNode, findPath } from '../../../../core';
import { RESIZE_HANDLER_COLUMN, RESIZE_HANDLER_ROW, RESIZE_HANDLER_FIRST_COLUMN } from '../../constants';
import { getTableColumns } from '../../helpers';
import { useResizeHandlersContext } from '../hooks';
import ColumnResizeHandler from './column-resize-handler';
import FirstColumnResizeHandler from './first-column-left-resize-handler';
import RowResizeHandler from './row-resize-handler';

const ResizeHandlers = ({ element, resizeCellMaskInfo, hideResizeHandlers, isDraggingResizeHandler }) => {
  const { rowIndex, cellIndex, top, height, left, mouseDownEvent, displayType, cell } = resizeCellMaskInfo;
  const editor = useSlateStatic();
  const tablePath = findPath(editor, element);
  if (!tablePath) return null;
  const table = getNode(editor, tablePath);
  if (!table) return null;

  const columns = useResizeHandlersContext() || getTableColumns(editor, element);
  const rowBottom = top + height;

  return (
    <>
      {displayType === RESIZE_HANDLER_ROW && (
        <RowResizeHandler
          initRowBottom={rowBottom}
          rowIndex={rowIndex}
          table={element}
          hideResizeHandlers={hideResizeHandlers}
          mouseDownEvent={mouseDownEvent}
          adjustingCell={cell}
          isDraggingResizeHandler={isDraggingResizeHandler}
        />
      )}

      {displayType === RESIZE_HANDLER_FIRST_COLUMN && (
        <FirstColumnResizeHandler
          key="column-0-left"
          column={columns[0]}
          left={0}
          cellIndex={0}
          table={element}
          rowBottoms={rowBottom}
          hideResizeHandlers={hideResizeHandlers}
          mouseDownEvent={mouseDownEvent}
          adjustingCell={cell}
          isDraggingResizeHandler={isDraggingResizeHandler}
        />
      )}
      {displayType === RESIZE_HANDLER_COLUMN && (
        <ColumnResizeHandler
          rowBottom={rowBottom}
          column={element.columns[cellIndex]}
          left={left}
          cellIndex={cellIndex}
          table={element}
          hideResizeHandlers={hideResizeHandlers}
          mouseDownEvent={mouseDownEvent}
          adjustingCell={cell}
          isDraggingResizeHandler={isDraggingResizeHandler}
        />
      )}
    </>);
};

ResizeHandlers.propTypes = {
  element: PropTypes.object,
};

export default ResizeHandlers;
