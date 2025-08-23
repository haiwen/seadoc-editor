import React, { useRef, useMemo, useState, useEffect } from 'react';
import { createEditor } from '@seafile/slate';
import { withReact } from '@seafile/slate-react';
import context from '../../../context';
import { usePlugins } from '../../../hooks/use-plugins';
import { ScrollContext } from '../../../hooks/use-scroll-context';
import ReadOnlyArticle from '../../../views/readonly-article';
import { parcelFileTypeIcon } from '../select-file-dialog/helpers';

import './index.css';

const FilePreviewWrapper = ({ docUuid, title }) => {
  const [fileContent, setFileContent] = useState(null);
  const [Component, setComponent] = useState(null);
  const { closePlugin } = usePlugins();
  const fileTypeIcon = parcelFileTypeIcon(title);
  const readonlyEditor = useMemo(() => withReact(createEditor()), []);
  const filePreviewRef = useRef();

  const openFullscreen = () => {
    if (filePreviewRef.current.requestFullscreen) { // Chrome
      filePreviewRef.current.requestFullscreen();
    } else if (filePreviewRef.current.webkitRequestFullscreen) { // Safari
      filePreviewRef.current.webkitRequestFullscreen();
    } else if (filePreviewRef.current.msRequestFullscreen) { // IE11
      filePreviewRef.current.msRequestFullscreen();
    }
  };

  useEffect(() => {
    const getFileContent = async (docUuid) => {
      try {
        const result = await context.getFileContentByDocUuid(docUuid);
        setFileContent(result.data.elements);
        setComponent(() => ReadOnlyArticle);
      } catch (error) {
        console.log(error);
        let errorMessage = 'Load_doc_content_error';
        if (error && error.response) {
          const { error_type } = error.response.data || {};
          if (error_type === 'content_invalid') {
            errorMessage = 'Sdoc_format_invalid';
          }
        }
      }
    };

    getFileContent(docUuid);
  }, [docUuid]);


  return (
    <div className="sdoc-file-preview-drawer">
      <div className="file-preview-panel-wrapper">
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
          {Component && (
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
  );
};

export default FilePreviewWrapper;
