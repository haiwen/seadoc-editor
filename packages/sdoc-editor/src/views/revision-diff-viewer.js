import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Loading from '../components/loading';
import context from '../context';
import InsertElementDialog from '../extension/commons/insert-element-dialog';
import { getDiff } from '../utils/diff';
import { formatSdocContent } from '../utils/document-utils';
import SDocViewer from './sdoc-viewer';

import '../assets/css/diff-viewer.css';


const RevisionDiffViewer = ({ editor, revisionContent, didMountCallback }) => {

  const [isLoading, setIsLoading] = useState(true);
  const [diff, setDiff] = useState(null);
  const enableSeafileAI = context.getSetting('enableSeafileAI');

  useEffect(() => {
    setIsLoading(true);
    context.getSeadocOriginFileContent().then(res => {
      const { content: originContentString } = res.data;
      let originContent = JSON.parse(originContentString);
      originContent = formatSdocContent(originContent);

      const diff = getDiff(revisionContent, originContent);
      setDiff(diff);
      didMountCallback && didMountCallback(diff);
      setIsLoading(false);
    }).catch(error => {
      console.log('error');
      setIsLoading(false);
    });
  }, [revisionContent, didMountCallback]);

  useEffect(() => {
    if (!editor) return;
    editor.readonly = true;

    return () => {
      editor.selection = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <SDocViewer
        editor={editor}
        document={{ elements: diff.value }}
        showToolbar={true}
        showOutline={true}
        showComment={true}
        enableAiAssistant={enableSeafileAI}
      />
      <InsertElementDialog editor={editor} />
    </>
  );

};

RevisionDiffViewer.propTypes = {
  currentContent: PropTypes.object,
  lastContent: PropTypes.object,
  editor: PropTypes.object,
  didMountCallback: PropTypes.func,
};

export default RevisionDiffViewer;
