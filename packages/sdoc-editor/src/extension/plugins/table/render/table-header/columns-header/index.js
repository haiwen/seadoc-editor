import React, { useCallback, useState } from 'react';
import { useSlateStatic } from '@seafile/slate-react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { TABLE_ELEMENT_POSITION } from '../../../constants';
import { insertTableColumn } from '../../../helpers';
import { useResizeHandlersContext, useTableRootScrollLeftContext, useTableRootContext } from '../../hooks';
import ColumnHeader from './column-header';

const ColumnsHeader = ({ table, selectRange, tableSize, handleDragStart, handleDragEnd }) => {
  const editor = useSlateStatic();
  const [insertColumnIndex, setInsertColumnIndex] = useState(0);
  const [addIconPosition, setAddIconPosition] = useState();
  const columns = useResizeHandlersContext();
  const tableRootScrollLeft = useTableRootScrollLeftContext();
  const [isHoverInAddIcon, setIsHoverInAddIcon] = useState(false);
  const tableRootContent = useTableRootContext();

  const onMouseLeave = useCallback(() => {
    setAddIconPosition();
    setInsertColumnIndex(0);
    setIsHoverInAddIcon(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, columns, tableSize]);

  const onMouseEnter = useCallback((addIconPosition) => {
    setAddIconPosition(addIconPosition);
    setIsHoverInAddIcon(true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, columns, tableSize]);

  const insertColumn = useCallback((insertColumnIndex) => {
    const validInsertColumnIndex = insertColumnIndex === -1 ? 0 : insertColumnIndex;
    const insertColumnPosition = insertColumnIndex === -1 ? TABLE_ELEMENT_POSITION.BEFORE : TABLE_ELEMENT_POSITION.AFTER;
    insertTableColumn(editor, table, validInsertColumnIndex, insertColumnPosition, 1);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, columns, tableSize]);

  return (
    <>
      <div className="sdoc-table-columns-header position-absolute d-print-none" contentEditable={false}>
        <div className="sdoc-table-columns-header-container h-100 d-flex position-absolute" style={{ left: -1 * tableRootScrollLeft }}>
          {columns.map((column, index) => {
            return (
              <ColumnHeader
                key={index}
                column={column}
                index={index}
                addIconPosition={addIconPosition}
                tableSize={tableSize}
                setAddIconPosition={setAddIconPosition}
                setInsertColumnIndex={setInsertColumnIndex}
                selectRange={selectRange}
                handleDragStart={handleDragStart}
                handleDragEnd={handleDragEnd}
              />
            );
          })}
        </div>
      </div>
      {addIconPosition && (
        <div
          className={classnames('position-fixed sdoc-table-add-element-icon-content', { 'background-color-tip-blue': isHoverInAddIcon })}
          contentEditable={false}
          style={addIconPosition}
          onMouseEnter={() => onMouseEnter(addIconPosition)}
          onMouseLeave={onMouseLeave}
          onClick={() => insertColumn(insertColumnIndex)}
        >
          {'+'}
        </div>
      )}
      {addIconPosition && isHoverInAddIcon && (
        <div
          className="position-fixed sdoc-table-add-element-tip background-color-tip-blue"
          style={{
            left: addIconPosition?.left + 5,
            top: addIconPosition?.top + 12,
            width: 2,
            height: tableRootContent.clientHeight,
            zIndex: 1
          }}
        >
        </div>
      )}
    </>
  );
};

ColumnsHeader.propTypes = {
  table: PropTypes.object.isRequired,
  selectRange: PropTypes.func,
  handleDragStart: PropTypes.func,
  handleDragEnd: PropTypes.func,
};

export default ColumnsHeader;
