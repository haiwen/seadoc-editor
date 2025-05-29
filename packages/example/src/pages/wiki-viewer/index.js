import React, { useCallback, useEffect, useState } from 'react';
import { Button } from 'reactstrap';
import { WikiViewer } from '@seafile/seafile-sdoc-editor';
import Loading from '../../commons/loading';
import context from '../../context';

import '../../assets/css/sdoc-editor.css';

const SdocWikiViewer = () => {

  const [document, setDocument] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isShowOutline, setIsShowOutLine] = useState(true);

  useEffect(() => {
    context.getFileContent().then(res => {
      const document = res.data;
      console.log(document.children);
      setDocument(document);
      setIsLoading(false);
    });
  }, []);

  const onOutlineToggle = useCallback(() => {
    setIsShowOutLine(!isShowOutline);
  }, [isShowOutline]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className='sdoc-editor'>
      <div className='sdoc-editor-header'>
        <Button className='helper' onClick={onOutlineToggle}>{isShowOutline ? 'Close outline' : 'Show outline'}</Button>
      </div>
      <div className='markdown-viewer-container'>
        <WikiViewer
          document={document}
          showOutline={isShowOutline}
          showToolbar={false}
        />
      </div>
    </div>
  );
};

export default SdocWikiViewer;
