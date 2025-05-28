import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PublishedRevisionDiffViewer, Loading, context } from '@seafile/sdoc-editor';
import DocInfo from '../components/doc-info';
import DocOperations from '../components/doc-operations';
import ErrorBoundary from '../components/error-boundary';
import Layout, { Header, Content } from '../layout';
import { resetWebTitle } from '../utils';

import '../assets/css/simple-editor.css';

const PublishedRevisionViewer = () => {
  context.initApi();

  const { t } = useTranslation('sdoc-editor');
  const [isFirstLoading, setIsFirstLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isShowChanges, setShowChanges] = useState(false);
  const [changes, setChanges] = useState({});
  const [document, setDocument] = useState({});

  // useMount: reset title
  useEffect(() => {
    resetWebTitle(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    context.getPublishedRevisionContent().then(res => {
      const { content: revisionContentString } = res.data;
      const document = JSON.parse(revisionContentString);

      setDocument(document);
      setIsFirstLoading(false);
    }).catch(error => {
      // eslint-disable-next-line
      console.log(error);
      let errorMessage = 'Load_doc_content_error';
      if (error && error.response) {
        const { error_type } = error.response.data || {};
        if (error_type === 'content_invalid') {
          errorMessage = 'Sdoc_format_invalid';
        }
      }
      setErrorMessage(errorMessage);
      setIsFirstLoading(false);
    });
  }, []);

  const setDiffChanges = useCallback((diff) => {
    setChanges(diff);
  }, []);

  const handleViewChangesToggle = useCallback((isShowChanges) => {
    setShowChanges(isShowChanges);
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
      <Layout>
        <Header>
          <DocInfo isEditMode={false} isPublished={true} />
          <DocOperations isShowChanges={isShowChanges} changes={changes} isPublished={true} handleViewChangesToggle={handleViewChangesToggle} />
        </Header>
        <Content>
          <PublishedRevisionDiffViewer isShowChanges={isShowChanges} revisionContent={document} didMountCallback={setDiffChanges} />
        </Content>
      </Layout>
    </ErrorBoundary>
  );
};

export default PublishedRevisionViewer;
