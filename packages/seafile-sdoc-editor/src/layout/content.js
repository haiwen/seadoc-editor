import React, { Component } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';

const propTypes = {
  className: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default class Content extends Component {
  render() {
    const { children, className, ...restProps } = this.props;
    return (
      <div className={classnames('sdoc-editor-page-content', className)} {...restProps}>
        {children}
      </div>
    );
  }
}

Content.propTypes = propTypes;
