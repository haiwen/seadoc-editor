import React, { useState, useEffect, forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import MenuShortcutPrompt from '../menu-shortcut-indicator';

import './index.css';

const DropdownMenuItem = forwardRef((props, ref) => {
  const { disabled, onClick, menuConfig, children, className, shortcut, isHidden } = props;
  const { t } = useTranslation('sdoc-editor');
  const { iconClass } = menuConfig;
  const [isShowChildren, setShowChildren] = useState(false);

  // onMount
  useEffect(() => {
    setShowChildren(!isShowChildren);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={classnames('sdoc-dropdown-menu-item', className, { 'disabled': disabled, 'sdoc-dropdown-item-with-left-icon': iconClass, 'sdoc-link-dropdown-menu-item': shortcut, 'sdoc-dropdown-menu-item-hidden': isHidden })}
      id={menuConfig.id || ''}
      onClick={disabled ? () => {} : onClick || (() => {})}
      ref={ref}
    >
      <div className="sdoc-dropdown-item-content">
        <div className='sdoc-dropdown-item-left'>
          {iconClass && (<i className={classnames(iconClass, 'sdoc-dropdown-item-content-icon')}></i>)}
          <span>{t(menuConfig.text)}</span>
        </div>
        {shortcut && (<MenuShortcutPrompt shortcuts={shortcut} />)}
      </div>
      {isShowChildren && children}
    </div>
  );
});

DropdownMenuItem.propTypes = {
  disabled: PropTypes.bool,
  isHidden: PropTypes.bool,
  className: PropTypes.string,
  menuConfig: PropTypes.object,
  children: PropTypes.any,
  onClick: PropTypes.func,
};

export default DropdownMenuItem;
