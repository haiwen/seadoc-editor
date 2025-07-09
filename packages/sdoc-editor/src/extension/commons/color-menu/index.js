import React, { useCallback, useRef, useState } from 'react';
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
  popoverClassName,
  disabled,
  t,
  setColor,
  recentUsedColorsKey,
  text,
  defaultColorTip,
  defaultColor,
  lastUsedColor,
  updateLastUsedColor,
}) => {
  const popoverRef = useRef(null);
  const moreColorsPopoverRef = useRef(null);

  const [recentUsedColors, setRecentUsedColors] = useState(LocalStorage.getItem(recentUsedColorsKey, DEFAULT_RECENT_USED_LIST));
  const [isShowMenu, setMenuShow] = useState(false);
  const [isPickerShow, setPickerShow] = useState(false);

  const onSetColor = useCallback((color, shouldClose = true) => {
    if (disabled) return;
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
  }, [recentUsedColors, recentUsedColorsKey, isShowMenu, isPickerShow, disabled]);

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

  const onClick = useCallback((event) => {
    eventStopPropagation(event);
  }, []);

  const onChange = useCallback((color) => {
    const validColor = color.hex;
    onSetColor(validColor, false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

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
          <i className={`sdoc-menu-with-dropdown-triangle-icon sdocfont sdoc-${isShowMenu ? 'caret-up' : 'drop-down'}`}></i>
        </div>
      </button>
      {text && (
        <Tooltip target={buttonId}>
          {t(text)}
        </Tooltip>
      )}
      {!disabled && (
        <UncontrolledPopover
          target={id}
          className={classnames('sdoc-color-menu-popover', popoverClassName)}
          trigger="legacy"
          placement="bottom-start"
          hideArrow={true}
          toggle={toggle}
          fade={false}
          ref={popoverRef}
        >
          <div className="sdoc-dropdown-menu sdoc-color-dropdown-menu">
            <div className="p-3 d-flex flex-column">
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
              <i className="sdocfont sdoc-right-slide"></i>
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
            >
              <div className="sdoc-more-colors-container" onClick={onClick}>
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
  popoverClassName: PropTypes.string,
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
};

export default withTranslation('sdoc-editor')(ColorMenu);
