import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { isMobile } from '../utils/common-utils';

import '../assets/css/layout.css';
import '../assets/css/default.css';
import '../assets/css/sdoc-editor-article.css';
import '../assets/css/sdoc-editor-plugins.css';
import '../assets/css/sdoc-comment-editor-plugin.css';
import '../assets/css/dropdown-menu.css';

const EditorContainer = ({ children, readonly, fullscreen }) => {

  const className = classNames('sdoc-editor-container', {
    'mobile': isMobile,
    'readonly': readonly,
    'fullscreen': fullscreen
  });

  return (
    <div className={className}>{children}</div>
  );
};

EditorContainer.propTypes = {
  readonly: PropTypes.bool,
  editor: PropTypes.object.isRequired,
  children: PropTypes.any,
};


export default EditorContainer;
