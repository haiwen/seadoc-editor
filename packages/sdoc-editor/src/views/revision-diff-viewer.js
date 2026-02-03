import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Loading from '../components/loading';
import { MATH_JAX_SOURCE_RUL } from '../constants';
import context from '../context';
import InsertElementDialog from '../extension/commons/insert-element-dialog';
import useMathJax from '../hooks/use-mathjax';
import { getDiff } from '../utils/diff';
import { formatSdocContent } from '../utils/document-utils';
import SDocViewer from './sdoc-viewer';

import '../assets/css/diff-viewer.css';

const RevisionDiffViewer = ({ editor, revisionContent, didMountCallback, mathJaxSource = MATH_JAX_SOURCE_RUL }) => {

  const [isLoading, setIsLoading] = useState(true);
  const [diff, setDiff] = useState(null);
  const { isLoadingMathJax } = useMathJax(mathJaxSource);

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

  if (isLoading || isLoadingMathJax) {
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
