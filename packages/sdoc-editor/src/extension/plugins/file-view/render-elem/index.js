import React, { useCallback, useEffect, useState } from 'react';
import { useSelected, useSlateStatic } from '@seafile/slate-react';
import classNames from 'classnames';
import FileLoading from '../../../../components/file-loading';
import toaster from '../../../../components/toast';
import context from '../../../../context';
import { getErrorMsg } from '../../../../utils/common-utils';
import LocalStorage from '../../../../utils/local-storage-utils';
import { RECENT_COPY_CONTENT } from '../../../constants';
import { getFileUrl, updateFileView } from '../helpers';

import './index.css';

const FileView = ({ element, children, attributes }) => {
  const { data } = element;

  const editor = useSlateStatic();
  const isSelected = useSelected();
  const [isLoading, setIsLoading] = useState(true);
  const [isShowMask, setIsShowMask] = useState(true);

  useEffect(() => {
    if (!isSelected) {
      setIsShowMask(true);
    }
  }, [isSelected]);

  useEffect(() => {
    const copyContent = LocalStorage.getItem(RECENT_COPY_CONTENT);
    const wikiId = context.getSetting('wikiId');
    if (wikiId !== data.wiki_id) return;
    if (!copyContent) return;
    const stringContent = JSON.stringify(copyContent);
    if (stringContent.indexOf(data.wiki_id) > -1 && stringContent.indexOf(data.view_id) > -1) {
      context.duplicateWikiView(data.view_id).then(res => {
        const { view } = res.data;
        const newData = { ...data, view_id: view._id, view_name: view.name };
        updateFileView(newData, editor, element);
      }).catch(error => {
        const errorMessage = getErrorMsg(error);
        toaster.danger(errorMessage);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  return <FileView {...props} />;
};
