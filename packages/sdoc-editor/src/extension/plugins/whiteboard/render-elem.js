import React, { useRef, useEffect } from 'react';
import { useSelected } from '@seafile/slate-react';
import classNames from 'classnames';
import { INTERNAL_EVENT } from '../../../constants';
import context from '../../../context';
import EventBus from '../../../utils/event-bus';

import './index.css';

const Whiteboard = ({ editor, element }) => {
  const { filePath, repoID, title, link } = element;
  const whiteboardRef = useRef();
  const isSelected = useSelected();

  useEffect(() => {

    const handleMessage = (event) => {
      if (event.data?.type === 'checkSdocParent') {
        const isSdocClass = whiteboardRef?.current.classList.contains('sdoc-whiteboard-element');
        whiteboardRef?.current.contentWindow.postMessage(
          { type: 'checkSdocParentResult', isInSdoc: isSdocClass },
          '*'
        );
      }
    };

    const handleWindowResize = () => {
      whiteboardRef?.current.contentWindow.postMessage(
        { type: 'resizeWindowWidth', isResize: true },
        '*'
      );
    };


    const eventBus = EventBus.getInstance();
    const unsubscribeResizeArticle = eventBus.subscribe(INTERNAL_EVENT.RESIZE_ARTICLE, handleWindowResize);
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      unsubscribeResizeArticle();
    };
  }, []);

  const handleDoubleClick = (event) => {
    event.preventDefault();
    const siteRoot = context.getSetting('siteRoot');
    const url = `${siteRoot}lib/${repoID}/file${filePath}`;
    window.open(url, '_blank');
    return;
  };

  return (
    <div className={classNames('sdoc-whiteboard-container', { 'isSelected': isSelected })} onDoubleClick={handleDoubleClick} scrolling='no' >
      <div className='sdoc-whiteboard-title'>{title}</div>
      <iframe
        className='sdoc-whiteboard-element'
        title={title}
        src={link}
        ref={whiteboardRef}
      >
      </iframe>
      <div className='iframe-overlay' onDoubleClick={handleDoubleClick}></div>
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
