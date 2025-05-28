import React from 'react';
import { withTranslation } from 'react-i18next';
import { isMobile, context } from '@seafile/sdoc-editor';
import PropTypes from 'prop-types';
import CollaboratorsOperation from './collaborators-operation';
import MoreOperations from './more-operations';
import PluginsOperations from './plugins-operations';
import PresentationOperation from './presentation-operation';
import RevisionOperations from './revision-operations';
import ShareOperation from './share-operation';

import './style.css';

const DocOperations = ({ isShowChanges, isStarred, isPublished = false, changes, handleViewChangesToggle, handleRevisionMerged, handleRevisionPublished }) => {
  const isSdocRevision = context.getSetting('isSdocRevision');
  const mobileLogin = context.getSetting('mobileLogin');

  if (isMobile) {
    return (
      <div className="doc-ops">
        {(!isSdocRevision && !mobileLogin) && <ShareOperation />}
        {!isSdocRevision && <MoreOperations isStarred={isStarred} />}
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
