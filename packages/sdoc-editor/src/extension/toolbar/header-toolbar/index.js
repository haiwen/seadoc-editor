import React from 'react';
import PropTypes from 'prop-types';
import useSelectionUpdate from '../../../hooks/use-selection-update';
import { isMobile } from '../../../utils/common-utils';
import { MenuGroup } from '../../commons';
import { ORDERED_LIST, TABLE_CELL, UNORDERED_LIST } from '../../constants';
import { getSelectedNodeByType } from '../../core';
import QuoteMenu from '../../plugins/blockquote/menu';
import CalloutMenu from '../../plugins/callout/menu';
import CheckListMenu from '../../plugins/check-list/menu';
import ClearFormatMenu from '../../plugins/clear-format/menu';
import Font from '../../plugins/font/menu';
import HeaderMenu from '../../plugins/header/menu';
import HistoryMenu from '../../plugins/history/history-menu';
import ListMenu from '../../plugins/list/menu';
import SearchReplaceMenu from '../../plugins/search-replace/menu';
import TextAlignMenu from '../../plugins/text-align/menu';
import TextStyleMenuList from '../../plugins/text-style/menu';
import InsertToolbar from './insert-toolbar';

const HeaderToolbar = ({ editor, readonly = false, isEdit }) => {
  useSelectionUpdate();
  const isSelectTableCell = getSelectedNodeByType(editor, TABLE_CELL);

  if (isMobile && isEdit) {
    return (
      <div className='sdoc-editor-toolbar'>
        <MenuGroup>
          <HistoryMenu editor={editor} readonly={readonly} />
        </MenuGroup>
        <HeaderMenu editor={editor} readonly={readonly} />
        {!isSelectTableCell && (
          <MenuGroup>
            <ListMenu editor={editor} type={UNORDERED_LIST} readonly={readonly} ariaLabel='unordered list' />
            <ListMenu editor={editor} type={ORDERED_LIST} readonly={readonly} ariaLabel='ordered list' />
            <CheckListMenu editor={editor} readonly={readonly} />
          </MenuGroup>
        )}
      </div>
    );
  }

  return (
    <div className='sdoc-editor-toolbar'>
      <MenuGroup>
        <HistoryMenu editor={editor} readonly={readonly} />
        <ClearFormatMenu editor={editor} readonly={readonly} />
      </MenuGroup>
      <MenuGroup>
        <InsertToolbar editor={editor} readonly={readonly} />
      </MenuGroup>
      <HeaderMenu editor={editor} readonly={readonly} />
      <MenuGroup>
        <Font editor={editor} readonly={readonly} />
        <TextStyleMenuList editor={editor} readonly={readonly} />
      </MenuGroup>
      {!isSelectTableCell && (
        <MenuGroup>
          <QuoteMenu editor={editor} readonly={readonly} />
          <ListMenu editor={editor} type={UNORDERED_LIST} readonly={readonly} ariaLabel='unordered list' />
          <ListMenu editor={editor} type={ORDERED_LIST} readonly={readonly} ariaLabel='ordered list' />
          <CheckListMenu editor={editor} readonly={readonly} />
          <TextAlignMenu editor={editor} readonly={readonly} />
          <CalloutMenu editor={editor} readonly={readonly} />
        </MenuGroup>)}
      <MenuGroup className='menu-group sdoc-editor-toolbar-right-menu'>
        <SearchReplaceMenu editor={editor} readonly={readonly} />
      </MenuGroup>
    </div>
  );
};

HeaderToolbar.propTypes = {
  readonly: PropTypes.bool,
  editor: PropTypes.object,
};

export default HeaderToolbar;
