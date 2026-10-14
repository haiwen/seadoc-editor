import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChromePicker } from 'react-color';
import { withTranslation } from 'react-i18next';
import { UncontrolledPopover } from 'reactstrap';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import Tooltip from '../../../components/tooltip';
import LocalStorage from '../../../utils/local-storage-utils';
import { eventStopPropagation } from '../../../utils/mouse-event';
import { DEFAULT_COLORS, STANDARD_COLORS, DEFAULT_RECENT_USED_LIST } from '../../constants';
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
  onPickerClose,
  recentUsedColorsKey,
  text,
  defaultColorTip,
  defaultColor,
  lastUsedColor,
  updateLastUsedColor,
}) => {
  const popoverRef = useRef(null);
  const moreColorsPopoverRef = useRef(null);
  const moreColorsContainerRef = useRef(null);

  const [recentUsedColors, setRecentUsedColors] = useState(LocalStorage.getItem(recentUsedColorsKey, DEFAULT_RECENT_USED_LIST));
  const [isShowMenu, setMenuShow] = useState(false);
  const [isPickerShow, setPickerShow] = useState(false);

  useEffect(() => {
    if (disabled) {
      setMenuShow(false);
      setPickerShow(false);
    }
  }, [disabled]);

  const closeMenu = useCallback((shouldFocus = false) => {
    if (isPickerShow && shouldFocus) onPickerClose && onPickerClose(shouldFocus);
    if (isShowMenu) popoverRef.current.toggle();
    setPickerShow(false);
    setMenuShow(false);
  }, [isShowMenu, isPickerShow, onPickerClose]);

  const onSetColor = useCallback((color, shouldClose = true, shouldFocus = true) => {
    if (disabled) return;
    const validColor = color || '';
    setColor(validColor, shouldFocus);
    if (validColor !== '' && recentUsedColors[0] !== validColor) {
      let newRecentUsedColors = recentUsedColors.slice(0, 9);
      newRecentUsedColors.unshift(validColor);
      LocalStorage.setItem(recentUsedColorsKey, newRecentUsedColors);
      setRecentUsedColors(newRecentUsedColors);
    }

    updateLastUsedColor && updateLastUsedColor(validColor);

    if (shouldClose) closeMenu();

  }, [recentUsedColors, recentUsedColorsKey, disabled, setColor, updateLastUsedColor, closeMenu]);

  const setColorProxy = useCallback((event) => {
    if (event.target.className.includes('sdoc-color-item')) {
      const color = event.target.dataset.color;
      onSetColor(color);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recentUsedColors, recentUsedColorsKey, isShowMenu, isPickerShow]);

  const toggle = useCallback((event) => {
    if (isShowMenu) {
      if (moreColorsContainerRef.current?.contains(event?.target)) return;
      const shouldFocus = moreColorsContainerRef.current?.contains(document.activeElement);
      closeMenu(shouldFocus);
    } else {
      popoverRef.current.toggle();
      setMenuShow(true);
    }
  }, [isShowMenu, closeMenu]);

  const moreColorsPopoverToggle = useCallback((event) => {
    const isPickerFocused = moreColorsContainerRef.current?.contains(document.activeElement);
    if (isPickerShow) {
      if (isPickerFocused && event?.key !== 'Escape') return;
      if (isPickerFocused) onPickerClose && onPickerClose(true);
    }
    moreColorsPopoverRef.current.toggle();
    setPickerShow(!isPickerShow);
  }, [moreColorsPopoverRef, isPickerShow, onPickerClose]);

  const onPickerMouseDown = useCallback((event) => {
    if (!event.target.closest('input, label')) {
      event.preventDefault();
      if (event.currentTarget.contains(document.activeElement)) {
        // Let reused picker inputs refresh their values when switching formats.
        event.currentTarget.focus({ preventScroll: true });
      }
    }
    eventStopPropagation(event);
  }, []);

  const onClick = useCallback((event) => {
    eventStopPropagation(event);
  }, []);

  const onPickerKeyDown = useCallback((event) => {
    if (event.key !== 'Enter' || !event.target.matches('input') || event.nativeEvent.isComposing || event.keyCode === 229) return;
    eventStopPropagation(event);
    event.currentTarget.focus({ preventScroll: true });
  }, []);

  const onChange = useCallback((color) => {
    const validColor = color.hex;
    onSetColor(validColor, false, false);
  }, [onSetColor]);

  const setLastUsedColor = useCallback((event) => {
    eventStopPropagation(event);
    onSetColor(lastUsedColor, false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recentUsedColors, lastUsedColor, disabled]);

  const buttonId = `button-${id}`;

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
            <div className={classnames('sdoc-more-colors pr-2', { 'show-pick': isPickerShow })} id="sdoc-more-colors">
              <span>{t('More_color')}</span>
              <i className="sdocfont sdoc-arrow-right"></i>
            </div>
            <UncontrolledPopover
              target="sdoc-more-colors"
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
                className="sdoc-more-colors-container"
                ref={moreColorsContainerRef}
                tabIndex={-1}
                onMouseDown={onPickerMouseDown}
                onClick={onClick}
                onKeyDown={onPickerKeyDown}
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
  onPickerClose: PropTypes.func,
};

export default withTranslation('sdoc-editor')(ColorMenu);
