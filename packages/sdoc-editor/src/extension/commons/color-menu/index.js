import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChromePicker } from 'react-color';
import { withTranslation } from 'react-i18next';
import { UncontrolledPopover } from 'reactstrap';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import Tooltip from '../../../components/tooltip';
import { useColorContext } from '../../../hooks/use-color-context';
import { eventStopPropagation } from '../../../utils/mouse-event';
import { DEFAULT_COLORS, STANDARD_COLORS } from '../../constants';
import ColorItem from './color-item';

import './index.css';

const modifiers = [
  {
    name: 'preventOverflow',
    options: {
      boundary: 'viewport',
      altBoundary: true,
      padding: 16
    }
  },
  {
    name: 'flip',
    options: {
      fallbackPlacements: ['top', 'bottom', 'left'],
      padding: 16
    }
  }
];

const ColorMenu = ({
  isRichEditor = true,
  className = 'menu-group-item',
  ariaLabel,
  iconClass,
  id,
  popperClassName,
  disabled,
  t,
  setColor,
  recentUsedColorsKey,
  text,
  defaultColorTip,
  defaultColor,
  lastUsedColor,
  updateLastUsedColor,
  onColorPickerUnmount,
}) => {
  const popoverRef = useRef(null);
  const moreColorsPopoverRef = useRef(null);
  const pickerDragsRef = useRef([]);
  const pickerContainerRef = useRef(null);

  const setPickerContainer = useCallback((element) => {
    if (!element && pickerContainerRef.current) {
      onColorPickerUnmount?.(pickerContainerRef.current);
    }
    pickerContainerRef.current = element;
  }, [onColorPickerUnmount]);

  const { recentUsedColors: recentUsedColorsMap, updateRecentUsedColors } = useColorContext();
  const recentUsedColors = recentUsedColorsMap[recentUsedColorsKey];
  const [isShowMenu, setMenuShow] = useState(false);
  const [isPickerShow, setPickerShow] = useState(false);

  useEffect(() => () => {
    pickerDragsRef.current.forEach(drag => drag.cleanup());
  }, []);

  const onSetColor = useCallback((color, shouldClose = true, shouldFocus = true, shouldRecord = true) => {
    if (disabled) return;
    const validColor = color || '';
    setColor(validColor, shouldFocus);
    if (shouldRecord) {
      pickerDragsRef.current.filter(drag => drag.ended).forEach(drag => drag.finish());
      updateRecentUsedColors(recentUsedColorsKey, validColor);
    }

    updateLastUsedColor && updateLastUsedColor(validColor);

    if (shouldClose) {
      popoverRef.current.toggle();
      setMenuShow(!isShowMenu);
    }

  }, [disabled, setColor, recentUsedColorsKey, updateRecentUsedColors, updateLastUsedColor, isShowMenu]);

  const setColorProxy = useCallback((event) => {
    if (event.target.className.includes('sdoc-color-item')) {
      const color = event.target.dataset.color;
      onSetColor(color);
    }
  }, [onSetColor]);

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

  const onPickerMouseDown = useCallback((event) => {
    if (event.target.tagName === 'INPUT') eventStopPropagation(event);
    else event.currentTarget.querySelector('input:focus')?.blur();
  }, []);

  const onPickerDragStart = useCallback((event) => {
    if (disabled || event.target.tagName === 'INPUT' || (event.type === 'mousedown' && event.button !== 0)) return;
    const pickerWindow = event.currentTarget.ownerDocument.defaultView;
    const drag = { startTime: event.timeStamp, color: null, ended: false };
    const endEvents = ['mouseup', 'touchend', 'touchcancel'];
    const onEnd = (endEvent) => {
      drag.ended = true;
      drag.endTime = endEvent.timeStamp;
      endEvents.forEach(type => pickerWindow.removeEventListener(type, onEnd));
      // react-color's Saturation can deliver its trailing change up to 50ms after mouseup.
      drag.timer = setTimeout(drag.finish, 50);
    };
    drag.cleanup = () => {
      endEvents.forEach(type => pickerWindow.removeEventListener(type, onEnd));
      clearTimeout(drag.timer);
    };
    drag.finish = () => {
      drag.cleanup();
      updateRecentUsedColors(recentUsedColorsKey, drag.color);
      pickerDragsRef.current = pickerDragsRef.current.filter(item => item !== drag);
    };
    pickerDragsRef.current.push(drag);
    endEvents.forEach(type => pickerWindow.addEventListener(type, onEnd));
  }, [disabled, recentUsedColorsKey, updateRecentUsedColors]);

  const onClick = useCallback((event) => {
    eventStopPropagation(event);
  }, []);

  const onChange = useCallback((color, event) => {
    if (disabled) return;
    const validColor = color.hex;
    const isDrag = ['mousedown', 'mousemove', 'touchstart', 'touchmove'].includes(event?.type);
    if (isDrag) {
      const drags = pickerDragsRef.current;
      const drag = drags.slice().reverse().find(item => event.timeStamp >= item.startTime && (!item.ended || event.timeStamp <= item.endTime));
      if (!drag) return;
      drag.color = validColor;
      // A trailing change from an earlier drag must not overwrite a newer selection.
      if (drag !== drags[drags.length - 1]) return;
    }
    onSetColor(validColor, false, isDrag || event?.target?.tagName !== 'INPUT', !isDrag);
  }, [disabled, onSetColor]);

  const setLastUsedColor = useCallback((event) => {
    eventStopPropagation(event);
    onSetColor(lastUsedColor, false);
  }, [lastUsedColor, onSetColor]);

  const buttonId = `button-${id}`;
  const moreColorsId = `${id}-more-colors`;

  return (
    <>
      <button
        type="button"
        aria-label={ariaLabel}
        className={classnames(className, 'sdoc-color-menu sdoc-menu-with-dropdown', {
          'menu-show': isShowMenu,
          'disabled': disabled,
          'rich-icon-btn d-flex': isRichEditor,
          'rich-icon-btn-disabled': isRichEditor && disabled,
          'rich-icon-btn-hover': isRichEditor && !disabled,
          'btn btn-icon btn-secondary btn-active d-flex': !isRichEditor,
        })}
        id={buttonId}
        disabled={disabled}
      >
        <div className={classnames('last-used-color-container sdoc-menu-with-dropdown-icon', { 'disabled': disabled })} onClick={setLastUsedColor}>
          <i className={classnames(iconClass, 'sdoc-color-icon')} />
          <div className="last-used-color"style={{ backgroundColor: lastUsedColor || 'unset' }}></div>
        </div>
        <div id={id} className="sdoc-color-toggle sdoc-menu-with-dropdown-triangle">
          <i className={`sdoc-menu-with-dropdown-triangle-icon sdocfont sdoc-${isShowMenu ? 'arrow-up' : 'arrow-down'}`}></i>
        </div>
      </button>
      {text && !isShowMenu && (
        <Tooltip target={buttonId}>
          {t(text)}
        </Tooltip>
      )}
      {!disabled && (
        <UncontrolledPopover
          target={id}
          className={classnames('sdoc-color-menu-popover', popperClassName)}
          popperClassName="sdoc-popover-box-shadow"
          trigger="legacy"
          placement="bottom-start"
          hideArrow={true}
          toggle={toggle}
          fade={false}
          ref={popoverRef}
        >
          <div className="sdoc-dropdown-menu sdoc-color-dropdown-menu">
            <div className="py-3 d-flex flex-column">
              <div className="sdoc-color-no-color-container">
                <div className="sdoc-color-no-color-content" onClick={() => onSetColor(defaultColor)}>
                  {defaultColorTip || t('No_color')}
                </div>
              </div>
              <div className="sdoc-color-default-colors-container" onClick={setColorProxy}>
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
                <div className="d-flex" onClick={setColorProxy}>
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
                <div className="d-flex" onClick={setColorProxy}>
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
            <div className={classnames('sdoc-more-colors pr-2', { 'show-pick': isPickerShow })} id={moreColorsId}>
              <span>{t('More_color')}</span>
              <i className="sdocfont sdoc-arrow-right"></i>
            </div>
            <UncontrolledPopover
              target={moreColorsId}
              className="sdoc-more-colors-popover"
              trigger="hover"
              placement="right"
              modifiers={modifiers}
              hideArrow={true}
              fade={false}
              toggle={moreColorsPopoverToggle}
              ref={moreColorsPopoverRef}
              offset={[0, 0]}
            >
              <div
                ref={setPickerContainer}
                className="sdoc-more-colors-container"
                onMouseDownCapture={onPickerDragStart}
                onTouchStartCapture={onPickerDragStart}
                onMouseDown={onPickerMouseDown}
                onClick={onClick}
              >
                <ChromePicker
                  disableAlpha={true}
                  color={lastUsedColor || ''}
                  onChange={onChange}
                />
              </div>
            </UncontrolledPopover>
          </div>
        </UncontrolledPopover>
      )}
    </>
  );
};

ColorMenu.propTypes = {
  disabled: PropTypes.bool,
  isRichEditor: PropTypes.bool,
  popperClassName: PropTypes.string,
  text: PropTypes.string,
  id: PropTypes.string,
  iconClass: PropTypes.string,
  className: PropTypes.string,
  recentUsedColorsKey: PropTypes.string,
  defaultColorTip: PropTypes.string,
  defaultColor: PropTypes.string,
  lastUsedColor: PropTypes.string,
  updateLastUsedColor: PropTypes.func.isRequired,
  setColor: PropTypes.func.isRequired,
  onColorPickerUnmount: PropTypes.func,
};

export default withTranslation('sdoc-editor')(ColorMenu);
