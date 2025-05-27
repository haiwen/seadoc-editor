import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import ObjectUtils from '../../../../../utils/object-utils';
import { useTableSelectedRangeContext } from '../hooks';


const RowsColumnsHeader = ({ selectRange, tableSize }) => {
  const selectedRange = useTableSelectedRangeContext();
  const isSelectedAllTableCells = ObjectUtils.isSameObject(selectedRange, {
    minRowIndex: 0,
    maxRowIndex: tableSize[0] - 1,
    minColIndex: 0,
    maxColIndex: tableSize[1] - 1,
  });

  return (
    <div
      className={classnames('sdoc-table-rows-columns-header d-print-none', { 'range-selected': isSelectedAllTableCells })}
      contentEditable={false}
      onClick={selectRange}
    >
    </div>
  );
};

RowsColumnsHeader.propTypes = {
  selectRange: PropTypes.func,
};

export default RowsColumnsHeader;
