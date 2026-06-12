import React from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import classnames from 'classnames';
import PropTypes from 'prop-types';

import './index.css';

const Tooltip = ({ target, children, className, modifiers = [], placement = 'bottom', fade = false, delay = 0, offset = null }) => {

  const hasBoundary = modifiers.find(item => item.name === 'preventOverflow');
  const newModifiers = hasBoundary ? modifiers : [...modifiers, {
    name: 'preventOverflow',
    options: {
      boundary: window.document.body,
    },
  }];
  const props = {
    target,
    placement,
    popperClassName: classnames('sdoc-tooltip', className),
    delay,
    hideArrow: true,
    autohide: false,
    fade,
    modifiers: newModifiers,
    ...(offset && { offset }),
  };

  return (
    <UncontrolledTooltip { ...props }>
      {children}
    </UncontrolledTooltip>
  );
};

Tooltip.propTypes = {
  target: PropTypes.string.isRequired,
  className: PropTypes.string,
  placement: PropTypes.string,
  children: PropTypes.any,
  fade: PropTypes.bool
};

export default Tooltip;
