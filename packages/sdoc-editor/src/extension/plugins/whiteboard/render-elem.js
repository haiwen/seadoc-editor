import React, { useRef, useEffect, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { Transforms } from '@seafile/slate';
import { ReactEditor, useReadOnly, useSelected } from '@seafile/slate-react';
import classNames from 'classnames';
import { INTERNAL_EVENT } from '../../../constants';
import context from '../../../context';
import { useScrollContext } from '../../../hooks/use-scroll-context';
import EventBus from '../../../utils/event-bus';
import { focusEditor } from '../../core';
import { getMenuPosition } from '../../utils';
import WhiteboardHoverMenu from './hover-menu';

import './index.css';

const Whiteboard = ({ editor, element }) => {
  const { file_path, repo_id, title, link } = element;
  const whiteboardRef = useRef();
  const scrollRef = useScrollContext();
  const isSelected = useSelected();
  const readOnly = useReadOnly();
  const [menuPosition, setMenuPosition] = useState({ top: '', left: '' });
  const [isShowZoomOut, setIsShowZoomOut] = useState(false);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'checkSdocParent') {
        const isSdocClass = whiteboardRef?.current.classList.contains('sdoc-whiteboard-element');
        const isWhiteboardFullScreen = whiteboardRef?.current.classList.contains('sdoc-whiteboard-element-full-screen');
        whiteboardRef?.current.contentWindow.postMessage(
          { type: 'checkSdocParentResult', isInSdoc: isSdocClass, isFullScreen: isWhiteboardFullScreen },
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

  const onDeleteWhiteboard = useCallback(() => {
    const path = ReactEditor.findPath(editor, element);
    Transforms.removeNodes(editor, { at: path });
    focusEditor(editor);
    Transforms.select(editor, editor.selection);
  }, [editor, element]);

  const handleDoubleClick = (event) => {
    event.preventDefault();
    const siteRoot = context.getSetting('siteRoot');
    const url = `${siteRoot}lib/${repo_id}/file${file_path}`;
    window.open(url, '_blank');
    return;
  };

  const handleScroll = useCallback((e) => {
    if (readOnly) return;
    if (!isSelected) return;
    const menuPosition = getMenuPosition(whiteboardRef.current, editor);
    setMenuPosition(menuPosition);
  }, [editor, isSelected, readOnly]);

  useEffect(() => {
    if (readOnly) return;
    let observerRefValue = null;
    let resizeObserver = null;
    if (scrollRef.current) {
      scrollRef.current.addEventListener('scroll', handleScroll);
      observerRefValue = scrollRef.current;

      resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          if (resizeObserver) {
            handleScroll();
          }
        }
      });

      resizeObserver.observe(scrollRef.current);
    }

    return () => {
      observerRefValue.removeEventListener('scroll', handleScroll);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [handleScroll, readOnly, scrollRef]);

  const handleOnClick = useCallback(() => {
    if (readOnly) return;
    if (isSelected) {
      const menuPosition = getMenuPosition(whiteboardRef.current, editor);
      setMenuPosition(menuPosition);
    }
  }, [editor, isSelected, readOnly]);

  const openFullscreen = (e) => {
    e.stopPropagation();
    setIsShowZoomOut(true);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsShowZoomOut(false);
      }
    };
    if (isShowZoomOut) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isShowZoomOut, setIsShowZoomOut]);

  return (
    <>
      <div className={classNames('sdoc-whiteboard-container', { 'isSelected': isSelected })} onDoubleClick={handleDoubleClick} scrolling='no' >
        <div className='sdoc-whiteboard-title'>{title}</div>
        <iframe
          className='sdoc-whiteboard-element'
          title={title}
          src={link}
          ref={whiteboardRef}
        >
        </iframe>
        <div className='iframe-overlay' onDoubleClick={handleDoubleClick} onClick={handleOnClick}></div>
      </div>
      {isSelected && !readOnly && !isShowZoomOut &&
        <WhiteboardHoverMenu
          menuPosition={menuPosition}
          onOpen={handleDoubleClick}
          openFullscreen={openFullscreen}
          onDeleteWhiteboard={onDeleteWhiteboard}
        />
      }
      {isShowZoomOut && (
        ReactDOM.createPortal(
          <div className='whiteboard-zoom-out-container' onClick={() => setIsShowZoomOut(false)}>
            <iframe
              className='sdoc-whiteboard-element-full-screen'
              src={link}
              ref={whiteboardRef}
            >
            </iframe>
          </div>,
          document.body
        )
      )}
    </>
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
