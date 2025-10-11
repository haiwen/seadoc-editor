import React, { useCallback, useState, useEffect } from 'react';
import { withTranslation } from 'react-i18next';
import context from '../../../../context';
import { parcelFileTypeIcon } from '../helpers';

import './index.css';

const ListView = ({ onSelectedFile, fileType, t, searchContent, isOpenSearch }) => {
  const [currentActiveItem, setCurrentActiveItem] = useState(null);
  const [allFileList, setAllFileList] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [repoName, setRepoName] = useState('');

  const onSelectFile = useCallback((e, file) => {
    e.stopPropagation();
    setCurrentActiveItem(file);
    onSelectedFile(file);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const getFileMetadata = async () => {
      const res = await context.getFileMetadataInfo(fileType);
      setRepoName(res.data.repo_name);

      const sortedRecords = [...res.data.records].sort((a, b) => {
        return new Date(b._mtime) - new Date(a._mtime);
      });
      setAllFileList(sortedRecords);
      setFileList(sortedRecords);
    };

    getFileMetadata();
  }, []);

  useEffect(() => {
    if (!isOpenSearch || !searchContent.trim()) {
      setFileList(allFileList);
    }

    if (searchContent.trim() && isOpenSearch) {
      const keyword = searchContent.trim().toLowerCase();

      const result = allFileList.filter(file => {
        const mtimeStr = new Date(file._mtime).toLocaleString().toLowerCase();
        return (
          file._name?.toLowerCase().includes(keyword) ||
          file._parent_dir?.toLowerCase().includes(keyword) ||
          mtimeStr.includes(keyword) ||
          file.file_creator_nickname?.toLowerCase().includes(keyword) ||
          repoName?.toLowerCase().includes(keyword)
        );
      });

      setFileList(result);
    }
  }, [isOpenSearch, searchContent]);

  return (
    <div className='sdoc-files-list'>
      {fileList.map(file => {
        const fileTypeIcon = parcelFileTypeIcon(file._name);
        const dirPath = repoName + (file._parent_dir === '/' ? '' : file._parent_dir);
        const date = new Date(file._mtime);
        const fileAdjustTime = date.toLocaleString();
        const username = file.file_creator_nickname;
        const selected = currentActiveItem?.id === file._id;
        const filePath = (file._parent_dir === '/' ? '' : file._parent_dir) + '/' + file._name;

        return (
          <div key={file._id} className='sdoc-file-wrapper'
            onClick={(e) => onSelectFile(e, { id: file._id, name: file._name, path: filePath })}
          >
            <img className='file-icon' src={fileTypeIcon} alt="" />
            <div className="sdoc-item-content">
              <div className="sdoc-item-name ellipsis" title={file._name}>{file._name}</div>
              <div className="sdoc-item-path ellipsis" title={dirPath}>{dirPath}</div>
              <div className="sdoc-item-user-container ellipsis" >
                <div className='item-user'>{username}</div>
                <div className='item-divide'>|</div>
                <div className='item-adjust-time'>{fileAdjustTime}</div>
              </div>
            </div>
            {selected && <i className="sdoc-file-checked sdocfont sdoc-check-mark"></i>}
          </div>
        );
      }
      )}
      {isOpenSearch && fileList.length === 0 && (
        <div className='sdoc-file-search-no-result'>{t('No_results')}</div>
      )}
    </div>
  );
};

export default withTranslation('sdoc-editor')(ListView);
