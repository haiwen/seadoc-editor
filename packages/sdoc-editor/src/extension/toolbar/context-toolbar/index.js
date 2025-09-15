import React, { useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Editor, Range } from '@seafile/slate';
import { useFocused, useSlateStatic, useReadOnly } from '@seafile/slate-react';
import { useScrollContext } from '../../../hooks/use-scroll-context';
import { MenuGroup } from '../../commons';
import { CODE_BLOCK } from '../../constants';
import { getSelectedNodeByType } from '../../core';
import TextStyleMenuList from '../../plugins/text-style/menu';

import './index.css';

function getRangeObject(selectionObject) {
  if (selectionObject.rangeCount === 0) return null;
  return selectionObject.getRangeAt(0);
}


const ContextToolbar = () => {
  const ref = useRef(null);
  const editor = useSlateStatic();
  const scrollRef = useScrollContext();
  const inFocus = useFocused();
  const readOnly = useReadOnly();
  const clickedCommentRef = useRef(false);

  const setContextToolbarPosition = useCallback(() => {
    const el = ref.current;
    const domSelection = window.getSelection();
    const domRange = getRangeObject(domSelection);
    if (!domRange) return;
    const rect = domRange.getBoundingClientRect();
    const top = rect.top - 42 - 12;// top = Current top - Element height - Shaded part
    el.style.top = `${top}px`;
    el.style.left = `${rect.left}px`;
    // 475 is content menu max width
    if (475 + rect.left > window.innerWidth) {
      el.style.left = `${window.innerWidth - 475 - 25}px`;
    }
    if (editor.topOffset && top < editor.topOffset) {
      // context menu is in top unseen position
      el.style.display = 'none';
    } else if (rect.top > window.innerHeight) {
      // context menu is in bottom unseen position
      el.style.display = 'none';
    } else {
      // context menu is in current screen
      el.style.display = 'block';
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onScroll = useCallback((e) => {
    setContextToolbarPosition();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = ref.current;
    const { selection } = editor;

    if (!el) {
      return;
    }

    if (clickedCommentRef.current) {
      clickedCommentRef.current = false;
      return;
    }

    if (
      readOnly ||
      !selection ||
      !inFocus ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === '' ||
      getSelectedNodeByType(editor, CODE_BLOCK)
    ) {
      scrollRef.current && scrollRef.current.removeEventListener('scroll', onScroll);
      el.removeAttribute('style');
      return;
    }

    scrollRef.current && scrollRef.current.addEventListener('scroll', onScroll);
    setContextToolbarPosition();
  });

  useEffect(() => {
    const handleClickCommentBtn = (e) => {
      const target = e.target;
      if (target?.closest('#context-toolbar-comment')) {
        clickedCommentRef.current = true;
      }
    };

    document.addEventListener('mousedown', handleClickCommentBtn);
    return () => document.removeEventListener('mousedown', handleClickCommentBtn);
  }, []);

  const onMouseDown = useCallback((event) => {
    event.preventDefault(); // prevent toolbar from taking focus away from editor
  }, []);

  const onMouseMove = useCallback(e => {
    const isMouseLeftDown = e.buttons === 1;
    if (isMouseLeftDown) {
      const el = ref.current;
      el.removeAttribute('style');
    }
  }, []);

  return createPortal(
    <div ref={ref} className='sdoc-context-toolbar' onMouseDown={onMouseDown} onMouseOver={onMouseMove}>
      <MenuGroup>
        <TextStyleMenuList editor={editor} idPrefix={'sdoc_context_toolbar'} />
      </MenuGroup>
    </div>,
    document.body,
  );
};

export default ContextToolbar;
