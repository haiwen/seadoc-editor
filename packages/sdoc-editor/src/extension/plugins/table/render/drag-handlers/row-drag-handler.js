import React from 'react';

import '../../render/index.css';

const RowDragHandler = ({ top }) => {

  return (
    <div
      className='table-row-height-just position-absolute resizing'
      contentEditable={false}
      style={{ top }}
    >
      <div className="table-row-height-just-color-tip"></div>
    </div>
  );
};

export default RowDragHandler;
