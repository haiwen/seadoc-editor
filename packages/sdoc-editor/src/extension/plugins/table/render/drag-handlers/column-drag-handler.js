import React from 'react';

import '../../render/index.css';

const ColumnDragHandler = ({ left }) => {

  return (
    <div
      className='table-cell-width-just position-absolute resizing'
      contentEditable={false}
      style={{ left }}
    >
      <div className="table-cell-width-just-color-tip"></div>
    </div>
  );
};

export default ColumnDragHandler;
