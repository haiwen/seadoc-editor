import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown, DropdownItem, DropdownMenu } from 'reactstrap';
import PropTypes from 'prop-types';
import Tooltip from '../../../components/tooltip';
import { INTERNAL_EVENT } from '../../../constants';
import context from '../../../context';
import EventBus from '../../../utils/event-bus';
import { eventStopPropagation } from '../../../utils/mouse-event';
import { COMMENT_TYPES } from '../../constants';

const CommentTypeDropdownItem = ({ type, setCommentType, commentType }) => {
  const { t } = useTranslation('sdoc-editor');

  const handleCommentTypeChanged = useCallback((event, type) => {
    eventStopPropagation(event);
    setCommentType(type);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isSelected = commentType === type;

  return (
    <DropdownItem className='sdoc-dropdown-menu-item' tag={'div'} onClick={(event) => handleCommentTypeChanged(event, type)}>
      {isSelected && <i className="sdoc-file-checked sdocfont sdoc-check-mark"></i>}
      {t(type)}
    </DropdownItem>
  );
};

const GlobalCommentHeader = ({ toggle, activeCommentGroup, setCurrentCommentGroup, commentType, setCommentType, commentList }) => {
  const { t } = useTranslation('sdoc-editor');
  const panelHeaderRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (panelHeaderRef.current) {
      setIsMounted(true);
    }
  }, []);

  const goBack = useCallback((event) => {
    eventStopPropagation(event);
    setCurrentCommentGroup(null);
  }, [setCurrentCommentGroup]);

  const toggleReadAll = useCallback(async (event) => {
    eventStopPropagation(event);
    try {
      await context.readAllNotifications();
      const res = await context.listUnseenNotifications();
      const notifications = res.data.notifications;
      const eventBus = EventBus.getInstance();
      eventBus.dispatch(INTERNAL_EVENT.UNSEEN_NOTIFICATIONS_COUNT, notifications?.length);
      eventBus.dispatch(INTERNAL_EVENT.NEW_NOTIFICATION);
      eventBus.dispatch(INTERNAL_EVENT.CLEAR_NOTIFICATION);
    } catch (error) {
      //
    }
  }, []);

  return (
    <div className="comments-panel-header">
      <div className="comments-panel-header-left">
        {activeCommentGroup && (
          <div className="goback sdoc-icon-btn" onClick={goBack}>
            <i className="sdocfont sdoc-previous-page" style={{ transform: 'scale(1.2)' }}></i>
          </div>
        )}
        <span className="title">{activeCommentGroup ? t('Comment_details') : `${t(commentType)}${commentList.length > 0 ? ` (${commentList.length})` : ''}`}</span>
      </div>
      <div ref={panelHeaderRef} className="comments-panel-header-right">
        {!activeCommentGroup && (
          <div id='comment-types'
            className="sdoc-icon-btn"
            onClick={() => setDropdownOpen(!isDropdownOpen)}
          >
            <i className="sdocfont sdoc-filter1"></i>
            {isMounted && (
              <Tooltip target="comment-types">
                {t('Filter')}
              </Tooltip>)}
            <Dropdown isOpen={isDropdownOpen} toggle={() => setDropdownOpen(!isDropdownOpen)}>
              <DropdownMenu className='sdoc-dropdown-menu sdoc-comment-filter-dropdown' container="comment-types">
                <CommentTypeDropdownItem type={COMMENT_TYPES.ALL} setCommentType={setCommentType} commentType={commentType} />
                <CommentTypeDropdownItem type={COMMENT_TYPES.RESOLVED} setCommentType={setCommentType} commentType={commentType} />
                <CommentTypeDropdownItem type={COMMENT_TYPES.UNRESOLVED} setCommentType={setCommentType} commentType={commentType} />
              </DropdownMenu>
            </Dropdown>
          </div>
        )}
        {!activeCommentGroup && (
          <div
            id='sdoc-read-all-btn'
            className="sdoc-icon-btn"
            onClick={toggleReadAll}
          >
            <i className="sdocfont sdoc-all-read"></i>
            {isMounted && (
              <Tooltip target="sdoc-read-all-btn">
                {t('Mark_all_as_read')}
              </Tooltip>)}
          </div>
        )}
        <div className="sdoc-icon-btn" onClick={toggle}>
          <i className="sdocfont sdoc-sm-close"></i>
        </div>
      </div>
    </div>
  );

};

GlobalCommentHeader.propTypes = {
  toggle: PropTypes.func.isRequired,
  activeCommentGroup: PropTypes.object,
  setCurrentCommentGroup: PropTypes.func,
};

export default GlobalCommentHeader;
