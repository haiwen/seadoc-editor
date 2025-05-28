import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, ModalBody } from 'reactstrap';
import { toaster, FileLoading, context } from '@seafile/sdoc-editor';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { TIP_CONTENT, TIP_TYPE } from '../../../../../constants';
import { Revision } from '../../../../../model';
import { getErrorMsg } from '../../../../../utils';
import SdocModalHeader from '../../../../modal-header';
import TipDialog from '../../../../tip-dialog';
import RevisionOperation from './revision-operation';

import './index.css';

const RevisionsDialog = ({ updateRevisionsCount, toggle }) => {
  const revisionListRef = useRef(null);
  const { t } = useTranslation('sdoc-editor');
  const [isLoading, setLoading] = useState(true);
  const [revisions, setRevisions] = useState([]);
  const [page, setPage] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const perPage = 25;
  const repoID = context.getSetting('repoID');
  const siteRoot = context.getSetting('siteRoot');
  const [activeRevisionId, setActiveRevision] = useState('');
  const [operatingRevisionId, setOperatingRevision] = useState('');
  const [showDeleteTipDialog, setShowDeleteTipDialog] = useState(false);

  // did mount
  useEffect(() => {
    listRevisions();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const listRevisions = useCallback(() => {
    context.getSdocRevisions(page, perPage).then(res => {
      const addedRevisions = res.data.revisions.map(revision => new Revision(revision));
      setLoading(false);
      updateRevisionsCount(res.data.count);
      const newRevisions = [...revisions, ...addedRevisions];
      setRevisions(newRevisions);
      if (newRevisions.length < res.data.count) {
        setPage(page + 1);
      } else {
        setHasMore(false);
      }
    }).catch(error => {
      const errorMessage = getErrorMsg(error);
      if (page === 1) {
        setErrorMessage(errorMessage);
      } else {
        toaster.danger(t(errorMessage));
      }
      setLoading(false);
    });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revisions, page, perPage]);

  const openRevision = useCallback((event, revisionId) => {
    event.stopPropagation();
    event.nativeEvent && event.nativeEvent.stopImmediatePropagation && event.nativeEvent.stopImmediatePropagation();

    if (event.target.className.includes('sdoc-revision-operation-toggle')) return;
    const url = `${siteRoot}lib/${repoID}/revisions/${revisionId}/`;
    window.open(url, '_blank');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onScroll = useCallback((event) => {
    const { scrollTop, clientHeight } = event.target;
    const { clientHeight: revisionListHeight } = revisionListRef.current || { clientHeight: 0 };
    if (isLoading) return;
    if (!hasMore) return;
    if (scrollTop + clientHeight + 1 >= revisionListHeight) {
      setLoading(true);
      listRevisions();
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revisionListRef.current?.clientHeight, isLoading, hasMore]);

  const onDeleteOtherRevision = useCallback(() => {
    setShowDeleteTipDialog(true);
  }, []);

  const closeDeleteTipDialog = useCallback(() => {
    setOperatingRevision('');
    setShowDeleteTipDialog(false);
  }, []);

  const deleteOtherRevision = useCallback(() => {
    const revisionIndex = revisions.findIndex(revision => revision.id === operatingRevisionId);
    if (revisionIndex === -1) {
      closeDeleteTipDialog();
      return;
    }
    const revision = revisions[revisionIndex];
    context.deleteSdocOtherRevision(revision.id).then(res => {
      const newRevisions = revisions.slice(0);
      newRevisions.splice(revisionIndex, 1);
      updateRevisionsCount(newRevisions.length);
      setRevisions(newRevisions);
      closeDeleteTipDialog();
      toaster.success(t('Revision_deleted'));
    }).catch((error) => {
      const errorMessage = getErrorMsg(error);
      toaster.danger(t(errorMessage));
    });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operatingRevisionId, revisions, closeDeleteTipDialog]);

  const renderContent = useCallback(() => {
    if (page === 1 && isLoading) {
      return (
        <div className="sdoc-revisions-container loading">
          <FileLoading />
        </div>
      );
    }

    if (page === 1 && errorMessage) {
      return (
        <div className="sdoc-revisions-container error">
          {t(errorMessage)}
        </div>
      );
    }

    return (
      <div className="sdoc-revisions-container" >
        <div className="sdoc-revisions-header">
          <div className="sdoc-revision-name-header" style={{ width: '40%' }}>{t('ID')}</div>
          <div className="sdoc-revision-user-header" style={{ width: '25%' }}>{t('Creator')}</div>
          <div className="sdoc-revision-time-header" style={{ width: '30%' }}>{t('Created_time')}</div>
          <div className="sdoc-revision-time-header" style={{ width: '5%' }}>{}</div>
        </div>
        <div className="sdoc-revisions-content" onScroll={onScroll}>
          <div className="sdoc-revisions-list" ref={revisionListRef}>
            {revisions.map(revision => {
              const revisionId = revision.id;
              const isOperating = operatingRevisionId === revisionId;
              const isActive = activeRevisionId === revisionId;
              return (
                <div
                  key={revision.id}
                  className={classnames('sdoc-revision', { 'operating': isOperating })}
                  onClick={(event) => openRevision(event, revisionId)}
                  onMouseEnter={() => setActiveRevision(revisionId)}
                  onMouseLeave={() => setActiveRevision('')}
                >
                  <div className="sdoc-revision-name" style={{ width: '40%' }}>
                    <div className="sdoc-revision-name-content">{t('Revision') + ' ' + revisionId}</div>
                  </div>
                  <div className="sdoc-revision-user" style={{ width: '25%' }}>{revision.nickname}</div>
                  <div className="sdoc-revision-time" style={{ width: '30%' }}>{revision.createdTime}</div>
                  <div className="sdoc-revision-operations" style={{ width: '5%' }}>
                    <RevisionOperation
                      isActive={isActive}
                      isOperating={isOperating}
                      revision={revision}
                      updateOperatingRevision={setOperatingRevision}
                      onDeleteOtherRevision={onDeleteOtherRevision}
                    />
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="sdoc-revision loading">
                <FileLoading />
              </div>
            )}
          </div>
        </div>
      </div>
    );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, revisions, isLoading, errorMessage, activeRevisionId, operatingRevisionId]);

  return (
    <>
      <Modal isOpen={true} toggle={toggle} className="revisions-dialog">
        <SdocModalHeader toggle={toggle}>{t('Revision')}</SdocModalHeader>
        <ModalBody className="revisions-body">
          {renderContent()}
        </ModalBody>
      </Modal>
      {showDeleteTipDialog && (
        <TipDialog tipType={TIP_TYPE.DELETE_REVISION} onSubmit={deleteOtherRevision} onClose={closeDeleteTipDialog} zIndex={1071}>
          {t(TIP_CONTENT[TIP_TYPE.DELETE_REVISION], { content: `${t('revision')} ${operatingRevisionId}` })}
        </TipDialog>
      )}
    </>
  );
};

RevisionsDialog.propTypes = {
  updateRevisionsCount: PropTypes.func,
  toggle: PropTypes.func,
};

export default RevisionsDialog;
