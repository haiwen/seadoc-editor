import React from 'react';
import { Editor, Element, Node, Transforms } from '@seafile/slate';
import { ReactEditor } from '@seafile/slate-react';
import classnames from 'classnames';
import { SDOC_FONT_SIZE } from '../../constants';
import { isEmptyNode } from '../paragraph/helper';
import { isHeaderCollapsed, toggleHeaderCollapsed } from './helpers';
import Placeholder from './placeholder';
import './render-elem.css';

export const renderTitle = (props, editor) => {
  const { element, attributes, children } = props;
  const style = {
    fontSize: `${SDOC_FONT_SIZE[element.type]}pt`,
    textAlign: element.align,
  };

  return (
    <div data-id={element.id} {...attributes} className={`sdoc-header-title ${attributes.className}`} style={{ ...style }}>
      {children}
    </div>
  );
};

export const renderSubtitle = (props, editor) => {
  const { element, attributes, children } = props;
  const style = {
    color: '#888',
    fontSize: `${SDOC_FONT_SIZE[element.type]}pt`,
    textAlign: element.align
  };
  return (
    <div data-id={element.id} {...attributes} className='sdoc-header-subtitle' style={{ ...style }}>
      {children}
    </div>
  );
};

export const renderHeader = (props, editor) => {
  const { element, attributes, children, isComposing } = props;
  const { type } = element;
  const level = type.split('header')[1];
  const currentPath = ReactEditor.findPath(editor, element);
  const collapsed = isHeaderCollapsed(editor, element, currentPath);
  const style = {
    textAlign: element.align,
    fontSize: `${SDOC_FONT_SIZE[element.type]}pt`,
    ...(level === '6' && { fontStyle: 'italic' }),
  };

  let isShowPlaceHolder = false;

  if (isEmptyNode(element) && Node.string(element) === '' && !isComposing) {
    isShowPlaceHolder = true;
  }

  const onToggleCollapsed = (event) => {
    event.preventDefault();
    event.stopPropagation();

    toggleHeaderCollapsed(editor, element, currentPath);

    if (collapsed) {
      const endPoint = Editor.end(editor, currentPath);
      Transforms.select(editor, endPoint);
      ReactEditor.focus(editor);
    }
  };

  return (
    <div
      data-id={element.id}
      id={element.id} // used for click left outline item, page scroll this element
      {...attributes}
      className={`sdoc-header-${level}`}
      style={{ position: isShowPlaceHolder ? 'relative' : '', ...style }}
    >
      <div className='sdoc-header-row'>
        <span
          className={classnames('sdoc-header-collapse-prefix', {
            'sdoc-header-collapse-prefix-visible': collapsed,
            'sdoc-header-collapse-prefix-collapsed': collapsed,
          })}
          contentEditable={false}
          onMouseDown={onToggleCollapsed}
        >
          <span className={classnames('sdocfont', collapsed ? 'sdoc-big-caret-up' : 'sdoc-big-drop-down')}></span>
        </span>
        <div className='sdoc-header-content'>
          {isShowPlaceHolder && <Placeholder title={'Header'} top={0} />}
          {children}
        </div>
      </div>
    </div>
  );
};
