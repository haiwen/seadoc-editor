import React, { useCallback } from 'react';
import { withTranslation } from 'react-i18next';
import { EventBus, context } from '@seafile/sdoc-editor';
import PropTypes from 'prop-types';
import RevisionAvatar from '../../assets/images/revision-avatar.png';
import freezedImg from '../../assets/images/sdoc-freezed.png';
import { EXTERNAL_EVENT } from '../../constants';
import { DateUtils } from '../../utils';
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
        <button className={`doc-icon sdocfont ${isStarred ? 'sdoc-starred' : 'sdoc-unstarred'} border-0 p-0 bg-transparent`}
          title={isStarred ? t('Starred') : t('Unstarred')}
          aria-label={isStarred ? t('Unstar') : t('Star')}
          onClick={toggleStar}>
        </button>
      )}
      {(isShowInternalLink && !mobileLogin) && (
        <span className='doc-icon'>
          <span className='internal-link sdocfont sdoc-link' title={t('Internal_link')} onClick={onInternalLinkClick}></span>
        </span>
      )}
      {isFreezed && (
        <span className="doc-icon">
          <img src={freezedImg} alt={t('Document_frozen')} title={t('Document_frozen')} width='16px'/>
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
  const oldDocName = context.getSetting('originFilename');
  const revisionId = context.getSetting('revisionId');

  return (
    <div className="sdoc-revision-info doc-info">
      <div className="sdoc-revision-avatar"><img src={RevisionAvatar} alt='' /></div>
      <div className="sdoc-revision-detail">
        <div className="doc-name-container d-flex align-items-center justify-content-start w-100">
          <div className="doc-name">{oldDocName}</div>
          <div className="sdoc-revision-order">{t('Revision') + ' ' + revisionId}</div>
          {isShowInternalLink && (
            <span className='doc-icon'>
              <span className='internal-link sdocfont sdoc-link' title={t('Internal_link')} onClick={onInternalLinkClick}></span>
            </span>
          )}
          {isPublished && (
            <>
              <div className="sdoc-revision-published-tip">{t('Published')}</div>
              <div className="sdoc-revision-source-doc" title={t('Jump_to_original_doc')} onClick={jumpToSourceDoc}>
                <i className="sdocfont sdoc-jump-to"></i>
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
