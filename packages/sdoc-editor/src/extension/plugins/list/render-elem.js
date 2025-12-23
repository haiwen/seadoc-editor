import React from 'react';
import { Transforms } from '@seafile/slate';
import { ReactEditor } from '@seafile/slate-react';
import classnames from 'classnames';
import { ORDERED_LIST } from '../../constants';

const renderList = (props, editor) => {
  const { attributes, children, element: node } = props;
  const Tag = node.type === ORDERED_LIST ? 'ol' : 'ul';
  return <Tag data-id={node.id} className="list-container d-flex flex-column" {...attributes}>{children}</Tag>;
};

const renderListItem = (props, editor) => {
  const { attributes, children, element } = props;
  const collapsed = !!element.collapsed;
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

  const togglePrefix = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const path = ReactEditor.findPath(editor, element);
    Transforms.setNodes(
      editor,
      { collapsed: !collapsed },
      { at: path }
    );
  };

  const newChildren = !collapsed ? children : children[0];

  return (
    <li data-id={element.id} {...attributes} className={classnames(className, { 'sdoc-li-bold': isBold })}>
      {element.children.length > 1 && (
        <span className='sdoc-li-control' contentEditable='false'>
          <span className={classnames('sdoc-li-prefix', 'sdocfont', (!collapsed ? 'sdoc-arrow-down' : 'sdoc-next-page'))} onMouseDown={togglePrefix}></span>
          <span className='sdoc-li-divider'></span>
        </span>
      )}
      <span className='sdoc-li-content'>
        {newChildren}
      </span>
    </li>
  );
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
