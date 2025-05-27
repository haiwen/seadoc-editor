import React, { useCallback } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

const OutlineItem = ({ node, activeId }) => {
  const onItemClick = useCallback(() => {
    const { id } = node;
    document.getElementById(id).scrollIntoView();
  }, [node]);

  const className = classNames({
    'outline-h2': node.type === 'header2',
    'outline-h3': node.type === 'header3',
    'active': node.id === activeId,
  });

  return (
    <div className={className} onClick={onItemClick}>
      {node.children.map(child => child.text).join('')}
    </div>
  );
};

OutlineItem.propTypes = {
  node: PropTypes.object,
};

export default OutlineItem;
