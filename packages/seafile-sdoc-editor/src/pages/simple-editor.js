import React, { useCallback, useEffect, useRef, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { SDocEditor, RevisionEditor, Loading, PluginsProvider, CollaboratorsProvider, context, PublishedRevisionDiffViewer } from '@seafile/sdoc-editor';
import PropTypes from 'prop-types';
import DocInfo from '../components/doc-info';
import DocOperations from '../components/doc-operations';
import ErrorBoundary from '../components/error-boundary';
import { useDocument } from '../hooks';
import Layout, { Header, Content } from '../layout';
import { resetWebTitle, isSeafileClient } from '../utils';

import '../assets/css/simple-editor.css';

const SimpleEditor = ({ isStarred, isDraft, showComment, showDocOperations = true, t, plugins = [], collaborators }) => {
  context.initApi();

  const editorRef = useRef(null);
  const { isFirstLoading, isReloading, errorMessage, document, reloadDocument, setErrorMessage } = useDocument();
  const [isShowChanges, setShowChanges] = useState(false);
  const [revisionContent, setRevisionContent] = useState(null);
  const [changes, setChanges] = useState({});
  const initIsPublished = context.getSetting('isPublished') || false;
  const isSdocRevision = context.getSetting('isSdocRevision') || false;
  const [isPublished, setPublished] = useState(initIsPublished);

  // useMount: reset title
  useEffect(() => {
    resetWebTitle(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setDiffChanges = useCallback((diff) => {
    setChanges(diff);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShowChanges]);

  const handleViewChangesToggle = useCallback((isShowChanges) => {
    if (isPublished) {
      setShowChanges(isShowChanges);
      return;
    }

    if (!isShowChanges) {
      setShowChanges(isShowChanges);
      reloadDocument();
      return;
    }

    // Get the contents of the current revision
    const revisionContentValue = editorRef.current.getSlateValue();
    setRevisionContent(revisionContentValue);
    setShowChanges(isShowChanges);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document, editorRef.current, isPublished]);

  const handleRevisionMerged = useCallback((value) => {
    setShowChanges(false);
    editorRef.current.setSlateValue(value);
    editorRef.current.updateDocumentVersion(value);
  }, []);

  const handleRevisionPublished = useCallback(() => {
    context.getPublishedRevisionContent().then(res => {
      const { content: revisionContentString } = res.data;
      const document = JSON.parse(revisionContentString);
      setRevisionContent(document);
      setPublished(true);
      context.settings['isPublished'] = true;
      const oldAssetsUrl = context.getSetting('assetsUrl');
      const docUuid = context.getSetting('docUuid');
      const originDocUuid = context.getSetting('originDocUuid');
      context.settings['assetsUrl'] = oldAssetsUrl.replace(docUuid, originDocUuid);
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
      setPublished(true);
    });
  }, [setErrorMessage]);

  const docOperationsProps = {
    isStarred,
    isPublished,
    isShowChanges,
    changes,
    handleViewChangesToggle,
    handleRevisionMerged,
    handleRevisionPublished,
  };

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
            {!isSeafileClient() && (
              <Header>
                <DocInfo isStarred={isStarred} isDraft={isDraft} isPublished={isPublished} isEditMode={isPublished ? false : !isShowChanges} />
                {showDocOperations && <DocOperations {...docOperationsProps} />}
              </Header>
            )}
            <Content>
              {!isSdocRevision && (
                <SDocEditor
                  ref={editorRef}
                  isReloading={isReloading}
                  document={document}
                  showComment={showComment}
                />
              )}
              {isSdocRevision && !isPublished && (
                <RevisionEditor
                  ref={editorRef}
                  isReloading={isReloading}
                  document={document}
                  revisionContent={revisionContent}
                  isShowChanges={isShowChanges}
                  didMountCallback={setDiffChanges}
                />
              )}
              {isSdocRevision && isPublished && (
                <PublishedRevisionDiffViewer
                  revisionContent={revisionContent}
                  isShowChanges={isShowChanges}
                  didMountCallback={setDiffChanges}
                />
              )}
            </Content>
          </Layout>
        </PluginsProvider>
      </CollaboratorsProvider>
    </ErrorBoundary>
  );
};

SimpleEditor.propTypes = {
  isStarred: PropTypes.bool,
  isDraft: PropTypes.bool,
  showComment: PropTypes.bool,
  plugins: PropTypes.func,
  t: PropTypes.func,
};

export default withTranslation('sdoc-editor')(SimpleEditor);
