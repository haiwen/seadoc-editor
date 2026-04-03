import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Transforms } from '@seafile/slate';
import { ReactEditor, useReadOnly, useSelected } from '@seafile/slate-react';
import classNames from 'classnames';
import isUrl from 'is-url';
import { useScrollContext } from '../../../hooks/use-scroll-context';
import { focusEditor } from '../../core';
import { getMenuPosition } from '../../utils';
import { DEFAULT_EMBED_LINK_HEIGHT, EMBED_LINK_SOURCE, MAX_EMBED_LINK_HEIGHT, MIN_EMBED_LINK_HEIGHT, MIN_EMBED_LINK_WIDTH } from './constants';
import { normalizeFigmaEmbedLink, updateEmbedLink } from './helper';
import EmbedLinkHoverMenu from './hover-menu';

import './index.css';

const EmbedLink = ({ editor, element }) => {
  const EmbedLinkRef = useRef();
  const embedLinkContainerRef = useRef(null);
  const fullscreenRef = useRef();
  const scrollRef = useScrollContext();
  const isSelected = useSelected();
  const readOnly = useReadOnly();
  const resizerRef = useRef(null);
  const resizeStartXRef = useRef(0);
  const resizeStartYRef = useRef(0);
  const resizeStartWidthRef = useRef(0);
  const resizeStartHeightRef = useRef(0);
  const { t } = useTranslation('sdoc-editor');
  const [menuPosition, setMenuPosition] = useState({ top: '', left: '' });
  const [isShowZoomOut, setIsShowZoomOut] = useState(false);
  const [movingWidth, setMovingWidth] = useState(null);
  const [movingHeight, setMovingHeight] = useState(null);
  const [isResizing, setIsResizing] = useState(false);

  const { link: originalLink, link_type } = element;

  let link = originalLink;
  if (link_type === EMBED_LINK_SOURCE.FIGMA) {
    link = normalizeFigmaEmbedLink(originalLink);
  }

  const isValidUrl = useMemo(() => {
    return isUrl(link);
  }, [link]);

  const registerEvent = useCallback((eventList) => {
    eventList.forEach(element => {
      document.addEventListener(element.eventName, element.event);
    });
  }, []);

  const getEmbedLinkHeight = useCallback(() => {
    const height = movingHeight ?? element?.data?.height;
    const parsedHeight = Number(height);
    if (parsedHeight > 0) {
      return Math.min(Math.max(parsedHeight, MIN_EMBED_LINK_HEIGHT), MAX_EMBED_LINK_HEIGHT);
    }
    return DEFAULT_EMBED_LINK_HEIGHT;
  }, [element?.data?.height, movingHeight]);

  const getEmbedLinkWidth = useCallback(() => {
    const width = movingWidth ?? element?.data?.width;
    const parsedWidth = Number(width);
    if (parsedWidth > 0) {
      return Math.max(parsedWidth, MIN_EMBED_LINK_WIDTH);
    }
    return '100%';
  }, [element?.data?.width, movingWidth]);

  const onMouseMove = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    const changeX = event.clientX - resizeStartXRef.current;
    const changeY = event.clientY - resizeStartYRef.current;
    let embedLinkHeight = resizeStartHeightRef.current + changeY;
    let embedLinkWidth = resizeStartWidthRef.current + changeX;
    embedLinkHeight = Math.min(Math.max(embedLinkHeight, MIN_EMBED_LINK_HEIGHT), MAX_EMBED_LINK_HEIGHT);

    embedLinkWidth = Math.max(embedLinkWidth, MIN_EMBED_LINK_WIDTH);
    const maxWidth = embedLinkContainerRef.current?.parentElement?.getBoundingClientRect().width;
    if (maxWidth > 0) {
      embedLinkWidth = Math.min(embedLinkWidth, maxWidth);
    }

    if (embedLinkContainerRef.current) {
      embedLinkContainerRef.current.style.height = `${embedLinkHeight}px`;
      embedLinkContainerRef.current.style.width = `${embedLinkWidth}px`;
    }
    setMovingWidth(embedLinkWidth);
    setMovingHeight(embedLinkHeight);
  }, []);

  const onResizeEnd = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    unregisterEvent([
      {
        'eventName': 'mousemove',
        'event': onMouseMove
      },
      {
        'eventName': 'mouseup',
        'event': onResizeEnd
      },
    ]);

    const resolvedHeight = movingHeight ?? embedLinkContainerRef.current?.getBoundingClientRect().height ?? getEmbedLinkHeight();
    const finalHeight = Math.min(Math.max(Number(resolvedHeight) || DEFAULT_EMBED_LINK_HEIGHT, MIN_EMBED_LINK_HEIGHT), MAX_EMBED_LINK_HEIGHT);
    const resolvedWidth = movingWidth ?? embedLinkContainerRef.current?.getBoundingClientRect().width ?? getEmbedLinkWidth();
    const parsedWidth = Number(resolvedWidth);
    const finalWidth = parsedWidth > 0 ? Math.max(parsedWidth, MIN_EMBED_LINK_WIDTH) : resolvedWidth;
    const newData = { ...element.data, width: finalWidth, height: finalHeight };
    updateEmbedLink(editor, newData);

    // Reset hover menu position
    setTimeout(() => {
      setIsResizing(false);
    }, 100);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, element.data, getEmbedLinkHeight, getEmbedLinkWidth, movingHeight, movingWidth, onMouseMove]);

  const unregisterEvent = useCallback((eventList) => {
    eventList.forEach(element => {
      document.removeEventListener(element.eventName, element.event);
    });
  }, []);

  const onResizeStart = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsResizing(true);
    resizeStartXRef.current = event.clientX;
    resizeStartYRef.current = event.clientY;
    const currentWidth =
      embedLinkContainerRef.current?.getBoundingClientRect().width ||
      embedLinkContainerRef.current?.parentElement?.getBoundingClientRect().width ||
      0;
    const currentHeight =
      embedLinkContainerRef.current?.getBoundingClientRect().height ||
      getEmbedLinkHeight();

    resizeStartWidthRef.current = currentWidth;
    resizeStartHeightRef.current = currentHeight;

    registerEvent([
      {
        'eventName': 'mousemove',
        'event': onMouseMove
      },
      {
        'eventName': 'mouseup',
        'event': onResizeEnd
      },
    ]);
  }, [getEmbedLinkHeight, onMouseMove, onResizeEnd, registerEvent]);

  const onDeleteEmbedLink = useCallback(() => {
    const path = ReactEditor.findPath(editor, element);
    Transforms.removeNodes(editor, { at: path });
    focusEditor(editor);
    Transforms.select(editor, editor.selection);
  }, [editor, element]);

  const handleDoubleClick = (event) => {
    event.preventDefault();
    if (!isValidUrl) return;
    window.open(link, '_blank');
    return;
  };

  const handleScroll = useCallback((e) => {
    if (readOnly) return;
    if (!isSelected && !isShowZoomOut) return;
    const menuPosition = getMenuPosition(EmbedLinkRef.current, editor);
    setMenuPosition(menuPosition);
  }, [editor, isSelected, readOnly, isShowZoomOut]);

  useEffect(() => {
    if (readOnly) return;
    let observerRefValue = null;
    let resizeObserver = null;
    if (scrollRef.current) {
      scrollRef.current.addEventListener('scroll', handleScroll);
      observerRefValue = scrollRef.current;

      resizeObserver = new ResizeObserver((entries) => {
        // eslint-disable-next-line no-unused-vars
        for (let entry of entries) {
          if (resizeObserver) {
            handleScroll();
          }
        }
      });

      resizeObserver.observe(scrollRef.current);
    }

    return () => {
      if (observerRefValue) {
        observerRefValue.removeEventListener('scroll', handleScroll);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [handleScroll, readOnly, scrollRef]);

  const handleOnClick = useCallback(() => {
    if (readOnly) return;
    if (isSelected) {
      const menuPosition = getMenuPosition(EmbedLinkRef.current, editor);
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
      <div
        ref={embedLinkContainerRef}
        className={classNames('sdoc-embed-link-container', { 'isSelected': isSelected })}
        style={{ width: getEmbedLinkWidth(), maxWidth: '100%', height: getEmbedLinkHeight(), maxHeight: MAX_EMBED_LINK_HEIGHT }}
        onDoubleClick={handleDoubleClick}
        scrolling='no'
      >
        {isValidUrl && (
          <>
            <iframe
              className={`sdoc-embed-link-element ${link_type}`}
              title={link}
              src={link}
              ref={EmbedLinkRef}
            >
            </iframe>
            <div className='iframe-overlay' onDoubleClick={handleDoubleClick} onClick={handleOnClick}></div>
            {!readOnly && isSelected && (
              <span className='image-resizer' ref={resizerRef} onMouseDown={onResizeStart}></span>
            )}
          </>
        )}
        {!isValidUrl && (
          <div ref={EmbedLinkRef} className='sdoc-embed-link-tip'>{t('Embed_link_invalid_tip')}</div>
        )}
      </div>
      {isSelected && !readOnly && !isShowZoomOut && !isResizing &&
        <EmbedLinkHoverMenu
          isValidUrl={isValidUrl}
          menuPosition={menuPosition}
          onOpen={handleDoubleClick}
          openFullscreen={openFullscreen}
          onDeleteEmbedLink={onDeleteEmbedLink}
        />
      }
      {isShowZoomOut && (
        ReactDOM.createPortal(
          <div className='embed-link-zoom-out-container' onClick={() => setIsShowZoomOut(false)}>
            <iframe
              title={link}
              className={`sdoc-embed-link-element-full-screen ${link_type}`}
              src={link}
              ref={fullscreenRef}
            >
            </iframe>
          </div>,
          document.body
        )
      )}
    </>
  );
};

export function renderEmbedLink(props, editor) {
  const { element, children, attributes } = props;

  return (
    <div
      {...attributes}
      contentEditable='false'
      suppressContentEditableWarning
    >
      {children}
      <EmbedLink editor={editor} element={element} contentEditable='false' />
    </div>
  );
}
