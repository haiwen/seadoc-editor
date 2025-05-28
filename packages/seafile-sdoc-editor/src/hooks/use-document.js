import { useCallback, useEffect, useState } from 'react';
import { context } from '@seafile/sdoc-editor';

export const useDocument = (isInitData = true) => {
  const isSdocRevision = context.getSetting('isSdocRevision');
  const isPublished = context.getSetting('isPublished');

  const [isFirstLoading, setIsFirstLoading] = useState(true);
  const [isReloading, setIsReloading] = useState(false);
  const [document, setDocument] = useState({ version: 0, children: [], cursors: {} });
  const [errorMessage, setErrorMessage] = useState('');

  const loadDocument = useCallback(() => {
    return new Promise((resolve, reject) => {
      context.getFileContent().then(res => {
        let result = res.data;
        resolve(result);
      }).catch((error) => {
        // eslint-disable-next-line
        console.log(error);
        let errorMessage = 'Load_doc_content_error';
        if (error && error.response) {
          const { error_type } = error.response.data || {};
          if (error_type === 'content_invalid') {
            errorMessage = 'Sdoc_format_invalid';
          }
        }
        reject(errorMessage);
      });
    });
  }, []);

  const reloadDocument = useCallback(() => {
    setIsReloading(true);
    loadDocument().then(document => {
      setDocument(document);
      setIsReloading(false);
    }).catch(errorMessage => {
      setIsReloading(false);
      setErrorMessage(errorMessage);
      setDocument(null);
      setIsReloading(false);
    });
  }, [loadDocument]);

  useEffect(() => {
    if (isSdocRevision && isPublished) return;
    if (!isInitData) return;
    loadDocument().then(document => {
      setDocument(document);
      setIsFirstLoading(false);
    }).catch(errorMessage => {
      setErrorMessage(errorMessage);
      setDocument(null);
      setIsFirstLoading(false);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isFirstLoading,
    isReloading,
    errorMessage,
    document,
    loadDocument,
    reloadDocument,
    setErrorMessage,
  };
};
