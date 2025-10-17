import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, ModalBody, Input } from 'reactstrap';
import classnames from 'classnames';
import isHotkey from 'is-hotkey';
import PropTypes from 'prop-types';
import toaster from '../../../components/toast';
import { INTERNAL_EVENT } from '../../../constants';
import context from '../../../context';
import { CollaboratorsProvider } from '../../../hooks/use-collaborators';
import { getErrorMsg } from '../../../utils/common-utils';
import EventBus from '../../../utils/event-bus';
import { ELEMENT_TYPE, FILE_TYPE } from '../../constants';
import ListView from './list-view';
import TreeView from './tree-view';

import './index.css';

const SelectSdocFileDialog = ({ editor, dialogType, closeDialog, insertLinkCallback, insertVideoCallback, insertWhiteboardFile }) => {
  const { t } = useTranslation('sdoc-editor');
  const [currentSelectedFile, setCurrentSelectedFile] = useState(null);
  const [temSearchContent, setTemSearchContent] = useState('');
  const [searchContent, setSearchContent] = useState('');
  const [isOpenSearch, setIsOpenSearch] = useState(false);
  const [FileMetadataComponent, setFileMetadataComponent] = useState(null);
  const [isTreeView, setIsTreeView] = useState(true);
  const searchRef = useRef(null);
  const repoID = context.getSetting('repoID');
  const enableMetadata = context.getSetting('enableMetadata');

  let modalTitle;
  switch (dialogType) {
    case ELEMENT_TYPE.FILE_LINK:
      modalTitle = 'Select_file';
      break;
    case ELEMENT_TYPE.SDOC_LINK:
      modalTitle = 'Select_sdoc_document';
      break;
    case ELEMENT_TYPE.VIDEO:
      modalTitle = 'Select_video_file';
      break;
    case ELEMENT_TYPE.WHITEBOARD:
      modalTitle = 'Link_Excalidraw_file';
      break;
    default:
      break;
  }

  const onSelectedFile = useCallback((fileInfo) => {
    setCurrentSelectedFile(fileInfo);
  }, []);

  const insertFile = useCallback((fileInfo) => {
    const { insertFileLinkCallback, insertSdocFileLinkCallback } = insertLinkCallback || {};
    const { insertVideo } = insertVideoCallback || {};
    const { insertWhiteboard } = insertWhiteboardFile || {};
    switch (dialogType) {
      case ELEMENT_TYPE.FILE_LINK:
        insertFileLinkCallback && insertFileLinkCallback(editor, fileInfo.name, fileInfo.file_uuid);
        break;
      case ELEMENT_TYPE.SDOC_LINK:
        insertSdocFileLinkCallback && insertSdocFileLinkCallback(editor, fileInfo.name, fileInfo.file_uuid);
        break;
      case ELEMENT_TYPE.VIDEO:
        const repoID = context.getSetting('repoID');
        const fileServerRoot = context.getSetting('fileServerRoot');
        // Get seafile's video download url as src
        const url = `${fileServerRoot}repos/${repoID}/files${fileInfo.path}/?op=download`;
        const encodedUrl = encodeURI(url);
        insertVideo && insertVideo(editor, [{ name: fileInfo.name }], [encodedUrl]);
        break;
      case ELEMENT_TYPE.WHITEBOARD:
        insertWhiteboard && insertWhiteboard(editor, fileInfo.name, fileInfo.path);
        break;
      default:
        break;
    }
  }, [insertLinkCallback, insertVideoCallback, insertWhiteboardFile, dialogType, editor]);

  const onSubmit = useCallback(() => {
    if (!currentSelectedFile) return;

    const { file_uuid } = currentSelectedFile;
    let fileInfo = { ...currentSelectedFile };

    // Insert video element in sdoc
    if (dialogType === ELEMENT_TYPE.VIDEO) {
      insertFile(fileInfo);
      closeDialog();
      return;
    }

    // Insert whiteboard file in sdoc
    if (dialogType === ELEMENT_TYPE.WHITEBOARD) {
      insertFile(fileInfo);
      closeDialog();
      return;
    }

    // File has no id
    if (!file_uuid || file_uuid === '') {
      context.getSdocLocalFileId(currentSelectedFile.path).then(res => {
        if (res.status === 200) {
          fileInfo = { ...currentSelectedFile, file_uuid: res.data.file_uuid };
        }

        insertFile(fileInfo);
        closeDialog();
      }).catch(error => {
        const errorMessage = getErrorMsg(error);
        toaster.danger(errorMessage);
      });
      return;
    }

    insertFile(fileInfo);
    closeDialog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSelectedFile]);

  const handleSearchInputChange = useCallback((e) => {
    const keyword = e.target.value.toLowerCase();
    setTemSearchContent(keyword);
  }, []);

  const executeSearch = useCallback(() => {
    if (!temSearchContent.trim()) {
      setSearchContent('');
      setIsOpenSearch(false);
      return;
    }

    setCurrentSelectedFile(null);
    setSearchContent(temSearchContent);
    setIsOpenSearch(true);
  }, [temSearchContent]);

  const handleInputKeyDown = useCallback((e) => {
    if (isHotkey('enter', e)) {
      e.preventDefault();
      executeSearch();
    }

    if (isHotkey('escape', e)) {
      e.preventDefault();
      e.stopPropagation();

      const el = searchRef.current;
      if (!el) return;
      el && el.blur();
      el && (el.value = '');

      setSearchContent('');
      setIsOpenSearch(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [executeSearch, isOpenSearch]);

  useEffect(() => {
    if (!isOpenSearch) {
      setSearchContent('');

      const el = searchRef.current;
      el && (el.value = '');
    }
  }, [isOpenSearch]);

  const dirent = useMemo(() => {
    return {
      name: currentSelectedFile?.name,
      type: currentSelectedFile ? 'file' : 'dir',
      isLib: currentSelectedFile?.path === '/',
      file_tags: [],
      path: currentSelectedFile?.path
    };
  }, [currentSelectedFile]);

  useEffect(() => {
    if (!repoID || !currentSelectedFile) return;
    const eventBus = EventBus.getInstance();
    eventBus.dispatch(INTERNAL_EVENT.FILE_METADATA_COMPONENT, (component) => {
      setFileMetadataComponent(() => component);
    });
  }, [repoID, currentSelectedFile, dirent]);

  const onClickTreeView = useCallback(() => {
    setIsTreeView(true);
    setIsOpenSearch(false);
    setSearchContent('');
    setCurrentSelectedFile(null);
  }, []);

  const onClickListView = useCallback(() => {
    setIsTreeView(false);
    setIsOpenSearch(false);
    setSearchContent('');
    setCurrentSelectedFile(null);
  }, []);

  return (
    <Modal isOpen={true} autoFocus={true} zIndex={1071} returnFocusAfterClose={false} className="sdoc-file-select-dialog" contentClassName="sdoc-file-select-modal" toggle={closeDialog}>
      <div className='modal-header-container'>
        <h5 className='modal-title-container'>{t(modalTitle)}</h5>
        <div className='modal-operation-container'>
          {enableMetadata &&
            <div className='sdoc-toggle-view'>
              <div className={classnames('sdocfont sdoc-tree-view', { 'active': isTreeView })} onClick={onClickTreeView} />
              <div className={classnames('sdocfont sdoc-list-ul sdoc-list-view', { 'active': !isTreeView })} onClick={onClickListView} />
            </div>
          }
          <div className='sdocfont sdoc-close1 sdoc-close-dialog' onClick={closeDialog}></div>
        </div>
      </div>
      <ModalBody className='p-0'>
        <div className='sdoc-file-select-container'>
          <div className='sdoc-file-select-wrapper'>
            <div className={classnames('sdoc-file-left-panel', { 'with-right-metadata-panel': currentSelectedFile })}>
              <div className='sdoc-files-search-popover-container'>
                <div className='sdoc-search-wrapper'>
                  <div className='sdocfont sdoc-find-replace sdoc-search'></div>
                  <Input innerRef={searchRef} className='sdoc-search-input' onKeyUp={handleInputKeyDown} onChange={handleSearchInputChange} id='sdoc-search' placeholder={t('Search')} />
                </div>
              </div>
              {isTreeView ? <TreeView fileType={FILE_TYPE[dialogType]} onSelectedFile={onSelectedFile} toggle={closeDialog} searchContent={searchContent} isOpenSearch={isOpenSearch} />
                : <ListView fileType={FILE_TYPE[dialogType]} onSelectedFile={onSelectedFile} searchContent={searchContent} isOpenSearch={isOpenSearch} />
              }
            </div>
            {FileMetadataComponent && repoID && currentSelectedFile && (
              <div className='sdoc-file-metadata-wrapper'>
                <CollaboratorsProvider repoID={repoID}>
                  <FileMetadataComponent repoID={repoID} path={currentSelectedFile?.path} dirent={dirent} />
                </CollaboratorsProvider>
              </div>
            )}
          </div>
          <div className='sdoc-file-select-footer'>
            <Button color='secondary' className='mr-2' onClick={closeDialog}>{t('Cancel')}</Button>
            <Button color='primary' className='highlight-bg-color' disabled={!currentSelectedFile} onClick={onSubmit}>{t('Submit')}</Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

SelectSdocFileDialog.propTypes = {
  editor: PropTypes.object,
  closeDialog: PropTypes.func,
};

export default SelectSdocFileDialog;
