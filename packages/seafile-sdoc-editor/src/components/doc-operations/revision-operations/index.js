import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EventBus, toaster, context, getRebase, hasConflict, INTERNAL_EVENT } from '@seafile/sdoc-editor';
import PropTypes from 'prop-types';
import { TIP_CONTENT, TIP_TYPE } from '../../../constants';
import { useDocument } from '../../../hooks';
import TipDialog from '../../tip-dialog';
import ChangesCount from './changes-count';
import MoreRevisionOperations from './more-revision-operations';
import PublishRevision from './publish-revision';
import Revisions from './revisions';
import ViewChanges from './view-changes';

const RevisionOperations = ({
  isShowChanges,
  isPublished = false,
  changes,
  handleViewChangesToggle,
  handleRevisionMerged,
  handleRevisionPublished,
}) => {
  const isSdocRevision = context.getSetting('isSdocRevision');

  const { t } = useTranslation('sdoc-editor');
  const [isShowTip, setShowTip] = useState(false);
  const [tipType, setTipType] = useState('');
  const [mergeValue, setMergeValue] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const { loadDocument } = useDocument(false);

  useEffect(() => {
    if (!isSdocRevision) return;
    if (isShowChanges) return;
    if (isPublished) return;

    const revisionPromise = loadDocument();
    const baseVersionPromise = context.getRevisionBaseVersionContent();
    const originVersionPromise = context.getSeadocOriginFileContent();

    Promise.all([revisionPromise, baseVersionPromise, originVersionPromise]).then(results => {
      const [revisionContent, baseRes, masterRes] = results;
      const baseContent = JSON.parse(baseRes.data.content);
      const masterContent = JSON.parse(masterRes.data.content);

      // no changes
      if (masterContent.version === baseContent.version) return;

      setShowTip(true);
      const { value } = getRebase(masterContent, baseContent, revisionContent);
      setMergeValue(value);
      setTipType(TIP_TYPE.SOURCE_DOCUMENT_CHANGED);
    }).catch(error => {
      if (typeof error === 'string') {
        toaster.danger(t(error));
        return;
      }
      if (error && error.response && error.response.status === '404') {
        setShowTip(false);
        setTipType('');
        return;
      }
      toaster.danger(t('Error'));
      setShowTip(false);
      setTipType('');
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDocumentReplaced = useCallback(() => {
    if (isShowTip) return;
    setTipType(TIP_TYPE.HAS_BEEN_REPLACED);
    setShowTip(true);

  }, [isShowTip]);

  const hasPublishRevision = useCallback(() => {
    handleRevisionPublished();
    toaster.success(t(TIP_CONTENT[TIP_TYPE.HAS_BEEN_PUBLISHED]));
  }, [handleRevisionPublished, t]);

  const onDocumentRemoved = useCallback(() => {
    if (isShowTip) return;
    setTipType(TIP_TYPE.HAS_BEEN_REMOVED);
    setShowTip(true);

  }, [isShowTip]);

  const onError = useCallback(() => {
    toaster.danger(t('Error'));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const eventBus = EventBus.getInstance();
    const unsubscribeMergeDocument = eventBus.subscribe(INTERNAL_EVENT.DOCUMENT_REPLACED, onDocumentReplaced);
    const unsubscribeMergeDocumentError = eventBus.subscribe(INTERNAL_EVENT.DOCUMENT_REPLACED_ERROR, onError);

    const unsubscribePublishDocument = eventBus.subscribe(INTERNAL_EVENT.PUBLISH_DOCUMENT, hasPublishRevision);
    const unsubscribePublishDocumentError = eventBus.subscribe(INTERNAL_EVENT.PUBLISH_DOCUMENT_ERROR, onError);

    const unsubscribeRemoveDocument = eventBus.subscribe(INTERNAL_EVENT.REMOVE_DOCUMENT, onDocumentRemoved);
    const unsubscribeRemoveDocumentError = eventBus.subscribe(INTERNAL_EVENT.REMOVE_DOCUMENT_ERROR, onError);
    return () => {
      unsubscribeMergeDocument();
      unsubscribeMergeDocumentError();
      unsubscribePublishDocument();
      unsubscribePublishDocumentError();
      unsubscribeRemoveDocument();
      unsubscribeRemoveDocumentError();
    };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // solve show change view in revision editor
  const onViewChangesToggle = useCallback((isShowChanges) => {
    if (isLoading) return;
    setLoading(true);
    if (!isPublished && isShowChanges) {
      // The trick here is to send one more api request in order to use the same information box.
      loadDocument().then(revisionContent => {
        // Prevent users from switching if document contains conflicting content
        if (hasConflict(revisionContent.elements)) {
          setTipType(TIP_TYPE.HAS_CONFLICT_BEFORE_VIEW_CHANGES);
          setShowTip(true);
        } else {
          handleViewChangesToggle(isShowChanges);
        }
        setLoading(false);
      }).catch(errorMessage => {
        toaster.danger(t(errorMessage));
        setLoading(false);
      });
      return;
    }

    handleViewChangesToggle(isShowChanges);
    setLoading(false);
  }, [handleViewChangesToggle, loadDocument, t, isPublished, isLoading]);

  // publish revision
  const publishRevision = useCallback(() => {
    setShowTip(true);
    setTipType(TIP_TYPE.CHECKING);

    const revisionPromise = loadDocument();
    const baseVersionPromise = context.getRevisionBaseVersionContent();
    const originVersionPromise = context.getSeadocOriginFileContent();

    Promise.all([revisionPromise, baseVersionPromise, originVersionPromise]).then(results => {
      const [revisionContent, baseRes, masterRes] = results;
      const baseContent = JSON.parse(baseRes.data.content);
      const masterContent = JSON.parse(masterRes.data.content);
      if (hasConflict(revisionContent.elements)) {
        setTipType(TIP_TYPE.HAS_CONFLICT_BEFORE_PUBLISH);
        return;
      }

      const { canMerge, isNeedReplaceMaster, value } = getRebase(masterContent, baseContent, revisionContent);
      // change to HAS_BEEN_PUBLISHED
      if (canMerge && isNeedReplaceMaster) {
        setTipType(TIP_TYPE.PUBLISHING);
        context.publishRevision().then(res => {
          setShowTip(false);
          setTipType('');
        }).catch(error => {
          toaster.danger(t('Error'));
        });
        return;
      }

      // change to DELETE_NO_CHANGES_REVISION
      if (canMerge && !isNeedReplaceMaster) {
        setTipType(TIP_TYPE.DELETE_NO_CHANGES_REVISION);
        return;
      }

      // change to MERGE
      setMergeValue(value);
      setTipType(TIP_TYPE.MERGE);

    }).catch(error => {
      if (typeof error === 'string') {
        toaster.danger(t(error));
        return;
      }
      toaster.danger(t('Error'));
    });
  }, [loadDocument, t]);

  // confirm publish
  const onSubmit = useCallback(() => {
    if (tipType === TIP_TYPE.HAS_BEEN_PUBLISHED) {
      // nothing todo
      return;
    }

    if (tipType === TIP_TYPE.DELETE_NO_CHANGES_REVISION) {
      context.deleteSdocRevision().then(res => {
        // update current location
        const originFileURL = context.getSetting('originFileURL');
        window.location.href = originFileURL;
      }).catch(error => {
        toaster.danger(t('Error'));
      });
      return;
    }

    if (tipType === TIP_TYPE.MERGE || tipType === TIP_TYPE.SOURCE_DOCUMENT_CHANGED) {
      const { username } = context.getUserInfo();
      const doc = {
        elements: mergeValue.elements,
        version: mergeValue.version,
        format_version: mergeValue.format_version,
        last_modify_user: username
      };
      context.updateSdocRevision(doc).then(res => {
        const { origin_file_version } = res.data;
        context.updateSettings({ 'originFileVersion': origin_file_version });
        handleRevisionMerged && handleRevisionMerged(mergeValue);
        setShowTip(false);
      }).catch(error => {
        toaster.danger(t('Error'));
      });
      return;
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipType, mergeValue, document]);

  const onClose = useCallback(() => {
    setShowTip(false);
  }, []);

  return (
    <>
      {!isSdocRevision && (
        <>
          <MoreRevisionOperations />
          <Revisions />
        </>
      )}
      {isSdocRevision && isShowChanges && (
        <ChangesCount allChanges={changes} />
      )}
      {isSdocRevision && (
        <ViewChanges isShowChanges={isShowChanges} onViewChangesToggle={onViewChangesToggle} />
      )}
      {isSdocRevision && !isPublished && (
        <PublishRevision publishRevision={publishRevision} />
      )}
      {isShowTip && <TipDialog tipType={tipType} onSubmit={onSubmit} onClose={onClose} zIndex={1072} />}
    </>
  );
};

RevisionOperations.propTypes = {
  isShowChanges: PropTypes.bool,
  changes: PropTypes.object,
  handleViewChangesToggle: PropTypes.func,
  handleRevisionMerged: PropTypes.func,
};

export default RevisionOperations;
