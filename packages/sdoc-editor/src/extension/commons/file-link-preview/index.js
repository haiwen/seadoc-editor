import React, { useRef, useMemo, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { createEditor } from '@seafile/slate';
import { withReact } from '@seafile/slate-react';
import FileLoading from '../../../components/file-loading';
import context from '../../../context';
import { usePlugins } from '../../../hooks/use-plugins';
import { ScrollContext } from '../../../hooks/use-scroll-context';
import ReadOnlyArticle from '../../../views/readonly-article';
import { parcelFileTypeIcon } from '../select-file-dialog/helpers';
import { getSdocToken, saveSdocToken } from './helper';

import './index.css';

const FilePreviewWrapper = ({ docUuid, title }) => {
  const [fileContent, setFileContent] = useState(null);
  const [Component, setComponent] = useState(null);
  const [isReloading, setIsReloading] = useState(true);
  const [isShowZoomOut, setIsShowZoomOut] = useState(false);
  const readonlyEditor = useMemo(() => withReact(createEditor()), [docUuid]);
  const { closePlugin } = usePlugins();
  const filePreviewRef = useRef();

  const fileTypeIcon = parcelFileTypeIcon(title);

  const openFullscreen = (e) => {
    e.stopPropagation();
    setIsShowZoomOut(true);
  };

  useEffect(() => {
    const fetchFileContent = async () => {
      try {
        let token = getSdocToken(docUuid);
        if (!token) {
          const tokenRes = await context.getTokenByDocUuid(docUuid);
          saveSdocToken(docUuid, tokenRes.data.access_token);
          token = tokenRes.data.access_token;
        }

        const result = await context.getFileContentByDocUuidAndAccessToken(docUuid, token);
        const fileContentElements = result.data.elements;
        setIsReloading(false);
        setFileContent(fileContentElements);
        setComponent(() => ReadOnlyArticle);
      } catch (error) {
        console.log(error);
        setFileContent(null);
        setIsReloading(false);
      }
    };

    if (docUuid) {
      setIsReloading(true);
      fetchFileContent();
    }


  }, [docUuid]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsShowZoomOut(false);
      }
    };
    if (isShowZoomOut) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isShowZoomOut, setIsShowZoomOut]);


  return (
    <>
      <div className="sdoc-file-preview-drawer">
        <div className="file-preview-panel-wrapper" data-docuuid={docUuid}>
          <div className="file-preview-panel-header">
            <div className="file-preview-panel-header-left">
              <div className="detail-header-icon-container">
                <img src={fileTypeIcon} width='32px' height='32px' alt="" />
              </div>
              <span className="name ellipsis" title={title}>{title}</span>
            </div>
            <div className="file-preview-panel-header-right">
              <div
                id='file-preview_full_screen_mode'
                role="button"
                className='file-preview-full-screen'
                onClick={openFullscreen}
              >
                <i className='sdocfont sdoc-fullscreen icon-font'/>
              </div>
              <div className="sdoc-icon-btn" onClick={closePlugin}>
                <i className="sdocfont sdoc-sm-close"></i>
              </div>
            </div>
          </div>
          <div className="file-preview-panel-body">
            {isReloading && (
              <div className="h-100 w-100 d-flex align-items-center justify-content-center">
                <FileLoading />
              </div>
            )}
            {Component && !isReloading && (
              <ScrollContext.Provider value={{ scrollRef: { current: null } }}>
                <div className='file-preview-container' ref={filePreviewRef}>
                  <Component
                    key={docUuid}
                    editor={readonlyEditor}
                    slateValue={fileContent}
                  />
                </div>
              </ScrollContext.Provider>
            )}
          </div>
        </div>
      </div>
      {isShowZoomOut && Component && (
        ReactDOM.createPortal(
          <div className='zoom-out-container' onClick={() => setIsShowZoomOut(false)}>
            <ScrollContext.Provider value={{ scrollRef: { current: null } }}>
              <div
                className='file-preview-zoom-out-container'
                ref={filePreviewRef}
                onClick={(e) => e.stopPropagation()}
              >
                <Component
                  key={docUuid}
                  editor={readonlyEditor}
                  slateValue={fileContent}
                />
              </div>
            </ScrollContext.Provider>
          </div>,
          document.body
        )
      )}
    </>
  );
};

export default FilePreviewWrapper;
