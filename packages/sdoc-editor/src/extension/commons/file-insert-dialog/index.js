import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor, Node } from '@seafile/slate';
import { ReactEditor } from '@seafile/slate-react';
import classNames from 'classnames';
import toaster from '../../../components/toast';
import { INTERNAL_EVENT } from '../../../constants';
import context from '../../../context';
import { isEnglish, getMaximumCapacity } from '../../../utils/common-utils';
import debounce from '../../../utils/debounce';
import EventBus from '../../../utils/event-bus';
import LocalStorage from '../../../utils/local-storage-utils';
import { SDOC_LINK } from '../../constants';
import { insertSdocFileLink, insertTextWhenRemoveFileNameCollector, removeTempInput } from '../../plugins/sdoc-link/helpers';
import { getSdocFileIcon } from '../select-file-dialog/helpers';

import './style.css';

const FileLinkInsertDialog = ({ editor, element, closeDialog }) => {
  const { t } = useTranslation('sdoc-editor');
  const eventBus = EventBus.getInstance();
  const fileLinkInsertRef = useRef(null);
  const historyFileWrapperRef = useRef(document.querySelector('.sdoc-history-files-wrapper'));
  const [files, setFiles] = useState([]);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [newFileName, setNewFileName] = useState('');
  const [header, setHeader] = useState(t('Recent_visited'));
  const [hiddenMoreMenu, setHiddenMoreMenu] = useState(false);

  const deleteInputAndInsertText = useCallback((...args) =>
    insertTextWhenRemoveFileNameCollector(editor, element, ...args)
  , [editor, element]);

  const getPosition = useCallback((e) => {
    const { selection } = editor;
    const nodeEntry = Editor.node(editor, selection);
    const domNode = ReactEditor.toDOMNode(editor, nodeEntry[0]);
    if (domNode) {
      const topGap = 20;
      const leftGap = 5;
      const { top, left } = domNode.getBoundingClientRect();
      let popoverTop = top + topGap;
      let popoverLeft = left + leftGap;

      // Insert gap between the popover and the selected node
      // file item height 32px, header height 32px, add button height 32px, margin-top 8px, max-height 306px
      const popoverHeight = Math.min(files.length * 32 + 32 * 3 + 8, 300);
      // Insert gap between the popover and the selected node
      const popoverBottomY = top + popoverHeight + topGap;
      const viewportHeight = window.innerHeight;
      if (popoverBottomY > viewportHeight) {
        // 8px for the gap between the popover and the bottom of the viewport
        const counterTopGap = 8;
        popoverTop = top - popoverHeight - counterTopGap;
      }
      setPosition({ top: popoverTop, left: popoverLeft });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const onClick = useCallback((e) => {
    const isClickInside = historyFileWrapperRef.current?.contains?.(e.target);
    if (isClickInside) return;

    // Click on the insertion position without closing
    const insertCollectorEl = document.querySelector('.sdoc-file-name-insert-collector');
    if (insertCollectorEl && insertCollectorEl.className === e.target.className) return;

    deleteInputAndInsertText();
    closeDialog();
  }, [closeDialog, deleteInputAndInsertText]);

  const onScroll = useCallback((e) => {
    getPosition(e);
  }, [getPosition]);

  const getHistoryFiles = useCallback((isCalculatedByFiles) => {
    const getItemKey = 'sdoc-recent-files';
    let files = LocalStorage.getItem(getItemKey) || [];
    if (isCalculatedByFiles) {
      const newFiles = getMaximumCapacity(files);
      // Can accommodate all without showing more operations
      if (files.length <= newFiles.length) {
        setHiddenMoreMenu(true);
      }
      files = newFiles;
    }
    setFiles(files);
  }, []);

  useEffect(() => {
    fileLinkInsertRef.current['isFirstMount'] = true;
    getHistoryFiles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onKeydown = useCallback((e) => {
    const { key } = e;
    switch (key) {
      case 'Escape':
        deleteInputAndInsertText();
        closeDialog();
        break;
      case 'ArrowRight':
      case 'ArrowLeft':
        deleteInputAndInsertText();
        closeDialog();
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        deleteInputAndInsertText();
        closeDialog();
        break;
      default:
        break;
    }
  }, [closeDialog, deleteInputAndInsertText]);

  useEffect(() => {
    getPosition();

    const sdocScrollContainer = document.getElementById('sdoc-scroll-container');
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKeydown);
    sdocScrollContainer.addEventListener('scroll', onScroll);
    const unsubscribeCloseDialog = eventBus.subscribe(INTERNAL_EVENT.CLOSE_FILE_INSET_DIALOG, closeDialog);

    return () => {
      sdocScrollContainer.removeEventListener('scroll', onScroll);
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKeydown);
      unsubscribeCloseDialog();
    };
    // eslint-disable-next-line
  }, [closeDialog, eventBus, getPosition, onClick, onKeydown, onScroll]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onSearch = useCallback(debounce(async (searchText) => {
    // Show history files when search is empty
    if (searchText.trim().length === 0) {
      setHeader(t('Recent_visited'));
      setHiddenMoreMenu(true);
      setNewFileName('');
      getHistoryFiles();
      return;
    }

    setNewFileName(searchText);

    // Cannot be found if the search is less than three characters.
    if (isEnglish(searchText.trim()) && searchText.length < 3) {
      setFiles([]);
      setHeader(t('Enter_more_character_start_search'));
      return;
    }

    try {
      const res = await context.getSearchFilesByFilename(searchText, 1, 10, 'sdoc');
      if (res?.data?.results) {
        let newFiles = res.data.results;
        setHeader(t(newFiles.length === 0 ? 'No_results' : 'Link_to_file'));
        setHiddenMoreMenu(true);
        setFiles(newFiles);
        return;
      }
    } catch (error) {
      toaster.danger(error.message);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, 50), []);

  useEffect(() => {
    if (!element?.children) return;
    // No search on first load
    if (fileLinkInsertRef.current['isFirstMount']) {
      fileLinkInsertRef.current['isFirstMount'] = false;
      return;
    }
    const searchText = Node.string(element);
    onSearch(searchText);
  }, [element, onSearch]);

  const onSelect = useCallback((fileInfo) => {
    const { doc_uuid, name } = fileInfo;
    removeTempInput(editor, element);
    closeDialog();
    insertSdocFileLink(editor, name, doc_uuid);
  }, [closeDialog, editor, element]);

  const onShowMore = useCallback(() => {
    eventBus.dispatch(INTERNAL_EVENT.INSERT_ELEMENT, {
      type: SDOC_LINK,
      insertSdocFileLinkCallback: insertSdocFileLink,
    });
    removeTempInput(editor, element);
  }, [editor, element, eventBus]);

  const onCreateFile = useCallback((e) => {
    e.stopPropagation();
    removeTempInput(editor, element);
    const eventBus = EventBus.getInstance();
    const createName = newFileName.trim() || t('Create_a_new_file');
    const external_props = {
      insertSdocFileLink,
      editor,
      noShowDialog: true,
    };
    eventBus.dispatch(INTERNAL_EVENT.CREATE_SDOC_FILE, { newFileName: createName, ...external_props });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, element, newFileName]);

  const createFileTipDefault = useMemo(() => {
    return 'Create_a_new_file';
  }, []);

  const createFileName = useMemo(() => {
    return `${newFileName}.sdoc`;
  }, [newFileName]);

  return (
    <div
      ref={fileLinkInsertRef}
      className='sdoc-history-files-content popover'
      style={{ ...position, position: 'absolute' }}
    >
      {header.length !== 0 && (<div className='sdoc-history-files-header'>{header}</div>)}
      <div className={classNames('sdoc-history-files', { 'no-header': header.length === 0 })}>
        {files.map((item) => {
          return (
            <div
              key={item.doc_uuid}
              className='sdoc-history-files-item'
              onClick={() => {
                onSelect(item);
              }}
            >
              <img className='file-item-img' src={getSdocFileIcon()} alt='' />
              <span className='file-item-name'>{item.name}</span>
            </div>
          );
        })}
        {!hiddenMoreMenu && (
          <div className='sdoc-history-files-item' onClick={onShowMore}>
            <i className='file-item-more sdocfont sdoc-more'/>
            <span className="more-text">{t('More')}</span>
          </div>)}
      </div>
      <div className='sdoc-history-files-add' onClick={onCreateFile}>
        <i className='sdocfont sdoc-append'/>
        <span className='new-file-name'>
          {newFileName ? t('Create_file_name_sdoc', { file_name_sdoc: createFileName }) : t(createFileTipDefault)}
        </span>
      </div>
    </div>
  );
};

export default FileLinkInsertDialog;
