import React, { useCallback } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { TABLE_TEMPLATE_POSITION_MAP } from '../../constants';
import { getCellHighlightClassName } from '../../helpers';

import './index.css';

const SampleTable = ({ alternateColor, onClickTemplate, curPositon }) => {
  // generate table
  const renderTableRow = useCallback((row, column) => new Array(row).fill(null).map((_, index) => (
    <div
      className={`sdoc-table-template-row table-row ${getCellHighlightClassName(alternateColor, index)}`}
      key={`sdoc-template-table-row-${index}`}
      onClick={() => {
        onClickTemplate(alternateColor);
      }}
    >
      {new Array(column)
        .fill(null)
        .map((_, index) =>
          <div
            className='sdoc-table-template-cell'
            key={`sdoc-template-table-cell-${index}`}>
          </div>)
      }
    </div>
  )), [onClickTemplate, alternateColor]);

  const key = JSON.stringify(curPositon);
  const isActive = TABLE_TEMPLATE_POSITION_MAP[key] === alternateColor;
  return (
    <div className={classNames('sdoc-table-template-view-table', { 'active': isActive })}>
      {renderTableRow(4, 4)}
    </div>
  );
};

SampleTable.protoTypes = {
  alternateColor: PropTypes.string.isRequired,
  onClickTemplate: PropTypes.func.isRequired,
};

export default SampleTable;
