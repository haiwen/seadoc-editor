import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from 'reactstrap';
import { WikiViewer } from '@seafile/seafile-sdoc-editor';
import Loading from '../../commons/loading';
import context from '../../context';

import '../../assets/css/sdoc-editor.css';
import './style.css';

const SdocWikiViewer2 = () => {

  const [document, setDocument] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isShowOutline, setIsShowOutLine] = useState(true);
  const scrollRef = useRef(null);

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
        <div className='wiki-page-container' ref={scrollRef}>
          <div className='wiki-page-content'>
            <WikiViewer
              document={document}
              showOutline={isShowOutline}
              scrollRef={scrollRef}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SdocWikiViewer2;
