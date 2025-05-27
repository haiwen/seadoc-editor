import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { INTERNAL_EVENT } from '../../../../../constants';
import EventBus from '../../../../../utils/event-bus';
import { DRAG_HANDLER_ROW, DRAG_HANDLER_COLUMN } from '../../constants';
import ColumnDragHandler from './column-drag-handler';
import RowDragHandler from './row-drag-handler';

const DragHandlers = ({ table, }) => {
  const [linePosition, setLinePosition] = useState({ top: 0, left: 0 });
  const [displayType, setDisplayType] = useState('');
  const tableID = table.id;

  const handleShowDragHandler = useCallback(({ displayType, left, top, tableId }) => {
    if (tableId !== tableID) return;
    const maskOffset = 2;
    setLinePosition({ top, left: left - maskOffset });
    setDisplayType(displayType);
  }, [tableID]);

  useEffect(() => {
    const eventBus = EventBus.getInstance();
    const unsubscribe = eventBus.subscribe(INTERNAL_EVENT.TABLE_SHOW_DRAG_HANDLER, handleShowDragHandler);
    return () => {
      unsubscribe();
    };
  }, [handleShowDragHandler]);

  return (
    <>
      {displayType === DRAG_HANDLER_ROW && (
        <RowDragHandler top={linePosition.top} />
      )}
      {displayType === DRAG_HANDLER_COLUMN && (
        <ColumnDragHandler left={linePosition.left} />
      )}
    </>
  );
};

DragHandlers.propTypes = {
  table: PropTypes.object,
};

export default DragHandlers;
