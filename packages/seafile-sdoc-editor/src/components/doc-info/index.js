import React, { useCallback } from 'react';
import { withTranslation } from 'react-i18next';
import { EventBus, Tooltip, context } from '@seafile/sdoc-editor';
import PropTypes from 'prop-types';
import RevisionAvatar from '../../assets/images/revision-avatar.png';
import freezedImg from '../../assets/images/sdoc-freezed.png';
import { EXTERNAL_EVENT } from '../../constants';
import { DateUtils, decodeHtmlEntities } from '../../utils';
import DraftDropdown from '../draft-dropdown';
import TipMessage from '../tip-message';
import './index.css';

const DocInfo = ({ t, isStarred, isDraft, isEditMode, isPublished = false, initContext = false }) => {
  initContext && context.initApi();

  const isSdocRevision = context.getSetting('isSdocRevision');
  const docName = context.getSetting('docName');
  const { isShowInternalLink, isStarIconShown, isFreezed, mobileLogin } = context.getSettings();

  const onInternalLinkClick = useCallback(() => {
    const eventBus = EventBus.getInstance();
    if (isSdocRevision) {
      eventBus.dispatch(EXTERNAL_EVENT.INTERNAL_LINK_CLICK, { internalLink: window.location.href });
      return;
    }
    eventBus.dispatch(EXTERNAL_EVENT.INTERNAL_LINK_CLICK);
  }, [isSdocRevision]);

  const toggleStar = useCallback(() => {
    const eventBus = EventBus.getInstance();
    eventBus.dispatch(EXTERNAL_EVENT.TOGGLE_STAR);
  }, []);

  const jumpToSourceDoc = useCallback(() => {
    const originFileURL = context.getSetting('originFileURL');
    window.open(originFileURL, '_blank');
  }, []);

  const docInfo = (
    <>
      {isDraft && <DraftDropdown />}
      {(isStarIconShown && !mobileLogin) && (
        <>
          <button id="sdoc-starred-btn" className={`doc-icon sdocfont ${isStarred ? 'sdoc-starred' : 'sdoc-unstarred'} border-0 p-0 bg-transparent`}
            aria-label={isStarred ? t('Unstar') : t('Star')}
            onClick={toggleStar}>
          </button>
          <Tooltip target="sdoc-starred-btn">{isStarred ? t('Starred') : t('Unstarred')}</Tooltip>
        </>
      )}
      {(isShowInternalLink && !mobileLogin) && (
        <span id="sdoc-internal-link" className='doc-icon'>
          <span className='internal-link sdocfont sdoc-link' onClick={onInternalLinkClick}></span>
          <Tooltip target="sdoc-internal-link">{t('Internal_link')}</Tooltip>
        </span>
      )}
      {isFreezed && (
        <span id="sdoc-doc-frozen" className="doc-icon">
          <img src={freezedImg} alt={t('Document_frozen')} width='16px'/>
          <Tooltip target="sdoc-doc-frozen">{t('Document_frozen')}</Tooltip>
        </span>
      )}
      <TipMessage isEditMode={isEditMode} />
    </>
  );

  if (!isSdocRevision) {
    return (
      <div className='doc-info'>
        <div className='doc-name'>{docName}</div>
        {docInfo}
      </div>
    );
  }

  const revisionCreatedAt = context.getSetting('revisionCreatedAt');
  const oldDocName = decodeHtmlEntities(context.getSetting('originFilename'));
  const revisionId = context.getSetting('revisionId');

  return (
    <div className="sdoc-revision-info doc-info">
      <div className="sdoc-revision-avatar"><img src={RevisionAvatar} alt='' /></div>
      <div className="sdoc-revision-detail">
        <div className="doc-name-container d-flex align-items-center justify-content-start w-100">
          <div className="doc-name">{oldDocName}</div>
          <div className="sdoc-revision-order">{t('Revision') + ' ' + revisionId}</div>
          {isShowInternalLink && (
            <span id="doc-internal-link" className='doc-icon'>
              <span className='internal-link sdocfont sdoc-link' onClick={onInternalLinkClick}></span>
              <Tooltip target="doc-internal-link">{t('Internal_link')}</Tooltip>
            </span>
          )}
          {isPublished && (
            <>
              <div className="sdoc-revision-published-tip">{t('Published')}</div>
              <div id="sdoc-revision-source-doc" className="sdoc-revision-source-doc" onClick={jumpToSourceDoc}>
                <i className="sdocfont sdoc-jump-to"></i>
                <Tooltip target="sdoc-revision-source-doc">{t('Jump_to_original_doc')}</Tooltip>
              </div>
            </>
          )}
          {!isPublished && <TipMessage isEditMode={isEditMode} />}
        </div>
        <div className="doc-state">
          <span className="mr-2">{t('Created_at')}</span>
          <span>{DateUtils.format(revisionCreatedAt, 'YYYY-MM-DD HH:MM')}</span>
        </div>
      </div>
    </div>
  );
};

DocInfo.propTypes = {
  isStarred: PropTypes.bool,
  isDraft: PropTypes.bool,
  isEditMode: PropTypes.bool,
  isPublished: PropTypes.bool,
  initContext: PropTypes.bool,
  t: PropTypes.func,
};

export default withTranslation('sdoc-editor')(DocInfo);
