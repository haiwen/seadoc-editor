import React, { useCallback, useEffect, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { isMobile, context, EventBus } from '@seafile/sdoc-editor';
import PropTypes from 'prop-types';
import CollaboratorsOperation from './collaborators-operation';
import MobileEditing from './mobile-editing';
import MoreOperations from './more-operations';
import PluginsOperations from './plugins-operations';
import PresentationOperation from './presentation-operation';
import RevisionOperations from './revision-operations';
import ShareOperation from './share-operation';

import './style.css';

const DocOperations = ({ isShowChanges, isStarred, isPublished = false, changes, handleViewChangesToggle, handleRevisionMerged, handleRevisionPublished }) => {
  const isSdocRevision = context.getSetting('isSdocRevision');
  const mobileLogin = context.getSetting('mobileLogin');
  const [isEdit, setIsEdit] = useState(false);

  const handleEditToggle = useCallback(({ isEdit }) => {
    setIsEdit(isEdit);
  }, []);

  useEffect(() => {
    const eventBus = EventBus.getInstance();
    const unsubscribeViewOrEdit = eventBus.subscribe('ViewOrEdit', handleEditToggle);
    return () => {
      unsubscribeViewOrEdit();
    };
  }, [handleEditToggle]);

  if (isMobile) {
    return (
      <div className="doc-ops">
        {/* you can only share after entering the browsing page */}
        {(!isSdocRevision && !mobileLogin && !isEdit) && <ShareOperation />}
        {!isSdocRevision && <MobileEditing />}
      </div>
    );
  }

  return (
    <div className='doc-ops'>
      <RevisionOperations
        isShowChanges={isShowChanges}
        isPublished={isPublished}
        changes={changes}
        handleViewChangesToggle={handleViewChangesToggle}
        handleRevisionMerged={handleRevisionMerged}
        handleRevisionPublished={handleRevisionPublished}
      />
      {!isSdocRevision && <PresentationOperation />}
      {!isSdocRevision && (<PluginsOperations />)}
      {!isSdocRevision && <ShareOperation />}
      {!isPublished && <CollaboratorsOperation />}
      {!isSdocRevision && <MoreOperations />}
    </div>
  );
};

DocOperations.propTypes = {
  isShowChanges: PropTypes.bool,
  isPublished: PropTypes.bool,
  changes: PropTypes.object,
  handleViewChangesToggle: PropTypes.func,
  handleRevisionMerged: PropTypes.func,
  handleDeleteOtherRevision: PropTypes.func,
};

export default withTranslation('sdoc-editor')(DocOperations);
