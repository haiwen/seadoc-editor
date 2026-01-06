import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor, Node } from '@seafile/slate';
import { ReactEditor } from '@seafile/slate-react';
import classNames from 'classnames';
import throttle from 'lodash.throttle';
import { INTERNAL_EVENT } from '../../../constants';
import { getMaximumCapacity, getLocalStorageFiles } from '../../../utils/common-utils';
import EventBus from '../../../utils/event-bus';
import LocalStorage from '../../../utils/local-storage-utils';
import { insertTextWhenRemoveFileNameCollector, removeTempInput } from '../../plugins/sdoc-link/helpers';
import { insertWikiPageLink } from '../../plugins/wiki-link/helpers';

import './style.css';

const WikiFileLinkInsertDialog = ({ editor, element, closeDialog }) => {
  const { t } = useTranslation('sdoc-editor');
  const eventBus = EventBus.getInstance();
  const fileLinkInsertRef = useRef(null);
  const historyFileWrapperRef = useRef(document.querySelector('.sdoc-history-files-wrapper'));
  const [files, setFiles] = useState([]);
  const [position, setPosition] = useState({});
  const [newFileName, setNewFileName] = useState('');
  const [header, setHeader] = useState(t('Link_to_page'));
  const [hiddenMoreMenu, setHiddenMoreMenu] = useState(false);

  const deleteInputAndInsertText = useCallback((...args) =>
    insertTextWhenRemoveFileNameCollector(editor, element, ...args)
  , [editor, element]);

  const getPosition = useCallback(() => {
    queueMicrotask(() => {
      const { selection } = editor;
      const nodeEntry = Editor.node(editor, selection);
      const domNode = ReactEditor.toDOMNode(editor, nodeEntry[0]);
      if (domNode) {
        const topGap = 20;
        const leftGap = 16;
        const outlineWidth = 300;
        const { top: domNodeTop, left: domNodeLeft } = domNode.getBoundingClientRect();
        let popoverTop = domNodeTop - topGap;
        let popoverLeft = domNodeLeft - leftGap - outlineWidth;

        const { height } = fileLinkInsertRef.current.getBoundingClientRect();
        const popoverBottomY = popoverTop + height;
        const viewportHeight = window.innerHeight;

        // Prevent to hidden popover after flipping
        const flipTop = domNodeTop - height - topGap;
        const isFlipSafe = flipTop >= 8;
        if (popoverBottomY > viewportHeight && isFlipSafe) {
          // 8px for the gap between the popover and the bottom of the viewport
          const counterTopGap = 8;
          popoverTop = popoverTop - height - topGap - counterTopGap;
        }

        setPosition({ top: popoverTop, left: popoverLeft });
      }
    });
  }, [editor]);

  const onClick = useCallback((e) => {
    const isClickInside = historyFileWrapperRef.current?.contains?.(e.target);
    if (isClickInside) return;

    // Click on the insertion position without closing
    const insertCollectorEl = document.querySelector('.sdoc-file-name-insert-collector');
    if (insertCollectorEl && insertCollectorEl.className === e.target.className) return;

    deleteInputAndInsertText();
    closeDialog();
  }, [closeDialog, deleteInputAndInsertText]);

  const onScroll = throttle(() => {
    getPosition();
  }, 100);

  const getHistoryFiles = useCallback((isCalculatedByFiles) => {
    let files = getLocalStorageFiles(LocalStorage.getItem('wiki-recent-files') || []);
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
    getHistoryFiles(true);
    getPosition();
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
  }, [closeDialog, editor, eventBus, files, getPosition, onClick, onKeydown, onScroll]);

  const onSearch = useCallback((searchText) => {
    if (searchText.trim().length === 0) {
      getHistoryFiles();
      setHiddenMoreMenu(true);
      setHeader(t('Link_to_page'));
      setNewFileName('');
      getPosition();
      return;
    }

    const { navConfig } = window.wiki.config;
    const { pages } = navConfig;
    const newFiles = [];
    pages.forEach((page) => {
      if (page.name.includes(searchText.trim())) {
        newFiles.push(page);
      }
    });
    // No results found
    if (newFiles.length === 0) {
      setHeader(t('No_page_results'));
      setNewFileName(searchText);
    } else {
      setHeader(t('Link_to_page'));
      setNewFileName('');
    }

    setHiddenMoreMenu(true);
    setFiles(newFiles);
    getPosition();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    const { name, wikiRepoId, pageId, icon, isDir } = fileInfo;
    removeTempInput(editor, element);
    closeDialog();
    insertWikiPageLink(editor, name, wikiRepoId, pageId, icon, isDir);
  }, [closeDialog, editor, element]);

  const onShowMoreWiki = useCallback((e) => {
    e.stopPropagation();
    const recentFiles = getLocalStorageFiles(LocalStorage.getItem('wiki-recent-files') || []);
    setFiles(recentFiles);
    setHiddenMoreMenu(true);
  }, []);

  const createWikiLink = ({ pageId, pageName, wikiRepoId }) => {
    insertWikiPageLink(editor, pageName, wikiRepoId, pageId);
  };

  const onCreateFile = useCallback((e) => {
    e.stopPropagation();
    removeTempInput(editor, element);
    const eventBus = EventBus.getInstance();
    const unsubscribe = eventBus.subscribe(INTERNAL_EVENT.WIKI_PAGE_ID_CREATED, (payload) => {
      createWikiLink(payload);
      unsubscribe();
    });
    const createName = newFileName.trim() || t('New_page');
    eventBus.dispatch(INTERNAL_EVENT.CREATE_WIKI_PAGE, { newFileName: createName });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, element, newFileName, t]);

  const createFileTipDefault = useMemo(() => {
    return 'New_page';
  }, []);

  const createFileName = useMemo(() => {
    return `"${newFileName}" ${t('Page')}`;
  }, [newFileName, t]);

  return (
    <div
      ref={fileLinkInsertRef}
      className={classNames('wiki-history-files-content popover')}
      style={{ ...position, position: 'absolute', opacity: Object.keys(position).length ? 1 : 0 }}
    >
      {header.length !== 0 && (<div className='wiki-history-files-header'>{header}</div>)}
      <div className={classNames('sdoc-history-files', { 'no-header': header.length === 0 })}>
        {files.map((item) => {
          return (
            <div
              key={item.doc_uuid}
              className={classNames('sdoc-history-files-item', { 'files-item-has-dir': item?.path })}
              onClick={() => {
                onSelect(item);
              }}
            >
              {item?.icon && (
                <span className='file-item-emoticons'>{item.icon}</span>
              )}
              {!item?.icon && (
                <>
                  {item?.isDir ? <span className='file-item-icon sf3-font sf3-font-files2'/> : <span className='file-item-icon sf3-font sf3-font-file'/>}
                </>
              )}
              <span className='file-item-name-wrapper'>
                <span className='file-item-name'>{item.name}</span>
                {item?.path && <span className='name-dir'>{item.path}</span>}
              </span>
            </div>
          );
        })}
        {!hiddenMoreMenu && <div className='sdoc-history-files-item' onClick={onShowMoreWiki}>...{t('More')}</div>}
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

export default WikiFileLinkInsertDialog;
