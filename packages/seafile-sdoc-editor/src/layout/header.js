import React, { Component } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';

const propTypes = {
  className: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default class Header extends Component {
  render() {
    const { children, className, ...restProps } = this.props;
    return (
      <div className={classnames('sdoc-editor-page-header d-flex justify-content-between align-items-center px-4', className)} {...restProps}>
        {children}
      </div>
    );
  }
}

Header.propTypes = propTypes;
