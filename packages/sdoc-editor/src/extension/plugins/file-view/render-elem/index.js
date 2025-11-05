import React, { useCallback, useEffect, useState } from 'react';
import { useSelected } from '@seafile/slate-react';
import classNames from 'classnames';
import FileLoading from '../../../../components/file-loading';
import { getFileUrl } from '../helpers';

import './index.css';

const FileView = ({ element, children, attributes }) => {
  const { data } = element;

  const isSelected = useSelected();
  const [isLoading, setIsLoading] = useState(true);
  const [isShowMask, setIsShowMask] = useState(true);

  useEffect(() => {
    if (!isSelected) {
      setIsShowMask(true);
    }
  }, [isSelected]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const onClick = useCallback(() => {
    setIsShowMask(false);
  }, []);

  return (
    <div data-id={element.id} {...attributes} className={classNames('sdoc-file-view-container', { 'is-selected': isSelected })} contentEditable='false' suppressContentEditableWarning>
      <div className='sdoc-file-view-title'>{data.view_name}</div>
      <div className='sdoc-file-view-content'>
        <iframe
          className='sdoc-file-view-element'
          title={data.view_name}
          src={getFileUrl(element)}
          onLoad={handleLoad}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out',
            minHeight: '370px',
          }}
        >
        </iframe>
        {isLoading && (
          <div className='iframe-skeleton'>
            <FileLoading />
          </div>
        )}
        {!isLoading && isShowMask && (
          <div className='sdoc-file-view-mask' onClick={onClick}></div>
        )}
      </div>
      {children}
    </div>
  );
};

export const renderFileView = (props) => {
  return <FileView {...props}/>;
};
