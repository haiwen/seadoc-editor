import React, { useCallback, useState } from 'react';
import { useSlateStatic } from '@seafile/slate-react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { TABLE_ELEMENT_POSITION } from '../../../constants';
import { insertTableRow } from '../../../helpers';
import { useTableRootContext } from '../../hooks';
import RowHeader from './row-header';

const RowsHeader = ({ table, selectRange, tableSize, handleDragStart, handleDragEnd }) => {
  const editor = useSlateStatic();
  const { children } = table;
  const [insertRowIndex, setInsertRowIndex] = useState(0);
  const [addIconPosition, setAddIconPosition] = useState();
  const [isHoverInAddIcon, setIsHoverInAddIcon] = useState(false);
  const tableRootContent = useTableRootContext();

  const onMouseLeave = useCallback(() => {
    setAddIconPosition();
    setInsertRowIndex(0);
    setIsHoverInAddIcon(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableSize, table]);

  const onMouseEnter = useCallback((addIconPosition) => {
    setAddIconPosition(addIconPosition);
    setIsHoverInAddIcon(true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableSize, table]);

  const insertRow = useCallback((insertRowIndex) => {
    const validInsertRowIndex = insertRowIndex === -1 ? 0 : insertRowIndex;
    const insertRowPosition = insertRowIndex === -1 ? TABLE_ELEMENT_POSITION.BEFORE : TABLE_ELEMENT_POSITION.AFTER;
    insertTableRow(editor, table, validInsertRowIndex, insertRowPosition, 1);
    setAddIconPosition();
    setIsHoverInAddIcon(false);
    setInsertRowIndex(0);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableSize, table]);

  return (
    <>
      <div className="sdoc-table-rows-header h-100 position-absolute d-flex flex-column d-print-none" contentEditable={false}>
        {children.map((row, index) => {
          return (
            <RowHeader
              key={row.id}
              index={index}
              row={row}
              addIconPosition={addIconPosition}
              tableSize={tableSize}
              setAddIconPosition={setAddIconPosition}
              setInsertRowIndex={setInsertRowIndex}
              selectRange={selectRange}
              handleDragStart={handleDragStart}
              handleDragEnd={handleDragEnd}
            />
          );
        })}
      </div>
      {addIconPosition && (
        <div
          className={classnames('position-fixed sdoc-table-add-element-icon-content', { 'background-color-tip-blue': isHoverInAddIcon })}
          style={addIconPosition}
          onMouseEnter={() => onMouseEnter(addIconPosition)}
          onMouseLeave={onMouseLeave}
          onClick={() => insertRow(insertRowIndex)}
        >
          {'+'}
        </div>
      )}
      {addIconPosition && isHoverInAddIcon && (
        <div
          className="position-fixed sdoc-table-add-element-tip background-color-tip-blue"
          style={{
            left: addIconPosition?.left + 11,
            top: addIconPosition?.top + 6,
            width: tableRootContent.clientWidth + 1,
            height: 2,
            zIndex: 1
          }}
        >
        </div>
      )}
    </>
  );
};

RowsHeader.propTypes = {
  table: PropTypes.object.isRequired,
  tableSize: PropTypes.array,
  selectRange: PropTypes.func,
};

export default RowsHeader;
