import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { withTranslation } from 'react-i18next';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import Tooltip from '../components/tooltip';
import { INTERNAL_EVENT, SDOC_STORAGE } from '../constants';
import context from '../context';
import EventBus from '../utils/event-bus';
import OutlineItem from './outline-item';

import './style.css';

const propTypes = {
  doc: PropTypes.array.isRequired,
};

export const getOutlineSetting = () => {
  const currentValue = localStorage.getItem(SDOC_STORAGE);
  const config = currentValue ? JSON.parse(currentValue) : {};
  const { outlineOpen = false } = config;
  return outlineOpen;
};

export const setOutlineSetting = (isShown) => {
  const currentValue = localStorage.getItem(SDOC_STORAGE);
  const config = currentValue ? JSON.parse(currentValue) : {};
  config['outlineOpen'] = isShown;
  localStorage.setItem(SDOC_STORAGE, JSON.stringify(config));
};

const SDocOutline = ({ scrollLeft, doc, t }) => {

  const [isShown, setIsShown] = useState(false);
  const isSdocRevision = context.getSetting('isSdocRevision');

  const updateOutlineState = useCallback((state) => {
    setIsShown(state);
    setOutlineSetting(state);
    const eventBus = EventBus.getInstance();
    eventBus.dispatch(INTERNAL_EVENT.OUTLINE_STATE_CHANGED);
  }, []);

  useEffect(() => {
    const outlineState = getOutlineSetting();
    updateOutlineState(outlineState);
  }, [updateOutlineState]);

  const toggleShow = useCallback(() => {
    updateOutlineState(!isShown);
  }, [isShown, updateOutlineState]);

  const list = useMemo(() => {
    return doc?.filter(item => ['header1', 'header2', 'header3'].includes(item.type));
  }, [doc]);

  return (
    <div className={classNames('sdoc-outline-wrapper', { active: isShown })} style={{ left: -scrollLeft }}>
      <div className="sdoc-outline-container">
        {isShown && (
          <>
            <div className="sdoc-outline-header">
              <h2 className="sdoc-outline-header__title">{t('Outline')}</h2>
              <span className="sdoc-outline-header__close sdocfont sdoc-sm-close" onClick={toggleShow}></span>
            </div>
            {list.length === 0 && (
              <p className="mt-4 text-secondary">{t('Headings_you_add_to_the_document_will_appear_here')}</p>
            )}
            {list.length > 0 && (
              <div className="sdoc-outline-list-container">
                {list.map((item, index) => (
                  <OutlineItem key={index} item={item} isSdocRevision={isSdocRevision} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
      {!isShown && (
        <>
          <span
            id="sdoc-outline-menu"
            className="sdoc-outline-menu sdocfont sdoc-outline"
            onClick={toggleShow}
          >
          </span>
          <Tooltip placement="right" target="sdoc-outline-menu">
            {t('Outline')}
          </Tooltip>
        </>
      )}
    </div>
  );
};

SDocOutline.propTypes = propTypes;

export default withTranslation('sdoc-editor')(SDocOutline);
