import React, { useCallback } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { expandCollapsedHeaderAncestors } from '../extension/plugins/header/helpers';

const OutlineItem = ({ node, activeId, itemPath, editor }) => {
  const onItemClick = useCallback(() => {
    const { id } = node;

    const scrollToTarget = () => {
      const target = document.getElementById(id);
      if (!target) return;
      target.scrollIntoView();
    };

    const isExpanded = editor ? expandCollapsedHeaderAncestors(editor, node, itemPath) : false;
    if (!isExpanded) {
      scrollToTarget();
      return;
    }

    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(scrollToTarget);
      return;
    }

    setTimeout(scrollToTarget, 0);
  }, [editor, itemPath, node]);

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
  editor: PropTypes.object,
};

export default OutlineItem;
