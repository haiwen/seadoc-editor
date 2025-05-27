import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';

const MultiColumnRoot = ({ attributes, children }) => {

  return (
    <div
      {...attributes}
      className={classnames('sdoc-multicolumn-wrapper position-relative', attributes.className)}
      style={{ ...attributes.style, maxWidth: '100%' }}
    >
      {children}
    </div>
  );
};

MultiColumnRoot.propTypes = {
  attributes: PropTypes.object,
  children: PropTypes.node
};

export default MultiColumnRoot;
