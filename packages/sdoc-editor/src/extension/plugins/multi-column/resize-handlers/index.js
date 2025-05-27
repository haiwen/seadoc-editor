import React, { useEffect, useState } from 'react';
import { Editor } from '@seafile/slate';
import { useSlateStatic, ReactEditor } from '@seafile/slate-react';
import PropTypes from 'prop-types';
import { registerResizeEvents, unregisterResizeEvents } from '../../../../utils/mouse-event';
import { COLUMN_MIN_WIDTH } from '../constants';
import { updateColumnWidth } from '../helper';
import ColumnResizeHandler from './column-resize-handler';

const ResizeHandlers = ({ element, handleResizeColumn }) => {
  const editor = useSlateStatic();
  const [column, setColumn] = useState(element.column);
  const [isDraggingResizeHandler, setIsDraggingResizeHandler] = useState(false);
  const [adjustingCell, setAdjustingCell] = useState(null);
  const [resizeInfo, setResizeInfo] = useState({
    initialX: 0,
    cellWidths: [],
  });
  const [isMouseNearBorder, setIsMouseNearBorder] = useState(column.map(() => false));

  const handleMouseDown = (index, event) => {
    event.preventDefault();
    const cellWidths = column.map(col => col.width);

    setResizeInfo({
      initialX: event.clientX,
      cellWidths,
      index,
    });
    setIsDraggingResizeHandler(true);
    setAdjustingCell(index);
  };

  // Render when column element of multi_column node changes
  useEffect(() => {
    setColumn(element.column);
  }, [element.column]);

  useEffect(() => {
    const path = ReactEditor.findPath(editor, element);
    const [node] = Editor.node(editor, path);
    const domNode = ReactEditor.toDOMNode(editor, node);
    if (!domNode.querySelectorAll('.column')) return;
    const childNodes = Array.from(domNode.querySelectorAll('.column'));

    const onMouseMove = (event) => {
      event.preventDefault();
      // Let resize handler show when mouse is close to right edge of column at range of 20 px
      const nearBorder = column.map((col, colIndex) => {
        const child = childNodes[colIndex];
        if (!child) return false;
        const childRect = child.getBoundingClientRect();
        const isMouseInColumn = event.clientY >= childRect.top && event.clientY <= childRect.bottom;
        const isChildNearRightBorder = isMouseInColumn && Math.abs(event.clientX - childRect.right) < 20;
        return isChildNearRightBorder;
      });
      if (JSON.stringify(nearBorder) !== JSON.stringify(isMouseNearBorder)) {
        setIsMouseNearBorder(nearBorder);
      }

      if (!isDraggingResizeHandler) return;

      const { initialX, cellWidths, index } = resizeInfo;
      // Let last resize handler do not work
      if (!cellWidths[index + 1]) return;

      // Calculate new width of two close column when moving resize handler
      const deltaX = Math.min(event.clientX - initialX, cellWidths[index + 1] - COLUMN_MIN_WIDTH);
      const newWidth = Math.max(cellWidths[index] + deltaX, COLUMN_MIN_WIDTH);

      if (cellWidths[index] === COLUMN_MIN_WIDTH && deltaX < 0) return;

      const updatedColumn = column.map((column, colIndex) => {
        if (colIndex === index) {
          return { ...column, width: newWidth };
        } else if (colIndex === index + 1) {
          return { ...column, width: cellWidths[index] + cellWidths[index + 1] - newWidth };
        }
        return column;
      });

      setColumn(updatedColumn);
    };

    const onMouseUp = (event) => {
      event.preventDefault();
      if (adjustingCell === null) return;

      const newColumn = column.map(column => ({
        ...column,
        left: column.width,
      }));

      handleResizeColumn(newColumn);
      updateColumnWidth(editor, element, newColumn);
      setIsDraggingResizeHandler(false);
      setAdjustingCell(null);
    };

    registerResizeEvents({
      'mousemove': onMouseMove,
      'mouseup': onMouseUp,
      'mouseleave': onMouseUp,
    });

    return () => {
      unregisterResizeEvents({
        'mousemove': onMouseMove,
        'mouseup': onMouseUp,
        'mouseleave': onMouseUp,
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleResizeColumn, column, isDraggingResizeHandler, isMouseNearBorder]);

  let leftAccumulator = 0;
  return (
    <div className='column-resize-handler' contentEditable={false}>
      {column.map((column, index) => {
        leftAccumulator += (column.width);
        const left = leftAccumulator;
        return (
          <React.Fragment key={index}>
            {index === 0 && (
              <div className="column-width-just" style={{ left: '-15px' }} />
            )}
            <ColumnResizeHandler
              key={index}
              index={index}
              handleMouseDown={handleMouseDown}
              style={{ left: `${left - 15}px` }}
              adjustingCell={adjustingCell}
              isDraggingResizeHandler={isDraggingResizeHandler}
              isMouseNearBorder={isMouseNearBorder[index]}
            />
          </React.Fragment>
        );
      })}
    </div>
  );
};

ResizeHandlers.propTypes = {
  element: PropTypes.shape({
    column: PropTypes.arrayOf(PropTypes.shape({
      width: PropTypes.number,
    })),
  }).isRequired,
  handleResizeColumn: PropTypes.func,

};

export default ResizeHandlers;
