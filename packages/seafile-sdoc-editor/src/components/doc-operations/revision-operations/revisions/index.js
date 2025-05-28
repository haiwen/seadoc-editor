import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EventBus, toaster, context } from '@seafile/sdoc-editor';
import PropTypes from 'prop-types';
import { NEW_REVISION } from '../../../../constants';
import { getErrorMsg } from '../../../../utils';
import RevisionsDialog from './revisions-dialog';

import './index.css';

const Revisions = () => {
  const eventBus = EventBus.getInstance();

  const { t } = useTranslation('sdoc-editor');
  const [revisionsCount, setRevisionsCount] = useState(0);
  const [isShowRevisions, setShowRevisions] = useState(false);

  const autoIncrementRevisionsCount = useCallback(() => {
    setRevisionsCount(revisionsCount + 1);
  }, [revisionsCount]);

  // did mount
  useEffect(() => {
    context.getSdocRevisionsCount().then(res => {
      const count = res.data.count;
      setRevisionsCount(count);
    }).catch(error => {
      const errorMessage = getErrorMsg(error);
      toaster.danger(t(errorMessage));
    });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const autoIncrementRevisionSubscribe = eventBus.subscribe(NEW_REVISION, autoIncrementRevisionsCount);
    return () => {
      autoIncrementRevisionSubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoIncrementRevisionsCount]);

  const showRevisions = useCallback(() => {
    setShowRevisions(true);
  }, []);

  const closeRevisions = useCallback(() => {
    setShowRevisions(false);
  }, []);

  if (revisionsCount === 0) return null;

  return (
    <>
      <div className="sdoc-revisions-count" onClick={showRevisions}>
        {revisionsCount === 1 && (<>{t('1_revision')}</>)}
        {revisionsCount > 1 && (<>{t('x_revisions', { count: revisionsCount })}</>)}
      </div>
      {isShowRevisions && (
        <RevisionsDialog updateRevisionsCount={setRevisionsCount} toggle={closeRevisions} />
      )}
    </>
  );
};

Revisions.propTypes = {
  onDeleteOtherRevision: PropTypes.func,
};

export default Revisions;
