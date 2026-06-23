import React from 'react';
import { Editor, Element, Node, Transforms } from '@seafile/slate';
import { ReactEditor } from '@seafile/slate-react';
import classnames from 'classnames';
import { SDOC_FONT_SIZE } from '../../constants';
import { isEmptyNode } from '../paragraph/helper';
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
  const collapsed = !!element.collapsed;
  const currentPath = ReactEditor.findPath(editor, element);
  const activeHeaderEntry = editor.selection ? Editor.above(editor, {
    at: editor.selection,
    match: (node, path) => Element.isElement(node) && node.id === element.id && path.length === currentPath.length,
    mode: 'lowest',
  }) : null;
  const isActiveHeader = !!activeHeaderEntry;

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

    Transforms.setNodes(editor, { collapsed: !collapsed }, { at: currentPath });
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
            'sdoc-header-collapse-prefix-visible': isActiveHeader,
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
