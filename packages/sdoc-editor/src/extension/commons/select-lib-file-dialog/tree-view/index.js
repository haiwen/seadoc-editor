import React, { useCallback, useState, useRef, useEffect } from 'react';
import { withTranslation } from 'react-i18next';
import classnames from 'classnames';
import toaster from '../../../../components/toast';
import context from '../../../../context';
import { getErrorMsg } from '../../../../utils/common-utils';
import { addDataToTree, parcelFileTypeIcon } from '../helpers';

import './index.css';

const TreeView = ({ repoID, onSelectedFile, toggle, t }) => {
  const folderRef = useRef(null);
  const [expandedFolder, setExpandedFolder] = useState(new Set([]));
  const [currentActiveItem, setCurrentActiveItem] = useState(null);
  const [treeData, setTreeData] = useState([]);

  const getTreeData = useCallback((repoID, nodePath, nodeId, treeData) => {
    return context.listLinkedRepoDir(repoID, nodePath).then(res => {
      const { dirent_list } = res.data;
      const newData = dirent_list.map((item) => {
        item.path = nodePath === '/' ? `/${item.name}` : nodePath + `${item.name}`;
        item.indexId = item.path;
        return item;
      });

      // Open folder
      if (nodeId && treeData.length > 0) {
        const newFileListData = addDataToTree(treeData, nodeId, newData, nodePath);
        setTreeData([...newFileListData]);
        return;
      }

      setTreeData(newData);
    }).catch(error => {
      toggle();
      const errorMessage = getErrorMsg(error);
      toaster.danger(errorMessage);
    });
  }, [toggle]);

  useEffect(() => {
    const rootPath = '/';
    getTreeData(repoID, rootPath);
  }, [getTreeData, repoID]);

  const collapsedFolder = useCallback((data, indexId) => {
    for (let i = 0; i < data.length; i ++) {
      if (data[i].indexId === indexId) {
        data[i].children = null;
        break;
      }

      if (data[i]?.children) {
        collapsedFolder(data[i].children, indexId);
      }
    }
    setTreeData([...data]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onToggle = useCallback(async (e, item) => {
    e && e.stopPropagation();

    if (expandedFolder.has(item.indexId)) {
      collapsedFolder(treeData, item.indexId);
      expandedFolder.delete(item.indexId);
    } else {
      await getTreeData(repoID, item.path, item.indexId, treeData);
      expandedFolder.add(item.indexId);
    }
    onSelectedFile(null);
    setCurrentActiveItem(item);
    setExpandedFolder(new Set(Array.from(expandedFolder)));
  }, [collapsedFolder, expandedFolder, getTreeData, onSelectedFile, repoID, treeData]);

  const onSelectFile = useCallback((e, file) => {
    e.stopPropagation();
    const newFile = { ...file, path: file.path || file.fullpath };
    setCurrentActiveItem(newFile);
    onSelectedFile(newFile);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderFileTree = useCallback((data) => {
    if (!Array.isArray(data) || data.length === 0) return null;

    return data.map((item) => {
      if (!item) return null;
      const { type, indexId, name, file_uuid, path, fullpath } = item;
      // Get file type icon
      const fileTypeIcon = parcelFileTypeIcon(name);

      const result = item.fullpath?.split('/').filter(Boolean);
      item.fullpath && result.pop();
      const folderPath = item.fullpath && result.join('/');
      const selected = currentActiveItem?.path === (path || fullpath);
      return (
        <div key={indexId || file_uuid} className={classnames('sdoc-folder-container')}>
          {type === 'dir' && (
            <div ref={folderRef} className='sdoc-folder-wrapper'>
              <div
                className={classnames('sdoc-folder-info sdoc-file-info', { 'expanded': expandedFolder.has(indexId) })}
                onClick={(e) => onToggle(e, item)}
              >
                <div className='sdoc-file-icon-container'>
                  <i className='sdoc-file-icon sdoc-file-icon-toggle sdocfont sdoc-arrow-right'></i>
                  <i className='sdoc-file-icon sdocfont sdoc-folder'></i>
                </div>
                <span className='sdoc-folder-name sdoc-file-name'>{name}</span>
              </div>
              <div className='sdoc-folder-children'>
                {item.children?.length === 0 && (
                  <div className='sdoc-folder-children-empty'>
                    {`(${t('Empty')})`}
                  </div>
                )}
                {item.children?.length > 0 && (
                  renderFileTree(item.children)
                )}
              </div>
            </div>
          )}
          {['file', 'video', 'exdraw'].includes(type) && (
            <div className={classnames('sdoc-file-info')} onClick={(e) => {
              onSelectFile(e, item);
            }}>
              <div className='sdoc-file-icon-container'>
                <i className={classnames('sdoc-file-icon', { 'sdocfont sdoc-link-file': !fileTypeIcon })}></i>
                {fileTypeIcon && <img className='sdoc-file-img' src={fileTypeIcon} alt='' />}
              </div>
              <span className='sdoc-file-name'>{name}</span>
              {item.fullpath && folderPath.length !== 0 && (<span className='sdoc-search-folder-name'>{folderPath}</span>)}
              {selected && <i className="sdoc-file-checked sdocfont sdoc-check-mark"></i>}
            </div>
          )}
        </div>
      );
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treeData, currentActiveItem, expandedFolder]);

  return (
    <div className='sdoc-files-tree'>
      {renderFileTree(treeData)}
    </div>
  );
};

export default withTranslation('sdoc-editor')(TreeView);
