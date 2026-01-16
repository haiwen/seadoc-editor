import React, { useCallback, useRef, useState } from 'react';
import { ChromePicker } from 'react-color';
import { useTranslation } from 'react-i18next';
import { UncontrolledPopover } from 'reactstrap';
import classnames from 'classnames';
import { useColorContext } from '../../../../../hooks/use-color-context';
import LocalStorage from '../../../../../utils/local-storage-utils';
import { eventStopPropagation } from '../../../../../utils/mouse-event';
import { DEFAULT_COLORS, DEFAULT_RECENT_USED_LIST, RECENT_USED_TABLE_CELL_BACKGROUND_COLORS_KEY, STANDARD_COLORS } from '../../../../constants';
import { setCellStyle } from '../../helpers';
import ColorItem from './color-item';

import './style.css';

const recentUsedColorsKey = RECENT_USED_TABLE_CELL_BACKGROUND_COLORS_KEY;

const ColorSelectorPopover = ({ target, editor, readonly, isRichEditor = true }) => {
  const { t } = useTranslation('sdoc-editor');
  const { lastUsedTableCellBackgroundColor: lastUsedColor, updateLastUsedTableCellBackgroundColor: updateLastUsedColor } = useColorContext();
  const popoverRef = useRef(null);
  const moreColorsPopoverRef = useRef(null);

  const [recentUsedColors, setRecentUsedColors] = useState(LocalStorage.getItem(recentUsedColorsKey, DEFAULT_RECENT_USED_LIST));
  const [isShowMenu, setMenuShow] = useState(false);
  const [isPickerShow, setPickerShow] = useState(false);

  const setColor = useCallback((color) => {
    setCellStyle(editor, { background_color: color });
  }, [editor]);

  const onSetColor = useCallback((color, shouldClose = true) => {
    if (readonly) return;
    const validColor = color || '';
    setColor(validColor);
    if (validColor !== '' && recentUsedColors[0] !== validColor) {
      let newRecentUsedColors = recentUsedColors.slice(0, 9);
      newRecentUsedColors.unshift(validColor);
      LocalStorage.setItem(recentUsedColorsKey, newRecentUsedColors);
      setRecentUsedColors(newRecentUsedColors);
    }

    updateLastUsedColor && updateLastUsedColor(validColor);

    if (shouldClose) {
      popoverRef.current.toggle();
      setMenuShow(!isShowMenu);
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recentUsedColors, recentUsedColorsKey, isShowMenu, isPickerShow, readonly]);

  const setColorProxy = useCallback((event) => {
    if (event.target.className.includes('sdoc-color-item')) {
      const color = event.target.dataset.color;
      onSetColor(color);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recentUsedColors, recentUsedColorsKey, isShowMenu, isPickerShow]);

  const toggle = useCallback(() => {
    if (isPickerShow) return;
    popoverRef.current.toggle();
    setMenuShow(!isShowMenu);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShowMenu, isPickerShow]);

  const moreColorsPopoverToggle = useCallback(() => {
    moreColorsPopoverRef.current.toggle();
    setPickerShow(!isPickerShow);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moreColorsPopoverRef, isPickerShow]);

  const onMouseDown = useCallback((event) => {
    eventStopPropagation(event);
  }, []);

  const onChange = useCallback((color) => {
    const validColor = color.hex;
    onSetColor(validColor, false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readonly]);

  return (
    <UncontrolledPopover
      target={target.current}
      trigger="hover"
      placement="right-start"
      hideArrow={true}
      fade={false}
      className="sdoc-color-menu-popover sdoc-table-cell-bg-colors-popover"
      toggle={toggle}
      ref={popoverRef}
      offset={[0, 0]}
    >
      <div className="sdoc-dropdown-menu sdoc-color-dropdown-menu">
        <div className="p-3 d-flex flex-column">
          <div className="sdoc-color-no-color-container">
            <div className="sdoc-color-no-color-content" onMouseDown={() => onSetColor()}>
              {t('No_color')}
            </div>
          </div>
          <div className="sdoc-color-default-colors-container" onMouseDown={setColorProxy}>
            {DEFAULT_COLORS.map((color, index) => {
              return (
                <ColorItem
                  key={`default-color-${index}`}
                  color={color}
                  lastUsedColor={lastUsedColor}
                />
              );
            })}
          </div>
          <div className="sdoc-color-standard-colors-container">
            <div className="sdoc-color-sub-title">{t('Standard_color')}</div>
            <div className="d-flex" onMouseDown={setColorProxy}>
              {STANDARD_COLORS.map((color, index) => {
                return (
                  <ColorItem
                    key={`standard-color-${index}`}
                    color={color}
                    lastUsedColor={lastUsedColor}
                  />
                );
              })}
            </div>
          </div>
          <div className="sdoc-color-recent-used-colors-container">
            <div className="sdoc-color-sub-title">{t('Recently_used')}</div>
            <div className="d-flex" onMouseDown={setColorProxy}>
              {recentUsedColors.map((color, index) => {
                return (
                  <ColorItem
                    key={`standard-color-${index}`}
                    color={{ value: color, name: color }}
                  />
                );
              })}
            </div>
          </div>
        </div>
        <div className="sdoc-colors-divider"></div>
        <div className={classnames('sdoc-more-colors pr-2', { 'show-pick': isPickerShow })} id="sdoc-more-colors">
          <span>{t('More_color')}</span>
          <i className="sdocfont sdoc-arrow-right"></i>
        </div>
        <UncontrolledPopover
          target="sdoc-more-colors"
          className="sdoc-more-colors-popover sdoc-table-more-colors"
          trigger="hover"
          placement="right"
          hideArrow={true}
          fade={false}
          toggle={moreColorsPopoverToggle}
          ref={moreColorsPopoverRef}
          offset={[0, 0]}
        >
          <div className="sdoc-more-colors-container" onMouseDown={onMouseDown}>
            <ChromePicker
              disableAlpha={true}
              color={lastUsedColor || ''}
              onChange={onChange}
            />
          </div>
        </UncontrolledPopover>
      </div>
    </UncontrolledPopover>
  );
};

export default ColorSelectorPopover;
