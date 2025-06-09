import React, { Fragment } from 'react';
import { withTranslation } from 'react-i18next';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import Tooltip from '../../../../components/tooltip';
import { isMac, isMobile } from '../../../../utils/common-utils';
import { HEADERS, HEADER_TITLE_MAP, MAC_HOTKEYS, PARAGRAPH, SDOC_FONT_SIZE, SUBTITLE, TITLE, WIN_HOTKEYS } from '../../../constants';
import { focusEditor } from '../../../core';
import { getHeaderType, isMenuDisabled, setHeaderType } from '../helpers';

import './style.css';

const propTypes = {
  isRichEditor: PropTypes.bool,
  className: PropTypes.string,
  editor: PropTypes.object,
  t: PropTypes.func,
};

class HeaderMenu extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isShowHeaderPopover: false,
    };
  }

  registerEventHandler = () => {
    document.addEventListener('click', this.onHideHeaderMenu, true);
  };

  unregisterEventHandler = () => {
    document.removeEventListener('click', this.onHideHeaderMenu, true);
  };

  onHideHeaderMenu = (e) => {
    const menu = this.menu;
    const clickIsInMenu = menu && menu.contains(e.target) && menu !== e.target;
    if (clickIsInMenu) return;
    this.setState({ isShowHeaderPopover: false }, () => {
      this.unregisterEventHandler();
    });
  };

  getValue = () => {
    const { editor } = this.props;
    return getHeaderType(editor);
  };

  isActive = (type) => {
    return this.getValue() === type;
  };

  isDisabled = () => {
    const { editor, readonly } = this.props;
    return isMenuDisabled(editor, readonly);
  };

  onToggleClick = (event) => {
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    const isShowHeaderPopover = !this.state.isShowHeaderPopover;
    if (isShowHeaderPopover) {
      this.setState({ isShowHeaderPopover }, () => {
        this.registerEventHandler();
      });
    } else {
      this.setState({ isShowHeaderPopover }, () => {
        this.unregisterEventHandler();
      });
    }
  };

  onMouseDown = (type) => {
    return () => {
      const { editor } = this.props;
      const active = this.isActive(type);
      const newType = active ? PARAGRAPH : type;
      setHeaderType(editor, newType);
      focusEditor(editor, editor.selection);
      this.setState({ isShowHeaderPopover: false }, () => {
        this.unregisterEventHandler();
      });
    };
  };

  setMenuRef = (ref) => {
    this.menu = ref;
  };

  getToolTip = (type) => {
    return isMac() ? MAC_HOTKEYS[type] : WIN_HOTKEYS[type];
  };

  render() {
    const { t } = this.props;
    const { isShowHeaderPopover } = this.state;
    const headerIconClass = `sdocfont sdoc-${isShowHeaderPopover ? 'caret-up' : 'drop-down'}`;
    const currentType = this.getValue();
    const disabled = this.isDisabled();
    const itemList = [PARAGRAPH, 'divider', TITLE, SUBTITLE, 'divider', ...HEADERS];

    return (
      <div className='header-menu'>
        <div className={classnames('header-toggle', { 'header-toggle-disabled': disabled })} onClick={disabled ? () => {} : this.onToggleClick}>
          <span className='active'>{t(HEADER_TITLE_MAP[currentType])}</span>
          <span className={headerIconClass}></span>
        </div>
        {isShowHeaderPopover && (
          <div ref={this.setMenuRef} className={classnames('header-popover sdoc-dropdown-menu', { 'sdoc-dropdown-menu-mobile': isMobile })}>
            {itemList.map((item, index) => {
              if (item === 'divider') {
                return (<div key={index} className='sdoc-dropdown-menu-divider'></div>);
              }
              const id = `${item}-${index}`;
              const isSelected = currentType === item;
              return (
                <Fragment key={index}>
                  <div
                    id={id}
                    className={classnames('sdoc-dropdown-menu-item', { 'position-relative': isSelected })}
                    onClick={this.onMouseDown(item)}
                  >
                    {isSelected && (<i className="sdocfont sdoc-check-mark"></i>)}
                    <span style={{ fontSize: `${SDOC_FONT_SIZE[item]}pt` }}>{t(HEADER_TITLE_MAP[item])}</span>
                  </div>
                  <Tooltip
                    target={id}
                    placement="right"
                  >
                    {this.getToolTip(item)}
                  </Tooltip>
                </Fragment>
              );
            })}
          </div>
        )}
      </div>
    );
  }
}

HeaderMenu.propTypes = propTypes;

export default withTranslation('sdoc-editor')(HeaderMenu);
