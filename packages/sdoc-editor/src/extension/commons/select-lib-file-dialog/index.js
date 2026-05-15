import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, ModalBody } from 'reactstrap';
import PropTypes from 'prop-types';
import iconUrl from '../../../assets/images/lib.png';
import toaster from '../../../components/toast';
import context from '../../../context';
import { getErrorMsg } from '../../../utils/common-utils';
import TreeView from './tree-view';

import './index.css';

const SelectLibFileDialog = ({ editor, dialogType, closeDialog, insertLinkCallback }) => {
  const { t } = useTranslation('sdoc-editor');
  const [currentSelectedFile, setCurrentSelectedFile] = useState(null);

  const enableRepos = useMemo(() => {
    return context.getLinkedRepos();
  }, []);

  const [currentRepoId, setCurrentRepoId] = useState(enableRepos[0]?.repo_id || '');

  const onSelectedFile = useCallback((fileInfo) => {
    setCurrentSelectedFile(fileInfo);
  }, []);

  const onSelectRepo = useCallback((repoId) => {
    if (repoId === currentRepoId) return;
    setCurrentRepoId(repoId);
    setCurrentSelectedFile(null);
  }, [currentRepoId]);

  const insertFile = useCallback((fileInfo) => {
    const { insertFileLinkCallback } = insertLinkCallback || {};
    insertFileLinkCallback && insertFileLinkCallback(editor, fileInfo.name, fileInfo.file_uuid);
  }, [insertLinkCallback, editor]);

  const onSubmit = useCallback(() => {
    if (!currentSelectedFile) return;

    const { file_uuid } = currentSelectedFile;
    let fileInfo = { ...currentSelectedFile };

    // File has no id
    if (!file_uuid || file_uuid === '') {
      context.getLinkedRepoFileId(currentRepoId, currentSelectedFile.path).then(res => {
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
  }, [closeDialog, currentRepoId, currentSelectedFile, insertFile]);

  return (
    <Modal isOpen={true} autoFocus={true} zIndex={1071} returnFocusAfterClose={false} className="sdoc-file-select-dialog" contentClassName="sdoc-file-select-modal" toggle={closeDialog}>
      <div className='modal-header-container'>
        <h5 className='modal-title-container'>{t('Select_file')}</h5>
        <div className='modal-operation-container'>
          <div className='sdocfont sdoc-sm-close sdoc-close-dialog' onClick={closeDialog}></div>
        </div>
      </div>
      <ModalBody className='p-0'>
        <div className='sdoc-file-select-container row'>
          <div className='sdoc-file-select__side-panel border-end col-12 col-md-3'>
            {enableRepos.map(repo => {
              const isActive = repo.repo_id === currentRepoId;
              return (
                <div
                  key={repo.repo_id}
                  className={`sdoc-file-select__repo-item ${isActive ? 'active' : ''}`}
                  title={repo.repo_name}
                  role='button'
                  tabIndex={0}
                  onClick={() => onSelectRepo(repo.repo_id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onSelectRepo(repo.repo_id);
                    }
                  }}
                >
                  <img className='lib-icon' src={iconUrl} width="20" alt='' />
                  <span className='sdoc-file-select__repo-name'>{repo.repo_name}</span>
                </div>
              );
            })}
          </div>
          <div className='sdoc-file-select__main-panel col-12 col-md-9'>
            {currentRepoId && (
              <TreeView
                repoID={currentRepoId}
                onSelectedFile={onSelectedFile}
                toggle={closeDialog}
              />
            )}
            <div className='sdoc-file-select-footer'>
              <Button color='secondary' className='mr-2' onClick={closeDialog}>{t('Cancel')}</Button>
              <Button color='primary' className='highlight-bg-color' disabled={!currentSelectedFile} onClick={onSubmit}>{t('Submit')}</Button>
            </div>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

SelectLibFileDialog.propTypes = {
  editor: PropTypes.object,
  closeDialog: PropTypes.func,
};

export default SelectLibFileDialog;
