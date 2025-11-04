import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SdocWikiEditor } from '@seafile/seafile-sdoc-editor';
import Loading from '../../commons/loading';
import context from '../../context';

import './layout.css';
import './wiki-editor.css';

const SdocWikiViewerThird = () => {

  const [document, setDocument] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isShowOutline, setIsShowOutLine] = useState(false);
  const ref = useRef();
  const [coverHeight, setCoverHeight] = useState(0);
  const [iconHeight, setIconHeight] = useState(0);

  useEffect(() => {
    context.getFileContent().then(res => {
      const document = res.data;
      setDocument(document);
      setIsLoading(false);
    });
  }, []);

  // eslint-disable-next-line no-unused-vars
  const onOutlineToggle = useCallback(() => {
    setIsShowOutLine(!isShowOutline);
  }, [isShowOutline]);

  const onAddIconToggle = () => {
    setIconHeight(50);
  };

  const onAddCoverClick = () => {
    setCoverHeight(120);
  };

  const getHeaderHeight = () => {
    const pageCover = window.document.getElementById('wiki-page-cover');
    const pageCoverHeight = pageCover?.offsetHeight || 0;
    const pageTitle = window.document.getElementById('wiki-page-title');
    const pageTitleHeight = pageTitle?.offsetHeight || 0;

    const topNavHeight = 44;
    return pageCoverHeight + pageTitleHeight + topNavHeight;
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className='wiki-main'>
      <div className='wiki-side-panel'></div>
      <div className='wiki-main-panel'>
        <div className='wiki-main-panel__north'>Wiki Editor Test</div>
        <div className='wiki-main-panel__center'>
          <div className='sdoc-scroll-container' id="sdoc-scroll-container" ref={ref}>
            <div className='wiki-editor-container'>
              <div id="wiki-page-cover" className='wiki-page-cover' style={{ height: coverHeight, minHeight: coverHeight }}></div>
              <div id="wiki-page-title" className='wiki-page-title'>
                <div className='wiki-page-icon' style={{ height: iconHeight }}></div>
                <div className='ops'>
                  <span className='op-item mr-2' onClick={onAddIconToggle}>add icon</span>
                  <span className='op-item' onClick={onAddCoverClick}>add cover</span>
                </div>
                <div className='title'>Header</div>
              </div>
              <SdocWikiEditor
                scrollRef={ref}
                document={document}
                showOutline={isShowOutline}
                showToolbar={false}
                showComment={true}
                docUuid={context.getSetting('docUuid')}
                getHeaderHeight={getHeaderHeight}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SdocWikiViewerThird;
