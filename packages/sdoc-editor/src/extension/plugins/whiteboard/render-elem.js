import React, { useRef } from 'react';
import { useSelected } from '@seafile/slate-react';
import classNames from 'classnames';
import context from '../../../context';

import './index.css';

const Whiteboard = ({ editor, element }) => {
  const { filePath, repoID, title, link } = element;
  const whiteboardRef = useRef();
  const isSelected = useSelected();

  const handleDoubleClick = (event) => {
    event.preventDefault();
    const siteRoot = context.getSetting('siteRoot');
    const url = `${siteRoot}lib/${repoID}/file${filePath}`;
    window.open(url, '_blank');
    return;
  };

  return (
    <div className={classNames('sdoc-whiteboard-container', { 'isSelected': isSelected })} ref={whiteboardRef} onDoubleClick={handleDoubleClick} scrolling='no'>
      <div className='sdoc-whiteboard-title'>{title}</div>
      <iframe
        className='sdoc-whiteboard-element'
        title={title}
        src={link}
        style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none', }}
      >
      </iframe>
    </div>
  );
};

export function renderWhiteboard(props, editor) {
  const { element, children, attributes } = props;

  return (
    <div
      {...attributes}
      contentEditable='false'
      suppressContentEditableWarning
    >
      {children}
      <Whiteboard editor={editor} element={element} contentEditable='false' />
    </div>
  );
}
