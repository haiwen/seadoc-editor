import React from 'react';
import PropTypes from 'prop-types';

const ColumnResizeHandler = ({ index, isDraggingResizeHandler, adjustingCell, handleMouseDown, style, isMouseNearBorder }) => {
  const isActive = isMouseNearBorder || (isDraggingResizeHandler && adjustingCell === index);

  return (
    <div
      className={`column-width-just ${isActive ? 'active' : ''}`}
      onMouseDown={(event) => {
        event.preventDefault();
        handleMouseDown(index, event);
      }}
      style={style}
    >
    </div>
  );
};

ColumnResizeHandler.propTypes = {
  index: PropTypes.number.isRequired,
  isDraggingResizeHandler: PropTypes.bool.isRequired,
  adjustingCell: PropTypes.number,
  handleMouseDown: PropTypes.func.isRequired,
  style: PropTypes.object,
  isMouseNearBorder: PropTypes.bool
};

export default ColumnResizeHandler;
