import React from 'react';
import PropTypes from 'prop-types';

import './style.css';

const propTypes = {
  itemClass: PropTypes.string,
  iconClass: PropTypes.string,
  isChecked: PropTypes.bool,
  children: PropTypes.string,
  onClick: PropTypes.func,
};

class MenuItem extends React.Component {

  onClick = (e) => {
    this.props.onClick(e);
  };

  render() {
    const { children, itemClass, iconClass, isChecked } = this.props;

    const containerClass = `sdoc-menu-item ${itemClass || ''}`;
    const itemIconClass = `menu-item-icon ${iconClass || ''}`;

    return (
      <span className={containerClass} onClick={this.onClick}>
        <span className={itemIconClass}></span>
        <span className="menu-item-name">{children}</span>
        {isChecked && (<span className="sdocfont sdoc-check-mark" />)}
      </span>
    );
  }
}

MenuItem.propTypes = propTypes;

export default MenuItem;
