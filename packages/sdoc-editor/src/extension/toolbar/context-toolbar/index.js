import React, { useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Editor, Range } from '@seafile/slate';
import { ReactEditor, useFocused, useSlateStatic, useReadOnly } from '@seafile/slate-react';
import PropTypes from 'prop-types';
import { useScrollContext } from '../../../hooks/use-scroll-context';
import { hideToolbarTooltips } from '../../../utils/dom-utils';
import { MenuGroup } from '../../commons';
import { CODE_BLOCK } from '../../constants';
import { focusEditor, getSelectedNodeByType } from '../../core';
import TextStyleMenuList from '../../plugins/text-style/menu';

import './index.css';

const ContextToolbar = ({ isColorInputFocused, onColorInputFocusChange }) => {
  const ref = useRef(null);
  const editor = useSlateStatic();
  const scrollRef = useScrollContext();
  const inFocus = useFocused();
  const readOnly = useReadOnly();
  const clickedCommentRef = useRef(false);
  const colorInputRef = useRef(null);
  const internalDragRef = useRef(false);

  const clearColorInput = useCallback(() => {
    if (!colorInputRef.current) return;
    colorInputRef.current = null;
    onColorInputFocusChange(false);
  }, [onColorInputFocusChange]);

  const onColorPickerUnmount = useCallback((container) => {
    if (!container.contains(colorInputRef.current)) return;
    if (document.activeElement === colorInputRef.current && ref.current && editor.selection && !ReactEditor.isReadOnly(editor)) {
      focusEditor(editor);
    }
    clearColorInput();
  }, [clearColorInput, editor]);

  const onFocusCapture = useCallback((event) => {
    if (!event.target.matches('.sdoc-more-colors-container input')) return;
    colorInputRef.current = event.target;
    onColorInputFocusChange(true);
  }, [onColorInputFocusChange]);

  const onBlurCapture = useCallback((event) => {
    if (event.target !== colorInputRef.current) return;
    const picker = event.target.closest('.sdoc-more-colors-container');
    if (!picker?.contains(event.relatedTarget)) clearColorInput();
  }, [clearColorInput]);

  const setContextToolbarPosition = useCallback(() => {
    const el = ref.current;
    if (!el || !editor.selection) return;
    const domRange = ReactEditor.toDOMRange(editor, editor.selection);
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
      hideToolbarTooltips(el);
      el.style.display = 'none';
    } else if (rect.top > window.innerHeight) {
      // context menu is in bottom unseen position
      hideToolbarTooltips(el);
      el.style.display = 'none';
    } else {
      // context menu is in current screen
      el.style.display = 'block';
    }
  }, [editor]);

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
      (!inFocus && !isColorInputFocused) ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === '' ||
      getSelectedNodeByType(editor, CODE_BLOCK)
    ) {
      scrollRef.current && scrollRef.current.removeEventListener('scroll', onScroll);
      hideToolbarTooltips(el);
      el.removeAttribute('style');
      clearColorInput();
      return;
    }

    scrollRef.current && scrollRef.current.addEventListener('scroll', onScroll);
    setContextToolbarPosition();
  });

  useEffect(() => {
    const resetInternalDrag = () => {
      internalDragRef.current = false;
    };
    document.addEventListener('mousedown', resetInternalDrag, true);
    window.addEventListener('mouseup', resetInternalDrag);
    window.addEventListener('blur', resetInternalDrag);
    return () => {
      document.removeEventListener('mousedown', resetInternalDrag, true);
      window.removeEventListener('mouseup', resetInternalDrag);
      window.removeEventListener('blur', resetInternalDrag);
      clearColorInput();
    };
  }, [clearColorInput]);

  const onMouseDownCapture = useCallback((event) => {
    if (event.button !== 0) return;
    internalDragRef.current = true;
    onFocusCapture(event);
    const picker = event.target.closest('.sdoc-more-colors-container');
    if (picker && event.target.tagName !== 'INPUT' && picker.contains(document.activeElement)) {
      focusEditor(editor);
    }
  }, [editor, onFocusCapture]);

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
    if (isMouseLeftDown && !internalDragRef.current) {
      const el = ref.current;
      hideToolbarTooltips(el);
      el.removeAttribute('style');
    }
  }, []);

  return createPortal(
    <div
      ref={ref}
      className='sdoc-context-toolbar'
      onMouseDownCapture={onMouseDownCapture}
      onMouseDown={onMouseDown}
      onMouseOver={onMouseMove}
      onFocusCapture={onFocusCapture}
      onBlurCapture={onBlurCapture}
    >
      <MenuGroup>
        <TextStyleMenuList editor={editor} idPrefix={'sdoc_context_toolbar'} onColorPickerUnmount={onColorPickerUnmount} />
      </MenuGroup>
    </div>,
    document.body,
  );
};

ContextToolbar.propTypes = {
  isColorInputFocused: PropTypes.bool.isRequired,
  onColorInputFocusChange: PropTypes.func.isRequired,
};

export default ContextToolbar;
