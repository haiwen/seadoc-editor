import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DOCUMENT_PLUGIN_EDITOR, INTERNAL_EVENT, WIKI_EDITOR, FULL_WIDTH_MODE } from '../constants';
import { useScrollContext } from '../hooks/use-scroll-context';
import { getStyleByDefaultMode } from '../utils/default-mode';
import EventBus from '../utils/event-bus';
import { getStyleByFullWidthMode } from '../utils/full-width-mode';
import LocalStorage from '../utils/local-storage-utils';

export default function ArticleContainer({ editor, children, isShowCommentPanelInWiki }) {
  const scrollRef = useScrollContext();
  const articleRef = useRef(null);
  const [containerStyle, setContainerStyle] = useState({});

  useEffect(() => {
    editor.width = articleRef.current.children[0].clientWidth;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleWindowResize = useCallback(({
    scrollIntoArticle = false,
    isFullWidth = LocalStorage.getItem(FULL_WIDTH_MODE),
  } = {}) => {
    // Full width mode
    if (isFullWidth && editor.editorType !== WIKI_EDITOR) {
      const containerStyle = getStyleByFullWidthMode(scrollRef, editor);
      setContainerStyle(containerStyle);
      return;
    }

    // Default mode
    const containerStyle = getStyleByDefaultMode(scrollRef, editor);
    setContainerStyle(containerStyle);

    if (scrollIntoArticle) {
      articleRef.current.scrollIntoView({ inline: 'start', block: 'nearest' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor.editorType, scrollRef]);

  useEffect(() => {
    if (editor.editorType === DOCUMENT_PLUGIN_EDITOR) return;
    const eventBus = EventBus.getInstance();
    const unsubscribeOutline = eventBus.subscribe(INTERNAL_EVENT.OUTLINE_STATE_CHANGED, handleWindowResize);
    const unsubscribeResizeArticle = eventBus.subscribe(INTERNAL_EVENT.RESIZE_ARTICLE, handleWindowResize);
    return () => {
      unsubscribeOutline();
      unsubscribeResizeArticle();
    };
  }, [editor.editorType, handleWindowResize]);

  useEffect(() => {
    if (editor.editorType === DOCUMENT_PLUGIN_EDITOR) return;
    handleWindowResize();
    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const articleStyle = editor.getArticleStyle && editor.getArticleStyle();
  const articleContainerStyle = editor.editorType !== WIKI_EDITOR && editor.getArticleStyle ? { width: articleStyle.width } : containerStyle;

  return (
    <div className='sdoc-article-container' style={articleContainerStyle}>
      {React.Children.count(children) === 1 && (
        <div className='article sdoc-editor__article' style={articleStyle} id="sdoc-editor-print-wrapper" ref={articleRef}>{children}</div>
      )}
      {React.Children.count(children) > 1 && (
        <>
          <div className='article sdoc-editor__article' style={articleStyle} id="sdoc-editor-print-wrapper" ref={articleRef}>{children[0]}</div>
          {[...children.slice(1)]}
        </>
      )}
    </div>
  );
}
