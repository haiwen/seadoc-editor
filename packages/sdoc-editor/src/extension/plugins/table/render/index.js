import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Transforms, Editor } from '@seafile/slate';
import { useSelected, useSlateStatic, useReadOnly, ReactEditor } from '@seafile/slate-react';
import classnames from 'classnames';
import throttle from 'lodash.throttle';
import PropTypes from 'prop-types';
import { INTERNAL_EVENT } from '../../../../constants';
import EventBus from '../../../../utils/event-bus';
import { registerResizeEvents, unregisterResizeEvents } from '../../../../utils/mouse-event';
import ObjectUtils from '../../../../utils/object-utils';
import { findPath } from '../../../core';
import { EMPTY_SELECTED_RANGE } from '../constants';
import { getTableColumns, setTableSelectedRange, getFirstTableCell, getRowHeight, adjustCombinedCellRange } from '../helpers';
import DragHandlers from './drag-handlers';
import { ResizeHandlersContext, TableSelectedRangeContext, SettingSelectRangeContext } from './hooks';
import ResizeHandlers from './resize-handlers';
import ResizeMask from './resize-mask';
import TableHeader from './table-header';
import TableRoot from './table-root';

import './index.css';
import './alternate-color.css';

const Table = ({ className, attributes, children, element }) => {
  const isSelected = useSelected();
  const editor = useSlateStatic();
  const table = useRef(null);
  const [startRowIndex, setStartRowIndex] = useState(0);
  const [startColIndex, setStartColIndex] = useState(0);
  const [startRowSpan, setStartRowSpan] = useState(1);
  const [startColSpan, setStartColSpan] = useState(1);
  const [isSettingSelectRange, setIsSettingSelectRange] = useState(false);
  const [selectedRange, setSelectedRange] = useState(EMPTY_SELECTED_RANGE);
  const oldColumns = getTableColumns(editor, element);
  const [columns, setColumns] = useState(oldColumns);
  const path = findPath(editor, element);
  const [resizeCellMaskInfo, setResizeCellMaskInfo] = useState({});
  const [isShowResizeHandlers, setIsShowResizeHandlers] = useState(false);
  const [isDraggingResizeHandler, setIsDraggingResizeHandler] = useState(false);
  const [isDragMove, setIsDragMove] = useState(false);

  const onMouseDown = useCallback((event) => {
    if (event.button !== 0) return; // right click not deal
    setIsSettingSelectRange(true);
    if (!table.current.contains(event.target)) return;
    const tableCell = getFirstTableCell(event.target);
    const cellData = tableCell.style.gridArea.split(' / ');
    setStartRowIndex(Number(tableCell.getAttribute('row-index')));
    setStartColIndex(Number(tableCell.getAttribute('cell-index')));
    setStartRowSpan(Number(cellData[2].split(' ')[1]));
    setStartColSpan(Number(cellData[3].split(' ')[1]));
    setSelectedRange(EMPTY_SELECTED_RANGE);
    setTableSelectedRange(editor, EMPTY_SELECTED_RANGE);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetState = useCallback(() => {
    setIsSettingSelectRange(false);
    setStartColIndex(0);
    setStartRowIndex(0);
    setStartRowSpan(1);
    setStartColSpan(1);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setSelectedRangeByClick = useCallback((range) => {
    setSelectedRange(range);
    setTableSelectedRange(editor, range);
    const { minRowIndex, minColIndex } = range;
    const selection = { offset: 0, path: [...path, minRowIndex, minColIndex, 0] };
    Transforms.setSelection(editor, { anchor: selection, focus: selection });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, path]);

  useEffect(() => {
    const eventBus = EventBus.getInstance();
    const cancelTableSelectRangeSubscribe = eventBus.subscribe(INTERNAL_EVENT.CANCEL_TABLE_SELECT_RANGE, clearRange);
    const setTableSelectRangeSubscribe = eventBus.subscribe(INTERNAL_EVENT.SET_TABLE_SELECT_RANGE, setRange);

    return () => {
      cancelTableSelectRangeSubscribe();
      setTableSelectRangeSubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setColumns(getTableColumns(editor, element));

    if (isSettingSelectRange) {
      const onMouseMove = throttle((event) => {

        // if event.target not in the table, clear the mouseMove event
        if (!table.current.contains(event.target)) return;

        const tableCell = getFirstTableCell(event.target);
        const endRowIndex = Number(tableCell.getAttribute('row-index'));
        const endColIndex = Number(tableCell.getAttribute('cell-index'));
        const cellData = tableCell.style.gridArea.split(' / ');
        const endRowSpan = Number(cellData[2].split(' ')[1]);
        const endColSpan = Number(cellData[3].split(' ')[1]);
        const tableSlateNode = ReactEditor.toSlateNode(editor, table.current);
        let newSelectedRange = {
          minRowIndex: Math.min(startRowIndex, endRowIndex),
          maxRowIndex: startRowIndex < endRowIndex ? endRowIndex + endRowSpan - 1 : startRowIndex + startRowSpan - 1,
          minColIndex: Math.min(startColIndex, endColIndex),
          maxColIndex: startColIndex < endColIndex ? endColIndex + endColSpan - 1 : startColIndex + startColSpan - 1
        };
        newSelectedRange = adjustCombinedCellRange(tableSlateNode, newSelectedRange);

        if (!ObjectUtils.isSameObject(selectedRange, EMPTY_SELECTED_RANGE)) {
          event.preventDefault();
          Editor.withoutNormalizing(editor, () => {
            const selection = { offset: 0, path: [...path, endRowIndex, endColIndex, 0] };
            Transforms.setSelection(editor, { anchor: selection, focus: selection });
          });
        }

        // same cell
        if (newSelectedRange.minRowIndex === newSelectedRange.maxRowIndex && newSelectedRange.minColIndex === newSelectedRange.maxColIndex) {
          setSelectedRange(EMPTY_SELECTED_RANGE);
          setTableSelectedRange(editor, EMPTY_SELECTED_RANGE);
          return;
        }
        setSelectedRange(newSelectedRange);
        setTableSelectedRange(editor, newSelectedRange);
      }, 200);

      const onMouseUp = (event) => {
        /*
        if (!ObjectUtils.isSameObject(selectedRange, EMPTY_SELECTED_RANGE)) {
          setTableSelectedRange(editor, selectedRange);
        }
        */
        resetState();
      };

      registerResizeEvents({
        'mousemove': onMouseMove,
        'mouseup': onMouseUp,
      });
      return () => {
        unregisterResizeEvents({
          'mousemove': onMouseMove,
          'mouseup': onMouseUp,
        });
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element, isSettingSelectRange, selectedRange, element]);

  const setRange = useCallback((table, range) => {
    if (element.id !== table.id) {
      setSelectedRange(EMPTY_SELECTED_RANGE);
    } else {
      setSelectedRange(range);
    }
    setTableSelectedRange(editor, range);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element]);

  const clearRange = useCallback(() => {
    setSelectedRange(EMPTY_SELECTED_RANGE);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tableContainerClassName = classnames('sdoc-table-container position-relative', attributes.className, className, {
    'sdoc-table-selected': isSelected,
    'sdoc-table-selected-range': !ObjectUtils.isSameObject(selectedRange, EMPTY_SELECTED_RANGE),
  });

  const handleShowResizeHandler = useCallback((cellInfo) => {
    setResizeCellMaskInfo(cellInfo);
    setIsShowResizeHandlers(true);
  }, []);

  const hideResizeHandlers = useCallback(() => {
    setIsShowResizeHandlers(false);
    setIsDraggingResizeHandler(false);
  }, []);

  const handlerStartDragging = useCallback(() => {
    setIsDraggingResizeHandler(true);
  }, []);

  let style = element.style ? { ...element.style } : {};
  const columnWidthList = columns.map(item => `${item.width}px`);
  style.gridTemplateColumns = columnWidthList.join(' ');

  const rowHeightList = element.children.map((item, index) => getRowHeight(item, index));
  style.gridAutoRows = rowHeightList.map(item => `minmax(${item}px, auto)`).join(' ');

  return (
    <TableSelectedRangeContext.Provider value={selectedRange}>
      <ResizeHandlersContext.Provider value={columns}>
        <SettingSelectRangeContext.Provider value={isSettingSelectRange}>
          <TableRoot columns={columns} attributes={attributes}>
            {isSelected && (
              <TableHeader
                editor={editor}
                table={element}
                setSelectedRange={setSelectedRangeByClick}
                setIsDragMove={setIsDragMove}
              />
            )}
            <div
              className={classnames(tableContainerClassName)}
              style={style}
              onMouseDown={onMouseDown}
              ref={table}
              data-id={element.id}
            >
              {children}
              {!isSettingSelectRange && (
                <ResizeMask
                  editor={editor}
                  table={element}
                  handleShowResizeHandler={handleShowResizeHandler}
                  hideResizeHandlers={hideResizeHandlers}
                  handlerStartDragging={handlerStartDragging}
                  isDraggingResizeHandler={isDraggingResizeHandler}
                />)}
              {!isSettingSelectRange && isShowResizeHandlers && (
                <ResizeHandlers
                  hideResizeHandlers={hideResizeHandlers}
                  element={element}
                  resizeCellMaskInfo={resizeCellMaskInfo}
                  isDraggingResizeHandler={isDraggingResizeHandler}
                />)}
              {isDragMove && (
                <DragHandlers table={element} />
              )}
            </div>
          </TableRoot>
        </SettingSelectRangeContext.Provider>
      </ResizeHandlersContext.Provider>
    </TableSelectedRangeContext.Provider>
  );
};

Table.propTypes = {
  isSelected: PropTypes.bool,
  className: PropTypes.string,
  attributes: PropTypes.object,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.array]),
  element: PropTypes.object,
};

function renderTable(props) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const readOnly = useReadOnly();

  if (readOnly) {
    const { className, attributes, children, element } = props;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const editor = useSlateStatic();
    const columns = getTableColumns(editor, element);
    let style = element.style ? { ...element.style } : {};
    const columnWidthList = columns.map(item => `${item.width}px`);
    style.gridTemplateColumns = columnWidthList.join(' ');

    const rowHeightList = element.children.map((item, index) => getRowHeight(item, index));
    style.gridAutoRows = rowHeightList.map(item => `minmax(${item}px, auto)`).join(' ');

    return (
      <TableRoot columns={columns} attributes={attributes}>
        <div
          className={classnames('sdoc-table-container', attributes.className, className)}
          data-id={element.id}
          style={style}
        >
          {children}
        </div>
      </TableRoot>
    );
  }

  return <Table {...props} />;
}

export default renderTable;
