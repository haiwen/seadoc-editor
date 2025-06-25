import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Loading from '../components/loading';
import context from '../context';
import { getDiff } from '../utils/diff';
import { formatSdocContent } from '../utils/document-utils';
import SDocViewer from './sdoc-viewer';

import '../assets/css/diff-viewer.css';

const PublishedRevisionDiffViewer = ({ isShowChanges, revisionContent, didMountCallback }) => {

  const [isLoading, setIsLoading] = useState(true);
  const [diff, setDiff] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    if (isShowChanges) {
      if (diff) {
        didMountCallback && didMountCallback(diff);
        setTimeout(() => {
          setIsLoading(false);
        }, 1);
        return;
      }
      context.getRevisionBaseVersionContent().then(res => {
        const { content: baseContentString } = res.data;
        let baseContent = JSON.parse(baseContentString);
        baseContent = formatSdocContent(baseContent);

        const diff = getDiff(revisionContent, baseContent);
        setDiff(diff);
        didMountCallback && didMountCallback(diff);
        setIsLoading(false);
      }).catch(error => {
        console.log('error');
        setIsLoading(false);
      });
      return;
    }
    setTimeout(() => {
      setIsLoading(false);
    }, 1);
  }, [revisionContent, didMountCallback, isShowChanges, diff]);

  if (isLoading) {
    return <Loading />;
  }

  const enableSeafileAI = context.getSetting('enableSeafileAI');
  const document = { elements: (isShowChanges && diff?.value) || revisionContent.elements };
  return (
    <SDocViewer
      document={document}
      showToolbar={true}
      showOutline={true}
      showComment={false}
      enableAiAssistant={enableSeafileAI}
    />
  );

};

PublishedRevisionDiffViewer.propTypes = {
  isShowChanges: PropTypes.bool,
  revisionContent: PropTypes.object,
  didMountCallback: PropTypes.func,
};

export default PublishedRevisionDiffViewer;
