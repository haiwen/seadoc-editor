import React, { useCallback, useMemo, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { UncontrolledPopover } from 'reactstrap';
import { KeyCodes } from '../../../../../constants';
import { TABLE_ALTERNATE_HIGHLIGHT_CLASS_MAP, TABLE_TEMPLATE_POSITION_MAP } from '../../constants';
import { insertTableByTemplate } from '../../helpers';
import SampleTable from './sample-table';

import './index.css';
import '../../render/alternate-color.css';

const TableTemplate = ({ editor, targetId, templateRef, handleClosePopover, callback }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState([-1, -1]);

  const tableTemplatePreviewList = useMemo(() => Reflect.ownKeys(TABLE_ALTERNATE_HIGHLIGHT_CLASS_MAP), []);

  const handleClickTemplate = useCallback((alternateColor) => {
    callback && callback();
    insertTableByTemplate(editor, alternateColor);
  }, [callback, editor]);

  const handleTableTemplateKeyDown = useCallback((e) => {
    const { keyCode } = e;
    const { UpArrow, DownArrow, Enter, RightArrow, LeftArrow, Esc } = KeyCodes;
    const position = ref.current.position;
    const isInitPostion = position[0] === -1 && position[1] === -1;

    // left and right
    if (keyCode === LeftArrow) {
      e.preventDefault();
      if (position[0] > 0) {
        const newPosition = [position[0] - 1, position[1]];
        ref.current.position = newPosition;
        setPosition(newPosition);
      }
    }
    if (keyCode === RightArrow) {
      e.preventDefault();
      // Enter
      if (isInitPostion) {
        ref.current.position = [0, 0];
        setPosition([0, 0]);
        return;
      }
      if (position[0] < 1) {
        const newPosition = [position[0] + 1, position[1]];
        ref.current.position = newPosition;
        setPosition(newPosition);
      }
    }

    // up and down
    if (keyCode === UpArrow) {
      e.preventDefault();
      if (isInitPostion) return;
      if (position[1] > 0) {
        const newPosition = [position[0], position[1] - 1];
        ref.current.position = newPosition;
        setPosition(newPosition);
      }
    }
    if (keyCode === DownArrow) {
      e.preventDefault();
      if (isInitPostion) return;
      if (position[1] < 1) {
        const newPosition = [position[0], position[1] + 1];
        ref.current.position = newPosition;
        setPosition(newPosition);
      }
    }

    // enter
    if (keyCode === Enter) {
      e.preventDefault();
      if (isInitPostion) return;
      const key = JSON.stringify(position);
      handleClickTemplate(TABLE_TEMPLATE_POSITION_MAP[key]);
      handleClosePopover();
    }

    if (keyCode === Esc) {
      e.preventDefault();
      handleClosePopover();
    }
  }, [handleClickTemplate, handleClosePopover]);

  useImperativeHandle(templateRef, () => {
    return {
      handleTableTemplateKeyDown: handleTableTemplateKeyDown,
      uncontrolledTemplatePopoverRef: ref
    };
  });

  useEffect(() => {
    ref.current.position = [-1, -1];
  }, []);

  return (
    <UncontrolledPopover
      target={targetId}
      trigger='hover'
      placement='right-start'
      hideArrow={true}
      fade={false}
      className='sdoc-sub-dropdown-menu sdoc-table-template-popover'
      innerClassName='sdoc-table-template-inner-popover'
      popperClassName="sdoc-table-template-popover-wrapper"
      ref={ref}
    >
      {tableTemplatePreviewList.map((alternateColor, index) =>
        <SampleTable
          key={alternateColor + index}
          curPositon={position}
          alternateColor={alternateColor}
          onClickTemplate={handleClickTemplate}
        />)
      }
    </UncontrolledPopover>
  );
};

export default TableTemplate;
