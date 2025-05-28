import React from 'react';
import { SDocWikiViewer, context } from '@seafile/sdoc-editor';
import PropTypes from 'prop-types';
import ErrorBoundary from '../components/error-boundary';

import '../assets/css/simple-viewer.css';

const propTypes = {
  showOutline: PropTypes.bool,
};


const WikiViewer = ({ document, showOutline, scrollRef }) => {

  context.initApi();

  return (
    <ErrorBoundary>
      <SDocWikiViewer document={document} showOutline={showOutline} scrollRef={scrollRef} />
    </ErrorBoundary>
  );
};

WikiViewer.propTypes = propTypes;

export default WikiViewer;
