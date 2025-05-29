import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DiffViewer } from '@seafile/seafile-sdoc-editor';
import seafileAPI from '../../api';
import Loading from '../../commons/loading';
import SidePanel from './side-panel';
import context from '../../context';

import './index.css';

const PER_PAGE = 25;

const LocalDiffViewer = () => {
  const historyContentRef = useRef(null);
  const [isLogin, setIsLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isShowChangesCache = localStorage.getItem('seahub-sdoc-history-show-changes') === 'false' ? false : true;
  const [isShowChanges, setIsShowChanges] = useState(isShowChangesCache);
  const [currentVersion, setCurrentVersion] = useState({});
  const [currentVersionContent, setCurrentVersionContent] = useState('');
  const [lastVersionContent, setLastVersionContent] = useState('');
  const [changes, setChanges] = useState([]);
  const [currentDiffIndex, setCurrentDiffIndex] = useState(0);
  const [sidePanelInitData, setSidePanelInitData] = useState({});
  const [isDisplaySidePanel, setIsDisplaySidePanel] = useState(true);
  const docUuid = context.getSetting('docUuid');

  useEffect(() => {
    if (isLogin) return;
    seafileAPI.login().then(() => {
      setIsLogin(true);
    }).catch(error => {
      setIsLogin(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setContent = useCallback((currentVersionContent = '', lastVersionContent = '') => {
    setCurrentVersionContent(currentVersionContent);
    setLastVersionContent(lastVersionContent);
    setIsLoading(false);
    setChanges([]);
    setCurrentDiffIndex(0);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setDiffCount = useCallback((diff = { value: [], changes: [] }) => {
    setChanges(diff);
    setCurrentDiffIndex(0);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSelectHistoryVersion = useCallback((currentVersion, lastVersion) => {
    setIsLoading(true);
    setCurrentVersion(currentVersion);

    seafileAPI.getFileHistoryVersion(currentVersion.commit_id).then(res => {
      return seafileAPI.getFileContent(res.data);
    }).then(res => {
      const currentVersionContent = res.data;
      if (lastVersion) {
        seafileAPI.getFileHistoryVersion(lastVersion.commit_id).then(res => {
          return seafileAPI.getFileContent(res.data);
        }).then(res => {
          const lastVersionContent = res.data;
          setContent(currentVersionContent, lastVersionContent);
        }).catch(error => {
          // eslint-disable-next-line
          console.log(err);
          setContent(currentVersionContent, '');
        });
      } else {
        setContent(currentVersionContent, '');
      }
    }).catch(error => {
      // eslint-disable-next-line
      console.log(err);
      setContent('', '');
    });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onShowChanges = useCallback((isShowChanges, lastVersion) => {
    if (isShowChanges && lastVersion) {
      setIsLoading(true);
      localStorage.setItem('seahub-sdoc-history-show-changes', isShowChanges + '');
      seafileAPI.getFileHistoryVersion(lastVersion.commit_id).then(res => {
        return seafileAPI.getFileContent(res.data);
      }).then(res => {
        const lastVersionContent = res.data;
        setContent(currentVersionContent, lastVersionContent);
        setIsShowChanges(isShowChanges);
      }).catch(error => {
        console.log(error);
        setContent(currentVersionContent, '');
        setIsShowChanges(isShowChanges);
      });
      return;
    }
    setIsShowChanges(isShowChanges);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isShowChanges, currentVersion, currentVersionContent, lastVersionContent, changes, currentDiffIndex]);

  const handleSidePanelDisplayStatus = useCallback(() => {
    setIsDisplaySidePanel(!isDisplaySidePanel);
  }, [isDisplaySidePanel]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!isLoading || !isLogin) return;
    const initResultState = (result) => {
      if (!result.histories.length) return;

      setIsLoading(false);
      onSelectHistoryVersion(result.histories[0], result.histories[1]);
      setSidePanelInitData({
        historyVersions: result.histories,
        hasMore: result.total_count > (PER_PAGE * result.page),
        currentPage: result.page,
        isLoading: false,
      });
    };

    seafileAPI.listSdocHistory(docUuid, 1, PER_PAGE).then(res => {
      let historyList = res.data;
      if (historyList.length === 0) {
        setIsLoading(false);
        setSidePanelInitData({ isLoading: false });
        return;
      }
      initResultState(res.data);
    }).catch(error => {
      setIsLoading(false);
      setSidePanelInitData({ errorMessage: 'Error', isLoading: false });
    });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLogin]);

  if (!isLogin) return null;

  return (
    <div className="sdoc-file-history d-flex h-100 w-100 o-hidden">
      <div className="sdoc-file-history-container d-flex flex-column">
        <div className="sdoc-file-history-header pt-2 pb-2 pl-4 pr-4 d-flex justify-content-between w-100 o-hidden">
          <div className="sdoc-file-history-header-left d-flex align-items-center o-hidden">
            <div className="file-name text-truncate">{''}</div>
          </div>
        </div>
        <div className="sdoc-file-history-content d-flex" ref={historyContentRef}>
          {isLoading ? (
            <div className="sdoc-file-history-viewer d-flex align-items-center justify-content-center">
              <Loading />
            </div>
          ) : (
            <>
              <DiffViewer
                currentContent={currentVersionContent}
                lastContent={isShowChanges ? lastVersionContent : ''}
                didMountCallback={setDiffCount}
              />
              {isDisplaySidePanel && (
                <SidePanel
                  isShowChanges={isShowChanges}
                  currentVersion={currentVersion}
                  onSelectHistoryVersion={onSelectHistoryVersion}
                  onShowChanges={onShowChanges}
                  sidePanelInitData={sidePanelInitData}
                  onClose={handleSidePanelDisplayStatus}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocalDiffViewer;
