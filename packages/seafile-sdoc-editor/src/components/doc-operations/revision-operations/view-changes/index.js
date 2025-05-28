import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from '@seafile/sdoc-editor';
import PropTypes from 'prop-types';
import Switch from '../../../switch';

import './index.css';

export const REVISION_DIFF_KEY = 'diff';
export const REVISION_DIFF_VALUE = '1';

const ViewChanges = ({ isShowChanges, onViewChangesToggle: propsOnViewChangesToggle }) => {

  const { t } = useTranslation('sdoc-editor');

  useEffect(() => {
    const url = new URL(window.location.href);
    const searchParams = new URLSearchParams(url.search);
    if (!searchParams.has(REVISION_DIFF_KEY)) return;
    const firstLoadValue = searchParams.get(REVISION_DIFF_KEY);
    if (firstLoadValue === REVISION_DIFF_VALUE) {
      propsOnViewChangesToggle(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onViewChangesToggle = useCallback(() => {
    const nextIsShowChanges = !isShowChanges;
    const url = new URL(window.location.href);
    const searchParams = new URLSearchParams(url.search);
    let newParamsString = '';
    for (const item of searchParams.entries()) {
      if (item[0] !== REVISION_DIFF_KEY) {
        if (newParamsString) {
          newParamsString = newParamsString + `&${item[0]}=${item[1]}`;
        } else {
          newParamsString = `${item[0]}=${item[1]}`;
        }
      }
    }
    if (!searchParams.has(REVISION_DIFF_KEY) && nextIsShowChanges) {
      if (newParamsString) {
        newParamsString = newParamsString + `&${REVISION_DIFF_KEY}=${REVISION_DIFF_VALUE}`;
      } else {
        newParamsString = `${REVISION_DIFF_KEY}=${REVISION_DIFF_VALUE}`;
      }
    }
    const validPathName = url.pathname.endsWith('/') ? url.pathname : url.pathname + '/';
    const newURL = `${url.origin}${validPathName}${newParamsString ? '?' + newParamsString : ''}`;
    window.history.replaceState(null, null, newURL);

    propsOnViewChangesToggle(nextIsShowChanges);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShowChanges, propsOnViewChangesToggle]);

  return (
    <>
      <div id="sdoc-toggle-revision-changes-container" className="h-100 ml-4 d-flex align-items-center ">
        <Switch
          checked={isShowChanges}
          onChange={onViewChangesToggle}
          className="sdoc-toggle-revision-changes d-flex align-items-center"
        />
      </div>
      <Tooltip target="sdoc-toggle-revision-changes-container">
        {t('View_changes')}
      </Tooltip>
    </>
  );

};

ViewChanges.propTypes = {
  isShowChanges: PropTypes.bool,
  onViewChangesToggle: PropTypes.func,
};

export default ViewChanges;
