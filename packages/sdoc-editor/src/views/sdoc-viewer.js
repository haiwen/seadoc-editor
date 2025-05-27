import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import jsBridge from '../android/js-bridge';
import { registerOutlineEventHandler, updateOutlineValue } from '../android/outline-module';
import context from '../context';
import { HeaderToolbar, createDefaultEditor } from '../extension';
import { CollaboratorsProvider } from '../hooks/use-collaborators';
import { ColorProvider } from '../hooks/use-color-context';
import { PluginsProvider } from '../hooks/use-plugins';
import { EditorContainer, EditorContent } from '../layout';
import withNodeId from '../node-id';
import { generateDefaultDocContent } from '../utils/document-utils';
import ReadOnlyArticle from './readonly-article';

import '../assets/css/sdoc-viewer.css';

const SDocViewer = ({ editor, document, showToolbar = false, showOutline = false, showComment = false, plugins = [] }) => {
  if (!context.api) {
    context.initApi();
  }
  const validEditor = editor || withNodeId(createDefaultEditor());
  const slateValue = (document || generateDefaultDocContent()).elements;
  const Provider = showComment ? CollaboratorsProvider : Fragment;

  useEffect(() => {
    const mobileLogin = context.getSetting('mobileLogin');
    if (mobileLogin) {
      jsBridge.init();
      registerOutlineEventHandler();
      updateOutlineValue(slateValue);
    }
    return () => {
      jsBridge.finishPage();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Provider>
      <PluginsProvider plugins={plugins} showComment={showComment}>
        <EditorContainer editor={validEditor} readonly={true}>
          <ColorProvider>
            {showToolbar && <HeaderToolbar editor={validEditor} readonly={true} />}
            <EditorContent docValue={slateValue} readonly={true} showOutline={showOutline} editor={validEditor} showComment={showComment}>
              <ReadOnlyArticle editor={validEditor} slateValue={slateValue} />
            </EditorContent>
          </ColorProvider>
        </EditorContainer>
      </PluginsProvider>
    </Provider>
  );

};

SDocViewer.propTypes = {
  showToolbar: PropTypes.bool,
  showOutline: PropTypes.bool,
  document: PropTypes.object,
  editor: PropTypes.object,
  plugins: PropTypes.array,
};

export default SDocViewer;
