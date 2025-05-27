import React from 'react';
import classNames from 'classnames';
import propTypes from 'prop-types';

import './style.css';

const MenuShortcutPrompt = ({ shortcuts, containerClassName = '' }) => {
  return (
    <div className={classNames('sdoc-shortcut-prompt-container', containerClassName)} >
      {
        shortcuts.map((shortcut, index) => <kbd key={`sdoc-shortcut-${shortcut}-${index}`}>{shortcut}</kbd>)
      }
    </div>
  );
};

MenuShortcutPrompt.propTypes = {
  shortcuts: propTypes.array.isRequired,
  containerClassName: propTypes.string,
};

export default MenuShortcutPrompt;
