
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Transforms } from '@seafile/slate';
import { ReactEditor, useReadOnly } from '@seafile/slate-react';
import { INTERNAL_EVENT } from '../../../constants';
import { useScrollContext } from '../../../hooks/use-scroll-context';
import EventBus from '../../../utils/event-bus';
import { focusEditor } from '../../core';
import { setClipboardCodeBlockData } from './helpers';
import CodeBlockHoverMenu from './hover-menu';

const CodeBlock = ({ attributes, children, element, editor }) => {
  const readOnly = useReadOnly();
  const codeBlockRef = useRef();
  const scrollRef = useScrollContext();
  const { style = { white_space: 'nowrap' } } = element;
  const { white_space } = style;
  const [menuPosition, setMenuPosition] = useState({ top: '', left: '' });
  const [showHoverMenu, setShowHoverMenu] = useState(false);

  const onChangeLanguage = useCallback((lang) => {
    const { value: language } = lang;
    const path = ReactEditor.findPath(editor, element);
    Transforms.setNodes(editor, { language }, { at: path });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChangeAutoLineWrap = useCallback((autoWrap) => {
    const path = ReactEditor.findPath(editor, element);
    const newStyle = { ...style, white_space: autoWrap };
    Transforms.setNodes(editor, { style: newStyle }, { at: path });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCopyCodeBlock = useCallback(() => {
    setClipboardCodeBlockData(element);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element]);

  const onDeleteCodeBlock = useCallback(() => {
    const path = ReactEditor.findPath(editor, element);
    Transforms.removeNodes(editor, { at: path });
    focusEditor(editor);
    Transforms.select(editor, editor.selection);
  }, [editor, element]);

  const onFocusCodeBlock = useCallback((e) => {
    if (readOnly) return;
    if (codeBlockRef.current) {
      const { top, left } = codeBlockRef.current.getBoundingClientRect();
      const menuTop = top - 42; // top = top distance - menu height
      const newMenuPosition = {
        top: menuTop,
        left: left // left = code-block left distance
      };
      setMenuPosition(newMenuPosition);
    }
    setShowHoverMenu(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onMouseLeave = useCallback((e) => {
    if (readOnly) return;
    setShowHoverMenu(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onScroll = useCallback((e) => {
    if (readOnly) return;
    if (!showHoverMenu) return;
    if (e.currentTarget.scrollTop) {
      const { top, left } = codeBlockRef.current.getBoundingClientRect();
      const menuTop = top - 42; // top = top distance - menu height
      const newMenuPosition = {
        top: menuTop,
        left: left // left = code-block left distance
      };
      setMenuPosition(newMenuPosition);
    }
  }, [readOnly, showHoverMenu]);

  useEffect(() => {
    if (readOnly) return;

    let observerRefValue = null;
    if (scrollRef.current) {
      scrollRef.current.addEventListener('scroll', onScroll);
      observerRefValue = scrollRef.current;
    }

    return () => {
      observerRefValue.removeEventListener('scroll', onScroll);
    };
  }, [onScroll, readOnly, scrollRef]);

  const onHiddenHoverMenu = useCallback(() => {
    if (codeBlockRef.current) {
      setShowHoverMenu(false);
    }
  }, []);

  useEffect(() => {
    const eventBus = EventBus.getInstance();
    eventBus.subscribe(INTERNAL_EVENT.HIDDEN_CODE_BLOCK_HOVER_MENU, onHiddenHoverMenu);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = () => {
    EventBus.getInstance().dispatch(INTERNAL_EVENT.UPDATE_SEARCH_REPLACE_HIGHLIGHT);
  };

  return (
    <div data-id={element.id} {...attributes} className={`sdoc-code-block-container ${attributes.className}`} onClick={onFocusCodeBlock} onMouseLeave={onMouseLeave}>
      <pre onScroll={handleScroll} className={'sdoc-code-block-pre'} ref={codeBlockRef}>
        <code className={`sdoc-code-block-code ${white_space === 'nowrap' ? 'sdoc-code-no-wrap' : ''}`}>
          {children}
        </code>
      </pre>
      {showHoverMenu && (
        <CodeBlockHoverMenu
          menuPosition={menuPosition}
          onChangeLanguage={onChangeLanguage}
          language={element.language}
          style={element.style || { white_space: 'nowrap' }}
          onChangeAutoLineWrap={onChangeAutoLineWrap}
          onCopyCodeBlock={onCopyCodeBlock}
          onDeleteCodeBlock={onDeleteCodeBlock}
        />
      )}
    </div>
  );
};

export const renderCodeBlock = (props, editor) => {
  return <CodeBlock {...props} editor={editor} />;
};

export const renderCodeLine = (props, editor) => {
  const { element, attributes, children } = props;

  return (
    <div data-id={element.id} {...attributes} className={'sdoc-code-line'}>
      {children}
    </div>
  );
};
