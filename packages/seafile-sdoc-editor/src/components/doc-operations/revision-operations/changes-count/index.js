import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip, getTopLevelChanges, getMergedChanges } from '@seafile/sdoc-editor';

import './index.css';

const ChangesCount = ({ allChanges }) => {
  const { t } = useTranslation('sdoc-editor');
  const [currentDiffIndex, setDiffIndex] = useState(0);
  const [changes, setChanges] = useState([]);
  const intervalRef = useRef();

  useEffect(() => {
    // Article rendering is delayed, so we need to wait for the Article to render before we can get the changes
    new Promise((resolve) => {
      intervalRef.current = setInterval(() => {
        const article = document.querySelector('.article');
        if (article) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          resolve();
        }
      }, 100);
    } ).then(() => {
      if (allChanges.changes.length !== 0) {
        const topLevelChanges = getTopLevelChanges(allChanges.changes);
        const changes = getMergedChanges(topLevelChanges, allChanges.value);
        setChanges(changes);
      }
    });
    return () => {
      intervalRef.current && clearInterval(intervalRef.current);
    };
  }, [allChanges]);

  const jumpToElement = useCallback((currentDiffIndex) => {
    setDiffIndex(currentDiffIndex);
    const change = changes[currentDiffIndex];
    const changeElement = document.querySelectorAll(`[data-id="${change}"]`)[0];
    if (changeElement) {
      const scrollContainer = document.getElementById('sdoc-scroll-container');
      if (scrollContainer) {
        scrollContainer.scrollTop = changeElement.offsetTop - 10;
      }
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changes, currentDiffIndex]);

  const lastChange = useCallback(() => {
    if (currentDiffIndex === 0) {
      jumpToElement(changes.length - 1);
      return;
    }
    jumpToElement(currentDiffIndex - 1);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changes, currentDiffIndex]);

  const nextChange = useCallback(() => {
    if (currentDiffIndex === changes.length - 1) {
      jumpToElement(0);
      return;
    }
    jumpToElement(currentDiffIndex + 1);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changes, currentDiffIndex]);

  if (!Array.isArray(changes) || changes.length === 0) {
    return (
      <div className="sdoc-revision-changes-container d-flex align-items-center pl-2 pr-2 ml-4">
        {t('No_changes')}
      </div>
    );
  }

  const changesCount = changes.length;

  return (
    <div className="sdoc-revision-changes-container d-flex align-items-center ml-4">
      <div className="sdoc-revision-changes-tip d-flex align-items-center justify-content-center pl-2 pr-2">
        {`${t('Changes')} ${currentDiffIndex + 1}/${changesCount}`}
      </div>
      <div className="sdoc-revision-changes-divider"></div>
      <div
        className="sdoc-revision-changes-last d-flex align-items-center justify-content-center"
        id="sdoc-revision-changes-last"
        onClick={lastChange}
      >
        <i className="sdocfont sdoc-next-page" style={{ transform: 'rotate(-90deg)' }}></i>
      </div>
      <div className="sdoc-revision-changes-divider"></div>
      <div
        className="sdoc-revision-changes-next d-flex align-items-center justify-content-center"
        id="sdoc-revision-changes-next"
        onClick={nextChange}
      >
        <i className="sdocfont sdoc-previous-page" style={{ transform: 'rotate(-90deg)' }}></i>
      </div>
      <Tooltip placement="bottom" target="sdoc-revision-changes-last">
        {t('Last_modification')}
      </Tooltip>
      <Tooltip placement="bottom" target="sdoc-revision-changes-next">
        {t('Next_modification')}
      </Tooltip>
    </div>
  );

};

export default ChangesCount;
