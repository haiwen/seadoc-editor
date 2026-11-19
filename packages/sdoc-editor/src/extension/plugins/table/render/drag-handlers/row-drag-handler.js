import React from 'react';

import '../../render/index.css';

const RowDragHandler = ({ top }) => {

  return (
    <div
      className='sdoc-table-row-height-just position-absolute resizing d-print-none'
      contentEditable={false}
      style={{ top }}
    >
      <div className="sdoc-table-row-height-just-color-tip"></div>
    </div>
  );
};

export default RowDragHandler;
