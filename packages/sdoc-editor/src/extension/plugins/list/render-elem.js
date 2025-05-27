import React from 'react';
import classnames from 'classnames';
import { ORDERED_LIST } from '../../constants';

const renderList = (props, editor) => {
  const { attributes, children, element: node } = props;
  const Tag = node.type === ORDERED_LIST ? 'ol' : 'ul';
  return <Tag data-id={node.id} className="list-container d-flex flex-column" {...attributes}>{children}</Tag>;
};

const renderListItem = (props, editor) => {
  const { attributes, children, element } = props;
  const { align } = element.children[0];
  let className = '';
  switch (align) {
    case 'center':
      className = 'align-self-center';
      break;
    case 'right':
      className = 'align-self-end';
      break;
    default:
      className = '';
  }
  const isBold = element.children[0].children.every((item) => item.bold === true);
  return <li data-id={element.id} {...attributes} className={classnames(className, { 'sdoc-li-bold': isBold })}>{children}</li>;
};

const renderListLic = (props, editor) => {
  const { attributes, children, element } = props;
  return <div data-id={element.id} {...attributes}>{children}</div>;
};

export {
  renderList,
  renderListItem,
  renderListLic,
};
