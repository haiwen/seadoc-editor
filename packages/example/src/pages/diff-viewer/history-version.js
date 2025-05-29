import dayjs from 'dayjs';
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

const HistoryVersion = ({ currentVersion, historyVersion, onSelectHistoryVersion }) => {
  const onClick = useCallback(() => {
    if (currentVersion.commit_id === historyVersion.commit_id) return;
    onSelectHistoryVersion(historyVersion);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!currentVersion || !historyVersion) return null;
  const { ctime, commit_id, creator_name, name } = historyVersion;
  const isHighlightItem = commit_id === currentVersion.commit_id;

  return (
    <li
      className={`history-list-item ${isHighlightItem ? 'item-active' : ''}`}
      onClick={onClick}
    >
      <div className="history-info">
        <div className="name">{name}</div>
        <div className="time">{dayjs(ctime).format('YYYY-MM-DD HH:mm')}</div>
        <div className="owner">
          <span className="squire-icon"></span>
          <span>{creator_name}</span>
        </div>
      </div>
    </li>
  );

};

HistoryVersion.propTypes = {
  index: PropTypes.number,
  currentVersion: PropTypes.object.isRequired,
  historyVersion: PropTypes.object,
  onSelectHistoryVersion: PropTypes.func.isRequired,
};

export default HistoryVersion;
