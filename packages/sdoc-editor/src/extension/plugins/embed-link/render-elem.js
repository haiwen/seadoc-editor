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
import { EMBED_LINK_SOURCE } from './constants';
import { normalizeFigmaEmbedLink } from './helper';
import EmbedLinkHoverMenu from './hover-menu';

import './index.css';

const EmbedLink = ({ editor, element }) => {
  const EmbedLinkRef = useRef();
  const fullscreenRef = useRef();
  const scrollRef = useScrollContext();
  const isSelected = useSelected();
  const readOnly = useReadOnly();
  const { t } = useTranslation('sdoc-editor');
  const [menuPosition, setMenuPosition] = useState({ top: '', left: '' });
  const [isShowZoomOut, setIsShowZoomOut] = useState(false);

  const { link: originalLink, link_type } = element;

  let link = originalLink;
  if (link_type === EMBED_LINK_SOURCE.FIGMA) {
    link = normalizeFigmaEmbedLink(originalLink);
  }

  const isValidUrl = useMemo(() => {
    return isUrl(link);
  }, [link]);

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
      observerRefValue.removeEventListener('scroll', handleScroll);
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
      <div className={classNames('sdoc-embed-link-container', { 'isSelected': isSelected })} onDoubleClick={handleDoubleClick} scrolling='no' >
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
          </>
        )}
        {!isValidUrl && (
          <div ref={EmbedLinkRef} className='sdoc-embed-link-tip'>{t('Embed_link_invalid_tip')}</div>
        )}
      </div>
      {isSelected && !readOnly && !isShowZoomOut &&
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
