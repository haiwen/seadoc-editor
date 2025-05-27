import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Editor, Transforms } from '@seafile/slate';
import { ReactEditor } from '@seafile/slate-react';
import { useScrollContext } from '../../../hooks/use-scroll-context';
import { ElementPopover } from '../../commons';
import InlineBugFixer from '../../commons/Inline-bug-fix-wrapper';
import { INSERT_POSITION } from '../../constants';
import { getAboveBlockNode } from '../../core';
import QuickInsertBlockMenu from '../../toolbar/insert-element-toolbar';
import { isSelectionSameWithInsert, transformToText } from './helper';

const RenderQuickInsert = ({ attributes, children, element }, editor, readonly) => {
  const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0 });
  const sideMenuRef = useRef(null);
  const scrollRef = useScrollContext();
  const insertElmRef = useRef(null);
  const aboveBlockNode = getAboveBlockNode(editor);
  const isEmptyNode = Editor.isEmpty(editor, aboveBlockNode?.[0]);
  const [isShowPopover, setIsShowPopover] = useState(isSelectionSameWithInsert(editor, element));

  const handleClick = useCallback((e) => {
    // Click the search input
    if (sideMenuRef.current.contains(e.target) && e.target.tagName === 'INPUT') return;
    if (!insertElmRef.current.contains(e.target)) {
      transformToText(editor, element);
    }
  }, [editor, element]);

  const genStyle = useCallback((top, left) => {
    const overflowY = top + sideMenuRef.current.offsetHeight - document.body.clientHeight;
    if (overflowY > 0) {
      top = top - overflowY - 10;
    }
    const overflowX = left - sideMenuRef.current.offsetWidth;
    if (overflowX < 0) {
      left = sideMenuRef.current.offsetWidth + 10;
    }
    return `top: ${top}px; left: ${left}px`;
  }, []);

  const handleInsertMenuStyle = useCallback(() => {
    const currentDom = ReactEditor.toDOMNode(editor, element);
    const { left, top } = currentDom.getBoundingClientRect();
    const style = genStyle(top, left - 10);
    setMenuStyle(style);
  }, [editor, element, genStyle]);

  const handleScroll = useCallback((e) => {
    handleInsertMenuStyle();
  }, [handleInsertMenuStyle]);

  useEffect(() => {
    if (readonly) return;
    if (!sideMenuRef.current) return;
    const scrollDom = scrollRef.current;
    handleInsertMenuStyle();
    document.addEventListener('click', handleClick);
    scrollDom.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('click', handleClick);
      scrollDom.removeEventListener('scroll', handleScroll);
    };
  }, [editor, element, handleClick, handleInsertMenuStyle, handleScroll, readonly, scrollRef]);

  const handleInsertBlock = (node) => {
    Transforms.delete(editor, { at: ReactEditor.findPath(editor, element) });
  };

  const handleClosePopover = useCallback(() => {
    setIsShowPopover(false);
  }, []);

  return (
    <span ref={insertElmRef} >
      <span {...attributes} className=''>
        <InlineBugFixer />
        <span>/{children}</span>
        <InlineBugFixer />
        {(!readonly && isShowPopover) && (
          <ElementPopover className='sdoc-side-menu-popover' style={menuStyle}>
            <div ref={sideMenuRef} className='sdoc-side-menu sdoc-dropdown-menu'>
              <QuickInsertBlockMenu
                isEmptyNode={isEmptyNode}
                insertPosition={isEmptyNode ? INSERT_POSITION.CURRENT : INSERT_POSITION.AFTER}
                slateNode={aboveBlockNode?.[0]}
                callback={handleInsertBlock}
                handleClosePopover={handleClosePopover}
              />
            </div>
          </ElementPopover>
        )}
      </span>
    </span>
  );
};

export default RenderQuickInsert;
