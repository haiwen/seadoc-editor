import React, { useRef, useCallback, useMemo } from 'react';
import { useSlateStatic } from '@seafile/slate-react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import ObjectUtils from '../../../../../../utils/object-utils';
import { ELEMENT_TYPE } from '../../../../../constants';
import { findPath, getSelectedNodeByType } from '../../../../../core';
import { useTableRootContext, useTableSelectedRangeContext } from '../../hooks';

const ColumnHeader = ({ index, column, addIconPosition, setAddIconPosition, setInsertColumnIndex, selectRange, tableSize, handleDragStart, handleDragEnd }) => {
  const editor = useSlateStatic();
  const { tableSelectedRange } = editor;
  const columnHeaderRef = useRef(null);
  const tableRoot = useTableRootContext();
  const selectedRange = useTableSelectedRangeContext();
  const currentCell = getSelectedNodeByType(editor, ELEMENT_TYPE.TABLE_CELL);
  const currentCellPath = currentCell ? findPath(editor, currentCell, [-1, -1]) : [-1, -1];
  const pathLength = currentCellPath.length;

  const canDrag = useMemo(() => {
    const { minRowIndex, maxRowIndex, minColIndex, maxColIndex } = tableSelectedRange;
    const [rowNum] = tableSize;
    const isSelectColumn = minRowIndex === 0 && maxRowIndex === rowNum - 1;
    const isSelectRangeColumn = minColIndex <= index && index <= maxColIndex;
    const isSelectAllColumn = minColIndex === 0 && maxColIndex === tableSize[1] - 1;
    if (tableSize[1] === 1 || isSelectAllColumn) return false;
    if (isSelectColumn && isSelectRangeColumn) return true;
    return false;
  }, [index, tableSelectedRange, tableSize]);

  const onMouseMove = useCallback((event) => {
    const { left, width, top } = columnHeaderRef.current.getBoundingClientRect();
    const tableRootPosition = tableRoot.getBoundingClientRect();
    const halfElementX = left + width / 2;
    const nextAddIconPosition = {
      left: event.clientX > halfElementX ? left + width - 6 : left - 6,
      top: top
    };

    if (tableRootPosition.right < nextAddIconPosition.left) {
      setAddIconPosition(undefined);
      return;
    }

    if (tableRootPosition.left - 6 > nextAddIconPosition.left) {
      setAddIconPosition(undefined);
      return;
    }

    if (ObjectUtils.isSameObject(nextAddIconPosition, addIconPosition)) return;
    setInsertColumnIndex(event.clientX > halfElementX ? index : index - 1);
    setAddIconPosition(nextAddIconPosition);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, addIconPosition, column, tableSize]);

  const onMouseLeave = useCallback((event) => {
    setAddIconPosition(undefined);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, addIconPosition, column, tableSize]);


  const isSelectedAColumn = selectedRange.minRowIndex === 0 && selectedRange.maxRowIndex === tableSize[0] - 1;
  const isSelectedRangeColumn = selectedRange.minColIndex <= index && index <= selectedRange.maxColIndex;

  return (
    <div
      className={classnames('sdoc-table-column-header h-100', {
        'range-selected': isSelectedAColumn && isSelectedRangeColumn,
        'range-selected-tip': (!isSelectedAColumn && isSelectedRangeColumn) || currentCellPath[pathLength - 1] === index,
        'drag': canDrag,
      })}
      ref={columnHeaderRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={() => selectRange(index)}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{ width: column.width }}
      draggable={canDrag}
    >
    </div>
  );

};

ColumnHeader.propTypes = {
  index: PropTypes.number,
  column: PropTypes.object,
  addIconPosition: PropTypes.any,
  tableSize: PropTypes.array,
  setAddIconPosition: PropTypes.func,
  setInsertColumnIndex: PropTypes.func,
  selectRange: PropTypes.func,
  handleDragStart: PropTypes.func,
  handleDragEnd: PropTypes.func,
};

export default ColumnHeader;
