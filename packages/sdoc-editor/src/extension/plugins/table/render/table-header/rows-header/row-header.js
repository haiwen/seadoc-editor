import React, { useRef, useCallback, useState, useEffect, useMemo } from 'react';
import { useSlateStatic } from '@seafile/slate-react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { useScrollContext } from '../../../../../../hooks/use-scroll-context';
import ObjectUtils from '../../../../../../utils/object-utils';
import { ELEMENT_TYPE } from '../../../../../constants';
import { findPath, getSelectedNodeByType } from '../../../../../core';
import { elementHasImage, getRowDomHeight } from '../../../helpers';
import { useResizeHandlersContext, useTableSelectedRangeContext } from '../../hooks';

const RowHeader = ({ row, index, addIconPosition, setAddIconPosition, setInsertRowIndex, selectRange, tableSize, handleDragStart, handleDragEnd }) => {
  const editor = useSlateStatic();
  const { tableSelectedRange } = editor;
  useEffect(() => {
    setRowHeight(getRowDomHeight(editor, row));
  }, [editor, row, tableSize]);
  const oldRowHeight = getRowDomHeight(editor, row);
  const [rowHeight, setRowHeight] = useState(oldRowHeight);
  const rowHeaderRef = useRef(null);
  const columns = useResizeHandlersContext();
  const scrollContext = useScrollContext();
  const selectedRange = useTableSelectedRangeContext();
  const currentCell = getSelectedNodeByType(editor, ELEMENT_TYPE.TABLE_CELL);
  const currentCellPath = currentCell ? findPath(editor, currentCell, [-1, -1]) : [-1, -1];
  const pathLength = currentCellPath.length;

  const canDrag = useMemo(() => {
    const { minRowIndex, maxRowIndex, minColIndex, maxColIndex } = tableSelectedRange;
    const [, colNum] = tableSize;
    const isSelectRow = minColIndex === 0 && maxColIndex === colNum - 1;
    const isSelectRangeRow = minRowIndex <= index && index <= maxRowIndex;
    const isSelectAllRows = minRowIndex === 0 && maxRowIndex === tableSize[0] - 1;
    if (tableSize[0] === 1 || isSelectAllRows) return false;
    if (isSelectRow && isSelectRangeRow) return true;
    return false;
  }, [index, tableSelectedRange, tableSize]);

  useEffect(() => {
    if (elementHasImage(row)) {
      // There is a delay in image loading
      const time = setTimeout(() => setRowHeight(getRowDomHeight(editor, row)), 300);
      return () => {
        clearTimeout(time);
      };
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, row, index]);

  const onMouseMove = useCallback((event) => {
    const { left, height, top } = rowHeaderRef.current.getBoundingClientRect();
    const halfElementY = top + height / 2;
    const nextAddIconPosition = {
      left: left,
      top: event.clientY > halfElementY ? top + height - 7 : top - 7,
    };

    const { top: scrollContextTop, height: scrollContextHeight } = scrollContext.current.getBoundingClientRect();

    if (nextAddIconPosition.top < scrollContextTop) {
      setAddIconPosition(undefined);
      return;
    }

    if (nextAddIconPosition.top > scrollContextTop + scrollContextHeight) {
      setAddIconPosition(undefined);
      return;
    }

    if (ObjectUtils.isSameObject(nextAddIconPosition, addIconPosition)) return;
    setInsertRowIndex(event.clientY > halfElementY ? index : index - 1);
    setAddIconPosition(nextAddIconPosition);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, addIconPosition, row, columns]);

  const onMouseLeave = useCallback((event) => {
    setAddIconPosition(undefined);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, addIconPosition, row, columns]);

  const isSelectedARow = selectedRange.minColIndex === 0 && selectedRange.maxColIndex === tableSize[1] - 1;
  const isSelectedSomeRow = selectedRange.minRowIndex <= index && index <= selectedRange.maxRowIndex;

  return (
    <div
      className={classnames('sdoc-table-row-header', {
        'range-selected': isSelectedARow && isSelectedSomeRow,
        'range-selected-tip': (!isSelectedARow && isSelectedSomeRow) || currentCellPath[pathLength - 2] === index,
        'drag': canDrag,
      })}
      style={{ height: rowHeight }}
      ref={rowHeaderRef}
      onClick={() => selectRange(index)}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      draggable={canDrag}
    >
    </div>
  );
};

RowHeader.propTypes = {
  row: PropTypes.object,
  index: PropTypes.number,
  addIconPosition: PropTypes.object,
  tableSize: PropTypes.array,
  setAddIconPosition: PropTypes.func,
  setInsertRowIndex: PropTypes.func,
  selectRange: PropTypes.func,
  handleDragStart: PropTypes.func,
  handleDragEnd: PropTypes.func,
};

export default RowHeader;
