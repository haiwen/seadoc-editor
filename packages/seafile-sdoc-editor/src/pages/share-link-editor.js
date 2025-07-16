import React, { useEffect, useRef } from 'react';
import { withTranslation } from 'react-i18next';
import { SDocEditor, Loading, PluginsProvider, CollaboratorsProvider, context } from '@seafile/sdoc-editor';
import PropTypes from 'prop-types';
import DocInfo from '../components/doc-info';
import CollaboratorsOperation from '../components/doc-operations/collaborators-operation';
import ShareLinkMoreOperations from '../components/doc-operations/share-link-more-operations';
import ErrorBoundary from '../components/error-boundary';
import { useDocument } from '../hooks';
import Layout, { Header, Content } from '../layout';
import { resetWebTitle, isSeafileClient } from '../utils';

import '../assets/css/simple-editor.css';

const ShareLinkEditor = ({ showComment, t, plugins = [], collaborators }) => {
  context.initApi();

  const editorRef = useRef(null);
  const { isFirstLoading, isReloading, errorMessage, document } = useDocument();

  // useMount: reset title
  useEffect(() => {
    resetWebTitle(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isFirstLoading) {
    return <Loading />;
  }

  if (errorMessage) {
    return (
      <div className='error-page'>
        <div className='error-tip'>{t(errorMessage)}</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <CollaboratorsProvider collaborators={collaborators}>
        <PluginsProvider plugins={plugins} showComment={showComment}>
          <Layout>
            {!isSeafileClient() &&
            <Header>
              <DocInfo />
              <div className='doc-ops'>
                <CollaboratorsOperation />
                <ShareLinkMoreOperations />
              </div>
            </Header>}
            <Content>
              <SDocEditor
                ref={editorRef}
                isReloading={isReloading}
                document={document}
                showComment={showComment}
              />
            </Content>
          </Layout>
        </PluginsProvider>
      </CollaboratorsProvider>
    </ErrorBoundary>
  );
};

ShareLinkEditor.propTypes = {
  isStarred: PropTypes.bool,
  isDraft: PropTypes.bool,
  showComment: PropTypes.bool,
  plugins: PropTypes.func,
  t: PropTypes.func,
};

export default withTranslation('sdoc-editor')(ShareLinkEditor);
