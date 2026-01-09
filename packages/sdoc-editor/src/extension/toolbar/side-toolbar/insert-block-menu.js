import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { UncontrolledPopover } from 'reactstrap';
import { Transforms } from '@seafile/slate';
import { useSlateStatic } from '@seafile/slate-react';
import PropTypes from 'prop-types';
import toaster from '../../../components/toast';
import { DOCUMENT_PLUGIN_EDITOR, INTERNAL_EVENT, WIKI_EDITOR } from '../../../constants';
import context from '../../../context';
import { getErrorMsg } from '../../../utils/common-utils';
import EventBus from '../../../utils/event-bus';
import DropdownMenuItem from '../../commons/dropdown-menu-item';
import { ELEMENT_TYPE, INSERT_POSITION, LOCAL_IMAGE, LOCAL_VIDEO, PARAGRAPH, SIDE_INSERT_MENUS_CONFIG, SIDE_INSERT_MENUS_SEARCH_MAP } from '../../constants';
import { wrapCallout } from '../../plugins/callout/helper';
import { setCheckListItemType } from '../../plugins/check-list/helpers';
import { changeToCodeBlock } from '../../plugins/code-block/helpers';
import { insertFileView } from '../../plugins/file-view/helpers';
import { toggleList } from '../../plugins/list/transforms';
import { insertMultiColumn } from '../../plugins/multi-column/helper';
import { insertTable } from '../../plugins/table/helpers';
import TableSizePopover from '../../plugins/table/popover/table-size-popover';
import { insertVideo } from '../../plugins/video/helpers';
import LinkRepoPopover from '../linked-repo-popover';
import { insertElement, isInMultiColumnNode } from './helpers';

const InsertBlockMenu = ({
  insertPosition = INSERT_POSITION.CURRENT,
  slateNode,
  isNodeEmpty,
  insertMenuSearchMap = SIDE_INSERT_MENUS_SEARCH_MAP
}) => {
  const editor = useSlateStatic();
  const { t } = useTranslation('sdoc-editor');

  const onInsertImageToggle = useCallback(() => {
    const eventBus = EventBus.getInstance();
    if (insertPosition === INSERT_POSITION.CURRENT) {
      Transforms.select(editor, editor.selection.focus);
    }
    eventBus.dispatch(INTERNAL_EVENT.INSERT_ELEMENT, { type: LOCAL_IMAGE, insertPosition, slateNode });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, insertPosition]);

  const onInsertVideoToggle = useCallback(() => {
    if (insertPosition === INSERT_POSITION.AFTER) {
      Transforms.select(editor, editor.selection.focus);
    }
    const eventBus = EventBus.getInstance();
    eventBus.dispatch(INTERNAL_EVENT.INSERT_ELEMENT, { type: LOCAL_VIDEO, editor, insertPosition });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, insertPosition]);

  const addVideoLink = useCallback(() => {
    if (insertPosition === INSERT_POSITION.AFTER) {
      insertElement(editor, PARAGRAPH, insertPosition);
    }
    const eventBus = EventBus.getInstance();
    eventBus.dispatch(INTERNAL_EVENT.INSERT_ELEMENT, { type: ELEMENT_TYPE.VIDEO_LINK, editor, insertPosition });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insertPosition, editor]);

  const openSelectVideoFileDialog = useCallback(() => {
    if (insertPosition === INSERT_POSITION.AFTER) {
      insertElement(editor, PARAGRAPH, insertPosition);
    }
    const eventBus = EventBus.getInstance();
    eventBus.dispatch(INTERNAL_EVENT.INSERT_ELEMENT, { type: ELEMENT_TYPE.VIDEO, insertVideo: insertVideo, insertPosition, slateNode });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insertPosition, slateNode]);

  const createTable = useCallback((size) => {
    const newInsertPosition = slateNode.type === ELEMENT_TYPE.LIST_ITEM ? INSERT_POSITION.AFTER : insertPosition;
    insertTable(editor, size, editor.selection, newInsertPosition);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, insertPosition, slateNode]);

  const openLinkDialog = useCallback(() => {
    if (insertPosition === INSERT_POSITION.AFTER) {
      Transforms.select(editor, editor.selection.focus);
    }
    const eventBus = EventBus.getInstance();
    eventBus.dispatch(INTERNAL_EVENT.INSERT_ELEMENT, { type: ELEMENT_TYPE.LINK, insertPosition, slateNode });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insertPosition, editor]);

  // const onInsertChart = useCallback(() => {
  //   const newInsertPosition = slateNode.type === ELEMENT_TYPE.LIST_ITEM ? INSERT_POSITION.AFTER : insertPosition;
  //   insertChart(editor, newInsertPosition);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [editor, insertPosition, slateNode]);

  const onInsertCodeBlock = useCallback(() => {
    const newInsertPosition = slateNode.type === ELEMENT_TYPE.LIST_ITEM ? INSERT_POSITION.AFTER : insertPosition;
    changeToCodeBlock(editor, 'plaintext', newInsertPosition);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, insertPosition, slateNode]);

  const onInsertList = useCallback((type) => {
    toggleList(editor, type, insertPosition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, insertPosition, slateNode]);

  const onInsertCheckList = useCallback(() => {
    setCheckListItemType(editor, ELEMENT_TYPE.CHECK_LIST_ITEM, insertPosition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, insertPosition, slateNode]);

  const onInsert = useCallback((type) => {
    insertElement(editor, type, insertPosition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, insertPosition, slateNode]);

  const onInsertCallout = useCallback((type) => {
    if (insertPosition === INSERT_POSITION.CURRENT) {
      wrapCallout(editor);
    } else if (insertPosition === INSERT_POSITION.AFTER) {
      insertElement(editor, type, insertPosition);
      wrapCallout(editor);
    }
  }, [editor, insertPosition]);

  const createMultiColumn = useCallback((type) => {
    const newInsertPosition = slateNode.type === ELEMENT_TYPE.LIST_ITEM ? INSERT_POSITION.AFTER : insertPosition;
    insertMultiColumn(editor, editor.selection, newInsertPosition, type);
  }, [editor, insertPosition, slateNode]);

  const onRepoClick = useCallback((item) => {
    const wikiId = context.getSetting('wikiId');
    const data = {
      wiki_id: wikiId,
      view_name: t('View_name'),
      view_type: 'table',
      link_repo_id: item.repo_id,
    };
    context.insertWikiView(data).then(res => {
      const { view } = res.data;
      const viewData = { ...data, view_id: view._id };
      insertFileView(viewData, editor, insertPosition, slateNode);
    }).catch(error => {
      const errorMessage = getErrorMsg(error);
      toaster.danger(errorMessage);
    });
  }, [editor, insertPosition, slateNode, t]);

  return (
    <>
      {[SIDE_INSERT_MENUS_CONFIG[ELEMENT_TYPE.PARAGRAPH], ...SIDE_INSERT_MENUS_CONFIG[ELEMENT_TYPE.HEADER]].map((item) => {
        return (
          <DropdownMenuItem isHidden={!insertMenuSearchMap[item.type]} disabled={isNodeEmpty && item.type === PARAGRAPH} key={item.id} menuConfig={item} onClick={() => onInsert(item.type)} />
        );
      })}
      <DropdownMenuItem isHidden={!insertMenuSearchMap[ELEMENT_TYPE.UNORDERED_LIST]} menuConfig={{ ...SIDE_INSERT_MENUS_CONFIG[ELEMENT_TYPE.UNORDERED_LIST] }} onClick={() => {
        onInsertList(ELEMENT_TYPE.UNORDERED_LIST);
      }} />
      <DropdownMenuItem isHidden={!insertMenuSearchMap[ELEMENT_TYPE.ORDERED_LIST]} menuConfig={{ ...SIDE_INSERT_MENUS_CONFIG[ELEMENT_TYPE.ORDERED_LIST] }} onClick={() => {
        onInsertList(ELEMENT_TYPE.ORDERED_LIST);
      }} />
      <DropdownMenuItem isHidden={!insertMenuSearchMap[ELEMENT_TYPE.CHECK_LIST_ITEM]} menuConfig={{ ...SIDE_INSERT_MENUS_CONFIG[ELEMENT_TYPE.CHECK_LIST_ITEM] }} onClick={onInsertCheckList} />
      {editor.editorType === WIKI_EDITOR && (
        <DropdownMenuItem isHidden={!insertMenuSearchMap[ELEMENT_TYPE.FILE_VIEW]} key="sdoc-insert-menu-file-view" menuConfig={{ ...SIDE_INSERT_MENUS_CONFIG[ELEMENT_TYPE.FILE_VIEW] }} className="pr-2">
          <i className="sdocfont sdoc-right-slide sdoc-dropdown-item-right-icon"></i>
          <LinkRepoPopover onRepoClick={onRepoClick} />
        </DropdownMenuItem>
      )}
      <DropdownMenuItem isHidden={!insertMenuSearchMap[ELEMENT_TYPE.IMAGE]} menuConfig={{ ...SIDE_INSERT_MENUS_CONFIG[ELEMENT_TYPE.IMAGE] }} onClick={onInsertImageToggle} />
      {editor.editorType !== DOCUMENT_PLUGIN_EDITOR && (
        <DropdownMenuItem isHidden={!insertMenuSearchMap[ELEMENT_TYPE.VIDEO]} key="sdoc-insert-menu-video" disabled={isInMultiColumnNode(editor, slateNode)} menuConfig={{ ...SIDE_INSERT_MENUS_CONFIG[ELEMENT_TYPE.VIDEO] }} className="pr-2">
          <i className="sdocfont sdoc-right-slide sdoc-dropdown-item-right-icon"></i>
          <UncontrolledPopover
            target='sdoc-side-menu-item-video'
            trigger="hover"
            className="sdoc-menu-popover sdoc-dropdown-menu sdoc-sub-dropdown-menu sdoc-insert-video-menu-popover"
            placement="right-start"
            hideArrow={true}
            fade={false}
          >
            <div className="sdoc-insert-video-menu-popover-container sdoc-dropdown-menu-container">
              <div className="sdoc-dropdown-menu-item" onClick={onInsertVideoToggle}>{t('Upload_local_video')}</div>
              <div className="sdoc-dropdown-menu-item" onClick={addVideoLink}>{t('Add_video_link')}</div>
              {editor.editorType !== WIKI_EDITOR && <div className="sdoc-dropdown-menu-item" onClick={openSelectVideoFileDialog}>{t('Link_video_file')}</div>}
            </div>
          </UncontrolledPopover>
        </DropdownMenuItem>
      )}
      <DropdownMenuItem isHidden={!insertMenuSearchMap[ELEMENT_TYPE.TABLE]} key="sdoc-insert-menu-table" menuConfig={{ ...SIDE_INSERT_MENUS_CONFIG[ELEMENT_TYPE.TABLE] }} className="pr-2">
        <i className="sdocfont sdoc-right-slide sdoc-dropdown-item-right-icon"></i>
        <TableSizePopover
          editor={editor}
          target='sdoc-side-menu-item-table'
          trigger='hover'
          placement='right-start'
          popperClassName='sdoc-side-menu-table-size sdoc-insert-element-table-size-wrapper'
          createTable={createTable}
        />
      </DropdownMenuItem>
      <DropdownMenuItem isHidden={!insertMenuSearchMap[ELEMENT_TYPE.LINK]} menuConfig={{ ...SIDE_INSERT_MENUS_CONFIG[ELEMENT_TYPE.LINK] }} onClick={openLinkDialog} />
      <DropdownMenuItem isHidden={!insertMenuSearchMap[ELEMENT_TYPE.CODE_BLOCK]} menuConfig={{ ...SIDE_INSERT_MENUS_CONFIG[ELEMENT_TYPE.CODE_BLOCK] }} onClick={onInsertCodeBlock} />
      <DropdownMenuItem isHidden={!insertMenuSearchMap[ELEMENT_TYPE.CALL_OUT]} menuConfig={{ ...SIDE_INSERT_MENUS_CONFIG[ELEMENT_TYPE.CALL_OUT] }} onClick={() => onInsertCallout(PARAGRAPH)} />
      {SIDE_INSERT_MENUS_CONFIG[ELEMENT_TYPE.MULTI_COLUMN].map((item) => {
        return (
          <DropdownMenuItem isHidden={!insertMenuSearchMap[item.type]} key={item.id} menuConfig={item} onClick={() => createMultiColumn(item.type)} />
        );
      })}
      {isNodeEmpty && Object.keys(insertMenuSearchMap).length === 0 && (
        <div className='sdoc-dropdown-menu-item-no-results'>{t('No_results')}</div>
      )}
    </>
  );
};

InsertBlockMenu.propTypes = {
  slateNode: PropTypes.object,
  insertPosition: PropTypes.string,
  insertMenuSearchMap: PropTypes.object,
};

export default InsertBlockMenu;

// TODO: support side menu
// <DropdownMenuItem isHidden={!insertMenuSearchMap['chart']} menuConfig={{ ...SIDE_INSERT_MENUS_CONFIG[ELEMENT_TYPE.CHART] }} onClick={onInsertChart} /> */}
// {editor.columns && <SeaTableColumnMenu isHidden={!insertMenuSearchMap['seatable_column]} editor={editor} readonly={editor.readonly} insertPosition={insertPosition} container={'sdoc-side-menu-insert-wrapper'} />}
// {editor.tables && <SeaTableTableMenu isHidden={!insertMenuSearchMap['seatable_table']} editor={editor} readonly={editor.readonly} insertPosition={insertPosition} container={'sdoc-side-menu-insert-wrapper'} />}
