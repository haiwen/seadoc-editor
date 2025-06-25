import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { DIFF_VIEWER } from '../constants';
import context from '../context';
import { createDefaultEditor } from '../extension';
import withNodeId from '../node-id';
import { getDiff } from '../utils/diff';
import SDocViewer from './sdoc-viewer';

import '../assets/css/diff-viewer.css';

const DiffViewer = ({ currentContent, lastContent, didMountCallback }) => {
  const editor = withNodeId(createDefaultEditor());
  editor.editorType = DIFF_VIEWER;
  context.initApi();
  const enableSeafileAI = context.getSetting('enableSeafileAI');

  const diff = getDiff(currentContent, lastContent);

  useEffect(() => {
    didMountCallback && didMountCallback(diff);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SDocViewer
      document={{ elements: diff.value }}
      showToolbar={false}
      showOutline={false}
      showComment={false}
      enableAiAssistant={enableSeafileAI}
      editor={editor}
    />
  );

};

DiffViewer.propTypes = {
  currentContent: PropTypes.object,
  lastContent: PropTypes.object,
};

export default DiffViewer;
