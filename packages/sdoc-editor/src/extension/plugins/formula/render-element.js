import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Transforms } from '@seafile/slate';
import { ReactEditor, useReadOnly, useSelected } from '@seafile/slate-react';
import { INTERNAL_EVENT } from '../../../constants';
import { useScrollContext } from '../../../hooks/use-scroll-context';
import EventBus from '../../../utils/event-bus';
import { focusEditor } from '../../core';
import FormulaHoverMenu from './hover-menu';

import './formula.css';

const Formula = ({ attributes, element, children, editor }) => {
  const readOnly = useReadOnly();
  const isSelected = useSelected();
  const scrollRef = useScrollContext();
  const formulaContainerRef = useRef(null);
  // const [mathJaxReady, setMathJaxReady] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: '', left: '' });
  const [showHoverMenu, setShowHoverMenu] = useState(false);
  const formulaBlockRef = useRef(null);

  const setPosition = useCallback((elem) => {
    if (readOnly) return;
    if (elem) {
      const { top, left } = elem.getBoundingClientRect();
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

  const handleClick = useCallback((e) => {
    if (showHoverMenu) {
      e.stopPropagation();
    } else {
      formulaBlockRef.current && setPosition(formulaBlockRef.current);
      setShowHoverMenu(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDeleteFormula = useCallback(() => {
    const path = ReactEditor.findPath(editor, element);
    Transforms.removeNodes(editor, { at: path });
    focusEditor(editor);
    Transforms.select(editor, editor.selection);
  }, [editor, element]);

  const toggleFormulaEditor = useCallback(() => {
    const eventBus = EventBus.getInstance();
    eventBus.dispatch(INTERNAL_EVENT.ON_OPEN_FORMULA_DIALOG, { element, editor });
  }, [element, editor]);

  const onHideInsertHoverMenu = useCallback((e) => {
    setShowHoverMenu(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onScroll = useCallback((e) => {
    if (!formulaBlockRef.current) return;
    setPosition(formulaBlockRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let observerRefValue = null;
    let resizeObserver = null;

    if (showHoverMenu) {
      scrollRef.current && scrollRef.current.addEventListener('scroll', onScroll);
      observerRefValue = scrollRef.current;

      resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          if (resizeObserver) {
            onScroll();
          }
        }
      });

      resizeObserver.observe(scrollRef.current);
    } else {
      scrollRef.current && scrollRef.current.removeEventListener('scroll', onScroll);
    }
    return () => {
      if (observerRefValue) {
        observerRefValue.removeEventListener('scroll', onScroll);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showHoverMenu]);

  useEffect(() => {
    const { formula = '' } = element.data || {};
    if (!formula) return;
    if (typeof window.MathJax.tex2svg !== 'function') return;
    if (formulaContainerRef.current && window.MathJax) {
      const domHtml = window.MathJax.tex2svg(formula).outerHTML;
      formulaContainerRef.current.innerHTML = domHtml;
    }
  }, [element]);

  return (
    <div {...attributes} data-id={element.id} onDoubleClick={toggleFormulaEditor} onClick={handleClick} className={'sdoc-block-formula' + (isSelected ? ' sdoc-selected-formula' : '')} >
      <div ref={formulaBlockRef}>
        <div contentEditable={false} ref={formulaContainerRef}></div>
        <span contentEditable='false' suppressContentEditableWarning>{children}</span>
      </div>
      {isSelected && showHoverMenu && (
        <FormulaHoverMenu
          editor={editor}
          element={element}
          menuPosition={menuPosition}
          onDeleteFormula={onDeleteFormula}
          onEditFormula={toggleFormulaEditor}
          onHideInsertHoverMenu={onHideInsertHoverMenu}
        />
      )}
    </div>
  );
};

const renderFormula = (props, editor) => {
  return <Formula {...props} editor={editor} />;
};

export default renderFormula;
