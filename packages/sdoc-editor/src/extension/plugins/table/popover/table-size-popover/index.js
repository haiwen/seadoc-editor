import React, { useCallback, useRef, useState, useImperativeHandle, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UncontrolledPopover } from 'reactstrap';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { KeyCodes } from '../../../../../constants';
import TableTemplate from '../table-template';

import './index.css';

const TableSizePopover = ({
  editor, target, trigger = 'legacy', placement = 'bottom-start',
  popperClassName, createTable, tableSizeRef, handleClosePopover, callback
}) => {
  const minSize = [5, 10];
  const maxSize = [10, 10];
  const [displaySize, setDisplaySize] = useState([5, 10]);
  const [selectedSize, setSelectedSize] = useState([1, 1]);
  const ref = useRef(null);
  const templateRef = useRef(null);

  useEffect(() => {
    ref.current['firstRender'] = true;
  }, []);

  const onHandleTableSize = useCallback((cellPosition = [1, 1]) => {
    let newDisplaySize = displaySize.slice(0);
    const cellPositionX = cellPosition[0];
    const cellPositionY = cellPosition[1];
    newDisplaySize[0] = cellPositionX < minSize[0] ? minSize[0] : cellPositionX + 1;
    newDisplaySize[1] = cellPositionY < minSize[1] ? minSize[1] : cellPositionY + 1;
    if (newDisplaySize[0] > maxSize[0]) {
      newDisplaySize[0] = maxSize[0];
    }
    if (newDisplaySize[1] > maxSize[1]) {
      newDisplaySize[1] = maxSize[1];
    }

    setDisplaySize(newDisplaySize);
    setSelectedSize(cellPosition);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displaySize, selectedSize, maxSize, minSize]);

  const onCreateTable = useCallback(() => {

    createTable(selectedSize);
    ref && ref.current && ref.current.toggle();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSize, ref]);

  const onTemplateItemSelectedStyle = useCallback((color) => {
    const templateEl = document.getElementById('sdoc-table-template-review-btn');
    templateEl.style['backgroundColor'] = color;
  }, []);

  const handleSizeDown = useCallback((e) => {
    const { keyCode } = e;
    const { UpArrow, DownArrow, Enter, RightArrow, LeftArrow } = KeyCodes;
    const newSelectedSize = selectedSize.slice(0);
    if (keyCode === Enter) {
      e.preventDefault();
      onCreateTable();
    }

    if (keyCode === UpArrow) {
      e.preventDefault();
      if (newSelectedSize[0] > 1) {
        newSelectedSize[0] = newSelectedSize[0] - 1;
      }
    }
    if (keyCode === DownArrow) {
      e.preventDefault();
      newSelectedSize[0] = newSelectedSize[0] + 1;
    }
    if (keyCode === LeftArrow) {
      e.preventDefault();
      if (newSelectedSize[1] > 1) {
        newSelectedSize[1] = newSelectedSize[1] - 1;
      }
    }
    if (keyCode === RightArrow) {
      e.preventDefault();
      newSelectedSize[1] = newSelectedSize[1] + 1;
    }
    onHandleTableSize(newSelectedSize);
  }, [onCreateTable, onHandleTableSize, selectedSize]);

  const handleTableSizeKeyDown = useCallback((e) => {
    if (document.getElementsByClassName('sdoc-table-template-popover')[0]) {
      templateRef.current.handleTableTemplateKeyDown(e);
      return;
    }

    const { keyCode } = e;
    const { UpArrow, DownArrow, Enter, RightArrow, LeftArrow, Esc } = KeyCodes;
    const isInitSize = selectedSize[0] === 1 && selectedSize[1] === 1;
    const templateEl = document.getElementById('sdoc-table-template-review-btn');
    // Currently focusing on the template menu item
    if (templateEl.style['background-color']) {
      if (keyCode === DownArrow) {
        e.preventDefault();
        onTemplateItemSelectedStyle('');
      }
      // exit table size popover
      if (keyCode === LeftArrow) {
        e.preventDefault();
        onTemplateItemSelectedStyle('');
        ref.current['firstRender'] = true;
        ref.current.toggle();
      }
      if (keyCode === Enter) {
        e.preventDefault();
        onTemplateItemSelectedStyle('');
        templateRef.current.uncontrolledTemplatePopoverRef.current.toggle();
      }
      if (keyCode === Esc) {
        e.preventDefault();
        handleClosePopover();
      }
      return;
    }

    // left and right
    if (keyCode === LeftArrow) {
      e.preventDefault();
      handleSizeDown(e);
    }
    if (keyCode === RightArrow) {
      e.preventDefault();
      if (ref.current['firstRender']) {
        ref.current['firstRender'] = false;
        onTemplateItemSelectedStyle('#e3e3e3');
        return;
      }
      handleSizeDown(e);
    }

    // up and down
    if (keyCode === UpArrow) {
      e.preventDefault();
      if (isInitSize) {
        onTemplateItemSelectedStyle('#e3e3e3');
      } else {
        handleSizeDown(e);
      }
    }
    if (keyCode === DownArrow) {
      e.preventDefault();
      onTemplateItemSelectedStyle('');
      handleSizeDown(e);
    }

    // enter
    if (keyCode === Enter) {
      e.preventDefault();
      handleSizeDown(e);
    }

    if (keyCode === Esc) {
      e.preventDefault();
      handleClosePopover();
    }
  }, [handleClosePopover, handleSizeDown, onTemplateItemSelectedStyle, selectedSize]);

  useImperativeHandle(tableSizeRef, () => {
    return {
      handleTableSizeKeyDown: handleTableSizeKeyDown,
      uncontrolledPopoverRef: ref
    };
  });

  const renderTableSize = useCallback(() => {
    let tableSize = [];
    for (let i = 1; i <= displaySize[0]; i++) {
      let children = [];
      for (let j = 1; j <= displaySize[1]; j++) {
        const isSelectedChild = (i <= selectedSize[0] && selectedSize[0] !== 0) && (j <= selectedSize[1] && selectedSize[1] !== 0);
        const child = (
          <div
            key={`sdoc-table-size-cell-${i}-${j}`}
            className={classnames('sdoc-table-size-cell', { 'active': isSelectedChild })}
            onClick={onCreateTable}
            onMouseEnter={() => onHandleTableSize([i, j])}
          >
          </div>
        );
        children.push(child);
      }
      tableSize.push(
        <div key={`sdoc-table-size-row-${i}`} className="sdoc-table-size-row d-flex">{children}</div>
      );
    }
    return tableSize;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displaySize, selectedSize]);

  return (
    <UncontrolledPopover
      target={target}
      className="sdoc-selected-table-size-popover sdoc-sub-dropdown-menu sdoc-dropdown-menu"
      trigger={trigger}
      placement={placement}
      hideArrow={true}
      fade={false}
      ref={ref}
      popperClassName={popperClassName}
    >
      <div className="sdoc-selected-table-size-container w-100 h-100 d-flex flex-column">
        <div className='sdoc-selected-table-tools-container'>
          <MenuItem
            id="sdoc-table-template-review-btn"
            text="Table_template"
            iconClassname="sdocfont sdoc-arrow-right sdoc-dropdown-item-right-icon"
          />
        </div>
        <div className="sdoc-table-size-select">
          {renderTableSize()}
        </div>
        <div className="sdoc-selected-table-size-tip w-100 ">
          {`${selectedSize[0]} x ${selectedSize[1]}`}
        </div>
        <TableTemplate
          templateRef={templateRef}
          editor={editor}
          targetId='sdoc-table-template-review-btn'
          handleClosePopover={handleClosePopover}
          callback={callback}
        />
      </div>
    </UncontrolledPopover>
  );

};

TableSizePopover.propTypes = {
  editor: PropTypes.object.isRequired,
  target: PropTypes.string.isRequired,
  createTable: PropTypes.func.isRequired,
  popperClassName: PropTypes.string,
};

export default TableSizePopover;

const MenuItem = ({ id, className, text, iconClassname }) => {
  const { t } = useTranslation('sdoc-editor');
  return (
    <div id={id} className={classnames('sdoc-selected-table-size-custom', { className })}>
      <span>{t(text)}</span>
      <i className={iconClassname}></i>
    </div>
  );
};
