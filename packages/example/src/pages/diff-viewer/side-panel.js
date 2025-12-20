import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Loading from '../../commons/loading';
import seafileAPI from '../../api';
import HistoryVersion from './history-version';
import Switch from '../../commons/switch';
import context from '../../context';

const PER_PAGE = 25;

const SidePanel = ({ currentVersion, isShowChanges, onSelectHistoryVersion, sidePanelInitData = {},onClose }) => {
  // eslint-disable-next-line no-unused-vars
  const [isLoading, setIsLoading] = useState(sidePanelInitData.isLoading ?? true);
  const [historyVersions, setHistoryVersions] = useState(sidePanelInitData.historyVersions || []);
  const [currentPage, setCurrentPage] = useState(sidePanelInitData.currentPage || 1);
  const [hasMore, setHasMore] = useState(sidePanelInitData.hasMore || false);
  const [isReloadingData, setIsReloadingData] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [errorMessage, setErrorMessage] = useState(sidePanelInitData.errorMessage || '');
  const docUuid = context.getSetting('docUuid');

  useEffect(() => {
    if (isReloadingData && hasMore) {
      const updateResultState = (result) => {
        if (!result.histories.length) return;
        setHistoryVersions([...historyVersions, ...result.histories]);
        setCurrentPage(result.page);
        setHasMore(result.total_count > (PER_PAGE * result.page));
        setIsReloadingData(false);
      };

      seafileAPI.listSdocHistory(docUuid, currentPage + 1, PER_PAGE).then(res => {
        updateResultState(res.data);
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReloadingData, hasMore]);

  const onScrollHandler = useCallback((event) => {
    const clientHeight = event.target.clientHeight;
    const scrollHeight = event.target.scrollHeight;
    const scrollTop = event.target.scrollTop;
    const isBottom = (clientHeight + scrollTop + 1 >= scrollHeight);
    if (!isBottom) return;
    setIsReloadingData(true);
  }, []);

  const onSelectVersion = useCallback((historyVersion, historyVersions) => {
    if (!isShowChanges) {
      onSelectHistoryVersion(historyVersion);
      return;
    }
    const historyVersionIndex = historyVersions.findIndex(item => item.commit_id === historyVersion.commit_id);
    onSelectHistoryVersion(historyVersion, historyVersions[historyVersionIndex + 1]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onShowChanges = useCallback((historyVersions) => {
    const historyVersionIndex = historyVersions.findIndex(item => item.commit_id === currentVersion.commit_id);
    const lastVersion = historyVersions[historyVersionIndex + 1];
    onShowChanges(!isShowChanges, lastVersion);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="sdoc-file-history-panel d-flex flex-column">
      <div className="sdoc-file-history-select-range">
        <div className="sdoc-file-history-select-range-title">
          {'History Versions'}
        </div>
        <div className='sdoc-side-panel-close'>
          <i className="sdocfont sdoc-sm-close" onClick={onClose}></i>
        </div>
      </div>
      <div
        className={classnames('sdoc-file-history-versions', { 'o-hidden': historyVersions.length === 0 } )}
        onScroll={onScrollHandler}
      >
        {historyVersions.length !== 0 && (
          <>
            {historyVersions.map((historyVersion, index) => {
              return (
                <HistoryVersion
                  key={historyVersion.commit_id}
                  index={index}
                  currentVersion={currentVersion}
                  historyVersion={historyVersion}
                  onSelectHistoryVersion={() => onSelectVersion(historyVersion, historyVersions)}
                />
              );
            })}
            {isLoading && (
              <div className="loading-more d-flex align-items-center justify-content-center w-100">
                <Loading />
              </div>
            )}
          </>
        )}
        {historyVersions.length === 0 && isLoading && (
          <div className="h-100 w-100 d-flex align-items-center justify-content-center">
            <Loading />
          </div>
        )}
        {historyVersions.length === 0 && errorMessage && (
          <div className="h-100 w-100 d-flex align-items-center justify-content-center error-message">
            {errorMessage}
          </div>
        )}
        {historyVersions.length === 0 && (!isLoading && !errorMessage) && (
          <div className="h-100 w-100 d-flex align-items-center justify-content-center empty-tip-color">
            {'No_historical_versions'}
          </div>
        )}
      </div>
      <div className="sdoc-file-history-diff-switch d-flex align-items-center">
        <Switch
          checked={isShowChanges}
          placeholder={'Show changes'}
          className="sdoc-history-show-changes w-100"
          size="small"
          onChange={() => onShowChanges(historyVersions)}
        />
      </div>
    </div>
  );
};

SidePanel.propTypes = {
  isShowChanges: PropTypes.bool,
  currentVersion: PropTypes.object,
  onSelectHistoryVersion: PropTypes.func,
  onShowChanges: PropTypes.func,
};

export default SidePanel;
