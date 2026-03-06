import React from 'react';
import { Editor, Node, Transforms } from '@seafile/slate';
import { ReactEditor } from '@seafile/slate-react';
import classnames from 'classnames';
import { PARAGRAPH, SDOC_FONT_SIZE, TOGGLE_CONTENT } from '../../constants';
import { generateEmptyElement } from '../../core';
import { isEmptyNode } from '../paragraph/helper';
import { getLevel } from './helper';
import Placeholder from './placeholder';

import './render-elem.css';

export const renderToggleHeader = (props, editor) => {
  const { attributes, children, element } = props;
  const collapsed = !!element.collapsed;
  const childNodes = React.Children.toArray(children);

  const titleNode = childNodes[0] || null;
  const contentNode = childNodes[1] || null;

  const onToggleCollapsed = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const path = ReactEditor.findPath(editor, element);
    Editor.withoutNormalizing(editor, () => {
      const [toggleNode] = Editor.node(editor, path);
      const contentNode = toggleNode?.children?.[1];

      // Click toggle-header to expand
      if (collapsed) {
        if (!contentNode || contentNode.type !== TOGGLE_CONTENT) {
          const content = generateEmptyElement(TOGGLE_CONTENT);
          content.children = Array.isArray(toggleNode.collapsed_body) && toggleNode.collapsed_body.length > 0
            ? toggleNode.collapsed_body
            : [generateEmptyElement(PARAGRAPH)];
          Transforms.insertNodes(editor, content, { at: [...path, 1] });
        }
        Transforms.setNodes(editor, { collapsed: false, collapsed_body: null }, { at: path });
        return;
      }

      // Click toggle-header to collapse
      const collapsedBody = contentNode?.type === TOGGLE_CONTENT ? (contentNode.children || []) : [];
      if (contentNode?.type === TOGGLE_CONTENT) {
        Transforms.removeNodes(editor, { at: [...path, 1] });
      }
      Transforms.setNodes(editor, { collapsed: true, collapsed_body: collapsedBody }, { at: path });
    });
  };

  return (
    <div
      data-id={element.id}
      id={element.id}
      {...attributes}
      className={classnames('sdoc-toggle-header-container', {
        'sdoc-toggle-header-collapsed': collapsed,
      })}
    >
      <div className='sdoc-toggle-header-row'>
        <span className='sdoc-toggle-header-prefix' contentEditable={false} onMouseDown={onToggleCollapsed}>
          <span className={classnames('sdocfont', collapsed ? 'sdoc-big-caret-up' : 'sdoc-big-drop-down')}></span>
        </span>
        <div className='sdoc-toggle-header-title-wrap'>
          {titleNode}
        </div>
      </div>
      {!collapsed && (
        <div className='sdoc-toggle-header-content-wrap'>
          {contentNode}
        </div>
      )}
    </div>
  );
};

export const renderToggleHeaderTitle = (props) => {
  const { attributes, children, element, isComposing } = props;
  const level = getLevel(element);
  const style = {
    textAlign: element.align,
    fontSize: `${SDOC_FONT_SIZE[`header${level}`]}pt`,
  };

  let isShowPlaceHolder = false;
  if (isEmptyNode(element) && Node.string(element) === '' && !isComposing) {
    isShowPlaceHolder = true;
  }

  return (
    <div
      data-id={element.id}
      {...attributes}
      className={classnames('sdoc-toggle-header-title', `sdoc-header-${level}`)}
      style={{ position: isShowPlaceHolder ? 'relative' : '', ...style }}
    >
      {isShowPlaceHolder && <Placeholder title={'Header'} top={0} left={0} />}
      {children}
    </div>
  );
};

export const renderToggleHeaderContent = (props) => {
  const { attributes, children, element } = props;

  return (
    <div
      data-id={element.id}
      {...attributes}
      className='sdoc-toggle-header-content'
    >
      {children}
    </div>
  );
};
