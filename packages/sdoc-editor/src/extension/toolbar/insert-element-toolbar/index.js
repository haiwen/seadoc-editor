import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { Input } from 'reactstrap';
import { Transforms } from '@seafile/slate';
import { useSlateStatic } from '@seafile/slate-react';
import PropTypes from 'prop-types';
import { INTERNAL_EVENT, KeyCodes } from '../../../constants';
import { isMobile } from '../../../utils/common-utils';
import EventBus from '../../../utils/event-bus';
import DropdownMenuItem from '../../commons/dropdown-menu-item';
import { ELEMENT_TYPE, IMAGE, VIDEO, INSERT_POSITION, LINK, LOCAL_IMAGE, LOCAL_VIDEO, PARAGRAPH, SIDE_INSERT_MENUS_CONFIG, SIDE_QUICK_INSERT_MENUS_SEARCH_MAP, TABLE, CODE_BLOCK, CALL_OUT, UNORDERED_LIST, ORDERED_LIST, CHECK_LIST_ITEM, QUICK_INSERT } from '../../constants';
import { getAboveBlockNode } from '../../core';
import { wrapCallout } from '../../plugins/callout/helper';
import { setCheckListItemType } from '../../plugins/check-list/helpers';
import { changeToCodeBlock } from '../../plugins/code-block/helpers';
import { toggleList } from '../../plugins/list/transforms';
import { insertMultiColumn } from '../../plugins/multi-column/helper';
import { insertTable } from '../../plugins/table/helpers';
import TableSizePopover from '../../plugins/table/popover/table-size-popover';
import { onHandleOverflowScroll } from '../../utils';
import { insertElement, getSearchedOperations } from '../side-toolbar/helpers';
import { SELECTED_ITEM_CLASS_NAME } from './const';

import './style.css';

const QuickInsertBlockMenu = ({
  insertPosition = INSERT_POSITION.CURRENT,
  slateNode,
  callback,
  isEmptyNode,
  handleClosePopover,
  t
}) => {
  const editor = useSlateStatic();
  const tableSizeRef = useRef(null);
  const inputWrapperRef = useRef(null);
  const downDownWrapperRef = useRef(null);
  const [currentSelectIndex, setCurrentSelectIndex] = useState(-1); // -1 is input focus position
  const [quickInsertMenuSearchMap, setQuickInsertMenuSearchMap] = useState(SIDE_QUICK_INSERT_MENUS_SEARCH_MAP);

  const onInsertImageToggle = useCallback(() => {
    callback && callback();
    const eventBus = EventBus.getInstance();
    if (insertPosition === INSERT_POSITION.CURRENT) {
      Transforms.select(editor, editor.selection.focus);
    }
    eventBus.dispatch(INTERNAL_EVENT.INSERT_ELEMENT, { type: LOCAL_IMAGE, insertPosition, slateNode });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, insertPosition]);

  const onInsertVideoToggle = useCallback(() => {
    callback && callback();
    const eventBus = EventBus.getInstance();
    if (insertPosition === INSERT_POSITION.CURRENT) {
      Transforms.select(editor, editor.selection.focus);
    }
    eventBus.dispatch(INTERNAL_EVENT.INSERT_ELEMENT, { type: LOCAL_VIDEO, insertPosition, slateNode });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, insertPosition]);

  const createTable = useCallback((size) => {
    callback && callback();
    const newInsertPosition = slateNode.type === ELEMENT_TYPE.LIST_ITEM ? INSERT_POSITION.AFTER : insertPosition;
    insertTable(editor, size, editor.selection, newInsertPosition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, insertPosition, slateNode]);

  const openLinkDialog = useCallback(() => {
    callback && callback();
    const eventBus = EventBus.getInstance();
    eventBus.dispatch(INTERNAL_EVENT.INSERT_ELEMENT, { type: ELEMENT_TYPE.LINK, insertPosition, slateNode });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insertPosition]);

  const onInsertCodeBlock = useCallback(() => {
    callback && callback();
    const newInsertPosition = slateNode.type === ELEMENT_TYPE.LIST_ITEM ? INSERT_POSITION.AFTER : insertPosition;
    changeToCodeBlock(editor, 'plaintext', newInsertPosition, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, insertPosition, slateNode]);

  const onInsertList = useCallback((type) => {
    callback && callback();
    toggleList(editor, type, insertPosition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, insertPosition, slateNode]);

  const onInsertCheckList = useCallback(() => {
    callback && callback();
    setCheckListItemType(editor, ELEMENT_TYPE.CHECK_LIST_ITEM, insertPosition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, insertPosition, slateNode]);

  const onInsert = useCallback((type) => {
    callback && callback();
    insertElement(editor, type, insertPosition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, insertPosition, slateNode]);

  const onInsertCallout = useCallback((type) => {
    callback && callback();
    if (insertPosition === INSERT_POSITION.CURRENT) {
      wrapCallout(editor);
      Transforms.removeNodes(editor, { match: n => n.type === QUICK_INSERT });
    } else if (insertPosition === INSERT_POSITION.AFTER) {
      insertElement(editor, type, insertPosition);
      wrapCallout(editor);
    }
  }, [callback, editor, insertPosition]);

  const isDisableCallout = useMemo(() => {
    const callout = getAboveBlockNode(editor, { match: n => n.type === ELEMENT_TYPE.CALL_OUT });
    return !!callout;
  }, [editor]);

  // Disable images in list elements
  const isDisableImage = useMemo(() => {
    const callout = getAboveBlockNode(editor, { match: n => [ELEMENT_TYPE.ORDERED_LIST, ELEMENT_TYPE.UNORDERED_LIST, ELEMENT_TYPE.CHECK_LIST_ITEM].includes(n.type) });
    return !!callout;
  }, [editor]);

  const isDisableVideo = useMemo(() => {
    const callout = getAboveBlockNode(editor, { match: n => [ELEMENT_TYPE.ORDERED_LIST, ELEMENT_TYPE.UNORDERED_LIST, ELEMENT_TYPE.CHECK_LIST_ITEM, ELEMENT_TYPE.MULTI_COLUMN].includes(n.type) });
    return !!callout;
  }, [editor]);

  const isDisableTable = useMemo(() => {
    const callout = getAboveBlockNode(editor, { match: n => [ELEMENT_TYPE.ORDERED_LIST, ELEMENT_TYPE.UNORDERED_LIST, ELEMENT_TYPE.CHECK_LIST_ITEM, ELEMENT_TYPE.MULTI_COLUMN, ELEMENT_TYPE.BLOCKQUOTE, ELEMENT_TYPE.CALL_OUT].includes(n.type) });
    return !!callout;
  }, [editor]);

  const isDisableMultiColumn = useMemo(() => {
    const callout = getAboveBlockNode(editor, { match: n => [ELEMENT_TYPE.ORDERED_LIST, ELEMENT_TYPE.UNORDERED_LIST, ELEMENT_TYPE.CHECK_LIST_ITEM, ELEMENT_TYPE.MULTI_COLUMN, ELEMENT_TYPE.BLOCKQUOTE, ELEMENT_TYPE.CALL_OUT].includes(n.type) });
    return !!callout;
  }, [editor]);

  const isDisableCodeBlock = useMemo(() => {
    const callout = getAboveBlockNode(editor, { match: n => [ELEMENT_TYPE.MULTI_COLUMN].includes(n.type) });
    return !!callout;
  }, [editor]);

  const createMultiColumn = useCallback((type) => {
    callback && callback();
    const newInsertPosition = slateNode.type === ELEMENT_TYPE.LIST_ITEM ? INSERT_POSITION.AFTER : insertPosition;
    insertMultiColumn(editor, editor.selection, newInsertPosition, type);
  }, [callback, editor, insertPosition, slateNode]);

  const dropDownItems = useMemo(() => {
    let items = {
      [IMAGE]: <DropdownMenuItem isHidden={!quickInsertMenuSearchMap[IMAGE]} disabled={isDisableImage} key="sdoc-insert-menu-image" menuConfig={{ ...SIDE_INSERT_MENUS_CONFIG[ELEMENT_TYPE.IMAGE] }} onClick={onInsertImageToggle} />,
      [VIDEO]: <DropdownMenuItem isHidden={!quickInsertMenuSearchMap[VIDEO]} disabled={isDisableVideo} key="sdoc-insert-menu-video" menuConfig={{ ...SIDE_INSERT_MENUS_CONFIG[ELEMENT_TYPE.VIDEO] }} onClick={onInsertVideoToggle} />,
      [TABLE]:
        // eslint-disable-next-line react/jsx-indent
        <DropdownMenuItem isHidden={!quickInsertMenuSearchMap[TABLE]} disabled={isDisableTable} key="sdoc-insert-menu-table" menuConfig={{ ...SIDE_INSERT_MENUS_CONFIG[ELEMENT_TYPE.TABLE] }} className="pr-2">
          <i className="sdocfont sdoc-right-slide sdoc-dropdown-item-right-icon"></i>
          <TableSizePopover
            tableSizeRef={tableSizeRef}
            editor={editor}
            target='sdoc-side-menu-item-table'
            trigger='hover'
            placement='left-start'
            popperClassName='sdoc-side-menu-table-size sdoc-insert-element-table-size-wrapper'
            createTable={createTable}
            callback={callback}
            handleClosePopover={handleClosePopover}
          />
        </DropdownMenuItem>,
      [LINK]: <DropdownMenuItem isHidden={!quickInsertMenuSearchMap[LINK]} key="sdoc-insert-menu-link" menuConfig={{ ...SIDE_INSERT_MENUS_CONFIG[ELEMENT_TYPE.LINK] }} onClick={openLinkDialog} />,
      [CODE_BLOCK]: <DropdownMenuItem isHidden={!quickInsertMenuSearchMap[CODE_BLOCK]} disabled={isDisableCodeBlock} key="sdoc-insert-menu-code-block" menuConfig={{ ...SIDE_INSERT_MENUS_CONFIG[ELEMENT_TYPE.CODE_BLOCK] }} onClick={onInsertCodeBlock} />,
      [CALL_OUT]: <DropdownMenuItem isHidden={!quickInsertMenuSearchMap[CALL_OUT]} disabled={isDisableCallout} key="sdoc-insert-menu-callout" menuConfig={{ ...SIDE_INSERT_MENUS_CONFIG[ELEMENT_TYPE.CALL_OUT] }} onClick={() => onInsertCallout(PARAGRAPH)} />,
      [UNORDERED_LIST]: <DropdownMenuItem isHidden={!quickInsertMenuSearchMap[UNORDERED_LIST]} key="sdoc-insert-menu-unorder-list" menuConfig={{ ...SIDE_INSERT_MENUS_CONFIG[ELEMENT_TYPE.UNORDERED_LIST] }} onClick={() => {
        onInsertList(ELEMENT_TYPE.UNORDERED_LIST);
      }} />,
      [ORDERED_LIST]: <DropdownMenuItem isHidden={!quickInsertMenuSearchMap[ORDERED_LIST]} key="sdoc-insert-menu-order-list" menuConfig={{ ...SIDE_INSERT_MENUS_CONFIG[ELEMENT_TYPE.ORDERED_LIST] }} onClick={() => {
        onInsertList(ELEMENT_TYPE.ORDERED_LIST);
      }} />,
      [CHECK_LIST_ITEM]: <DropdownMenuItem isHidden={!quickInsertMenuSearchMap[CHECK_LIST_ITEM]} key="sdoc-insert-menu-check-list" menuConfig={{ ...SIDE_INSERT_MENUS_CONFIG[ELEMENT_TYPE.CHECK_LIST_ITEM] }} onClick={onInsertCheckList} />,
      [PARAGRAPH]: <DropdownMenuItem isHidden={!quickInsertMenuSearchMap[PARAGRAPH]} disabled={isEmptyNode} key="sdoc-insert-menu-paragraph" menuConfig={{ ...SIDE_INSERT_MENUS_CONFIG[ELEMENT_TYPE.PARAGRAPH] }} onClick={() => onInsert(ELEMENT_TYPE.PARAGRAPH)} />,
    };

    if (isMobile) {
      items = {
        [UNORDERED_LIST]: <DropdownMenuItem isHidden={!quickInsertMenuSearchMap[UNORDERED_LIST]} key="sdoc-insert-menu-unorder-list" menuConfig={{ ...SIDE_INSERT_MENUS_CONFIG[ELEMENT_TYPE.UNORDERED_LIST] }} onClick={() => {
          onInsertList(ELEMENT_TYPE.UNORDERED_LIST);
        }} />,
        [ORDERED_LIST]: <DropdownMenuItem isHidden={!quickInsertMenuSearchMap[ORDERED_LIST]} key="sdoc-insert-menu-order-list" menuConfig={{ ...SIDE_INSERT_MENUS_CONFIG[ELEMENT_TYPE.ORDERED_LIST] }} onClick={() => {
          onInsertList(ELEMENT_TYPE.ORDERED_LIST);
        }} />,
        [CHECK_LIST_ITEM]: <DropdownMenuItem isHidden={!quickInsertMenuSearchMap[CHECK_LIST_ITEM]} key="sdoc-insert-menu-check-list" menuConfig={{ ...SIDE_INSERT_MENUS_CONFIG[ELEMENT_TYPE.CHECK_LIST_ITEM] }} onClick={onInsertCheckList} />,
        [PARAGRAPH]: <DropdownMenuItem isHidden={!quickInsertMenuSearchMap[PARAGRAPH]} disabled={isEmptyNode} key="sdoc-insert-menu-paragraph" menuConfig={{ ...SIDE_INSERT_MENUS_CONFIG[ELEMENT_TYPE.PARAGRAPH] }} onClick={() => onInsert(ELEMENT_TYPE.PARAGRAPH)} />,
      };
    }

    SIDE_INSERT_MENUS_CONFIG[ELEMENT_TYPE.HEADER].forEach((item) => {
      items[item.id.toLowerCase()] = <DropdownMenuItem isHidden={!quickInsertMenuSearchMap[item.type]} key={item.id} menuConfig={item} onClick={() => onInsert(item.type)} />;
    });

    !isMobile && SIDE_INSERT_MENUS_CONFIG[ELEMENT_TYPE.MULTI_COLUMN].forEach((item) => {
      items[item.id.toLowerCase()] = <DropdownMenuItem isHidden={!quickInsertMenuSearchMap[item.type]} disabled={isDisableMultiColumn} className="sdoc-insert-menu-multi-column" key={item.id} menuConfig={item} onClick={() => createMultiColumn(item.type)} />;
    });

    return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quickInsertMenuSearchMap, isDisableImage, onInsertImageToggle, isDisableVideo, isDisableMultiColumn, onInsertVideoToggle, isDisableTable, editor, createTable, callback, handleClosePopover, openLinkDialog, onInsertCodeBlock, isDisableCallout, onInsertCheckList, isEmptyNode, onInsertCallout, onInsertList, onInsert, createMultiColumn]);

  const getSelectItemDom = (selectIndex) => {
    const dropDownItemWrapper = downDownWrapperRef.current;
    const searchedDropDownItemWrapper = [];
    Array.from(dropDownItemWrapper.children).forEach((item) => {
      if (!Array.from(item.classList).includes('sdoc-dropdown-menu-item-hidden')) {
        searchedDropDownItemWrapper.push(item);
      }
    });
    const currentSelectItem = searchedDropDownItemWrapper[selectIndex];
    return currentSelectItem;
  };

  const handleKeyDown = useCallback((e) => {
    if (document.getElementsByClassName('sdoc-selected-table-size-popover')[0]) {
      tableSizeRef.current.handleTableSizeKeyDown(e);
      return;
    }

    const { UpArrow, DownArrow, Enter, Esc } = KeyCodes;
    const renderItems = [];
    Reflect.ownKeys(dropDownItems).forEach((key) => {
      if (quickInsertMenuSearchMap[key]) renderItems.push(key);
    });
    const { keyCode } = e;

    if (keyCode === UpArrow) {
      e.preventDefault();
      const currentSelectItem = getSelectItemDom(currentSelectIndex);
      if (currentSelectItem) currentSelectItem.classList.remove(SELECTED_ITEM_CLASS_NAME);
      if (currentSelectIndex > -1) {
        setCurrentSelectIndex(currentSelectIndex - 1);
      }
    }

    if (keyCode === DownArrow) {
      e.preventDefault();
      if (currentSelectIndex === renderItems.length - 1) return;
      const currentSelectItem = getSelectItemDom(currentSelectIndex);
      if (currentSelectItem) currentSelectItem.classList.remove(SELECTED_ITEM_CLASS_NAME);
      if (currentSelectIndex < renderItems.length - 1) {
        setCurrentSelectIndex(currentSelectIndex + 1);
      }
    }

    if (keyCode === Enter) {
      e.preventDefault();
      if (currentSelectIndex === -1) return;
      const item = renderItems[currentSelectIndex];
      if (item === TABLE) {
        tableSizeRef.current.uncontrolledPopoverRef.current.toggle();
        return;
      }
      if (dropDownItems[item]) {
        const { disabled, onClick } = dropDownItems[item].props;
        !disabled && onClick();
      }
    }

    if (keyCode === Esc) {
      e.preventDefault();
      handleClosePopover();
    }
  }, [currentSelectIndex, dropDownItems, handleClosePopover, quickInsertMenuSearchMap]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleKeyDown]);

  const clearSelectStyle = useCallback(() => {
    const domList = Array.from(downDownWrapperRef.current.children);
    domList.forEach((dom) => dom.classList.remove(SELECTED_ITEM_CLASS_NAME));
  }, []);

  const onHandleInputFocus = useCallback((isFocus) => {
    if (inputWrapperRef.current) {
      queueMicrotask(() => {
        isFocus ? inputWrapperRef.current.focus() : inputWrapperRef.current.blur();
      });
    }
  }, []);

  useEffect(() => {
    if (currentSelectIndex === -1) {
      onHandleInputFocus(true);
    } else {
      onHandleInputFocus(false);
      clearSelectStyle();
      const currentSelectItem = getSelectItemDom(currentSelectIndex);
      if (currentSelectItem) {
        onHandleOverflowScroll(currentSelectItem, downDownWrapperRef);
        currentSelectItem.classList.add(SELECTED_ITEM_CLASS_NAME);
      }
    }
  }, [clearSelectStyle, currentSelectIndex, downDownWrapperRef, onHandleInputFocus]);

  const onChange = useCallback((e) => {
    if (!downDownWrapperRef.current.isInputtingChinese) {
      const newMenuSearchMap = getSearchedOperations(SIDE_QUICK_INSERT_MENUS_SEARCH_MAP, true, e, t, editor);
      setQuickInsertMenuSearchMap(newMenuSearchMap);
    }
  }, [editor, t]);

  const onCompositionStart = useCallback(() => {
    downDownWrapperRef.current.isInputtingChinese = true;
  }, []);

  const onCompositionEnd = useCallback((e) => {
    downDownWrapperRef.current.isInputtingChinese = false;
    onChange(e);
  }, [onChange]);

  return (
    <div className='sdoc-insert-element-toolbar'>
      <div className='sdoc-side-menu-search-wrapper'>
        <Input
          innerRef={inputWrapperRef}
          placeholder={t('Search_action')}
          onChange={onChange}
          onCompositionStart={onCompositionStart}
          onCompositionEnd={onCompositionEnd}
        />
      </div>
      <div className='sdoc-insert-element-content-wrapper' ref={downDownWrapperRef}>
        {Object.keys(dropDownItems).map((key) => {
          return dropDownItems[key];
        })}
        {Object.keys(quickInsertMenuSearchMap).length === 0 && (
          <div className='sdoc-dropdown-menu-item-no-results'>{t('No_results')}</div>
        )}
      </div>
    </div>
  );

};

QuickInsertBlockMenu.propTypes = {
  slateNode: PropTypes.object,
  insertPosition: PropTypes.string,
};

export default withTranslation('sdoc-editor')(QuickInsertBlockMenu);
