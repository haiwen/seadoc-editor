import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import { withTranslation } from 'react-i18next';
import { Node } from '@seafile/slate';
import { ReactEditor } from '@seafile/slate-react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import processor from '../../slate-convert/md-to-html';
import { COMMENT_URL_CLASSNAME } from '../constants';
import { getCommentedTextsByElementId } from '../helper';
import { useNotificationContext } from '../hooks/notification-hooks';

const CommentItemCollapseWrapper = ({ element, topLevelComment, latestReply, editor, replyCount, setCurrentCommentGroup, t, deleteUnseenNotifications }) => {
  const scrollRef = useRef(document.querySelector('.sdoc-scroll-container'));
  const { notificationsInfo } = useNotificationContext();
  const [commentContent, setCommentContent] = useState('');
  const [replyContent, setReplyContent] = useState('');

  const CommentItemListRef = useRef();
  const timeoutRef = useRef(null);

  const isUnseen = notificationsInfo.notifications_map[`sdoc_notification_${topLevelComment.id}`] ? true : false;
  const isReplayUnseen = useMemo(() => {
    if (!latestReply) return false;
    const isUnseen = notificationsInfo.notifications_map[`sdoc_notification_${topLevelComment.id}_${latestReply.id}`] ? true : false;
    return isUnseen;
  }, [latestReply, notificationsInfo.notifications_map, topLevelComment.id]);

  useEffect(() => {
    if (!CommentItemListRef.current) return;
    if (!(isUnseen || isReplayUnseen)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting && entry.intersectionRatio === 1;
        if (isVisible) {
          if (!timeoutRef.current) {
            timeoutRef.current = setTimeout(() => {
              deleteUnseenNotifications && deleteUnseenNotifications(topLevelComment);
              timeoutRef.current = null;
            }, 3000);
          } else {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
          }
        }
      },
      { threshold: [1.0] }
    );

    if (CommentItemListRef.current) observer.observe(CommentItemListRef.current);

    return () => {
      observer.disconnect();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [deleteUnseenNotifications, isReplayUnseen, isUnseen, topLevelComment]);

  useEffect(() => {
    const initCommentContent = async () => {
      const htmlString = await processor.process(topLevelComment.comment);
      setCommentContent(String(htmlString));
    };

    initCommentContent();
  }, [topLevelComment.comment]);

  useEffect(() => {
    const initReplyContent = async () => {
      if (!latestReply) {
        setReplyContent('');
        return;
      }
      let mdString = '';
      if (latestReply.reply) {
        mdString = latestReply.reply;
      } else {
        mdString = '';
      }
      const htmlString = await processor.process(mdString);
      setReplyContent(String(htmlString));
    };

    initReplyContent();
  }, [latestReply, t]);

  const handleScrollToArticle = useCallback( (e) => {
    e.stopPropagation();
    const dom = ReactEditor.toDOMNode(editor, element);
    const headerHeight = 56 + 37;
    scrollRef.current.scrollTo({ top: dom.offsetTop - headerHeight, behavior: 'smooth' });
  }, [editor, element, scrollRef]);

  const onItemClick = useCallback((event) => {
    event.stopPropagation();
    if (event.target.className === COMMENT_URL_CLASSNAME) return;
    setCurrentCommentGroup(topLevelComment.id);
  }, [setCurrentCommentGroup, topLevelComment.id]);

  return (
    <div
      id={`comment-item-wrapper_${topLevelComment.id}`}
      className={classNames(
        'comment-collapse-wrapper',
        'comment-ui-container',
        { 'sdoc-resolved': topLevelComment.resolved, 'd-flex flex-column': element }
      )}
      onClick={onItemClick}
    >
      {topLevelComment.detail.element_id_list && (
        <div className={classNames('comment-item-selected-text-container', { 'detail-context-comment': topLevelComment.detail.element_id_list?.length > 0 })} onClick={handleScrollToArticle}>
          <i className="sdocfont sdoc-comment-quote mr-2"></i>
          <div className="comment-item-selected-text">
            {topLevelComment.detail.element_id_list.map((elementId, index) => {
              return (<div className='context-comment-item-selected-text' key={index}>{getCommentedTextsByElementId(elementId, topLevelComment.detail.text_comment_id)}</div>);
            })}
          </div>
        </div>
      )}
      {element && (
        <div className="comment-item-selected-text-container" onClick={handleScrollToArticle}>
          <i className="sdocfont sdoc-comment-quote mr-2"></i>
          <div className="comment-item-selected-text">{Node.string(element)}</div>
        </div>
      )}
      <div className="comment-item-list" ref={CommentItemListRef}>
        <div className='comment-item'>
          <div className='comment-header'>
            <div className='comment-author'>
              <span className='comment-author__avatar'><img alt='' src={topLevelComment.avatar_url} /></span>
              <span className='comment-author__info'>
                <span className='name'>{topLevelComment.user_name}</span>
                <span className='time'>
                  {dayjs(topLevelComment.updated_at).format('MM-DD HH:mm')}
                  {topLevelComment?.resolved && (<span className='comment-success-resolved sdocfont sdoc-mark-as-resolved'/>)}
                </span>
              </span>
            </div>
            {(isUnseen || isReplayUnseen) && (
              <div className="sdoc-unread-message-tip"></div>
            )}
          </div>
          <div className='comment-content'>
            <div dangerouslySetInnerHTML={{ __html: commentContent }}/>
          </div>
          {replyCount !== 0 && (
            <div className='comment-footer'>
              <span className='comments-count'>
                <i className='sdocfont sdoc-comments'/>
                <span className='comments-count-number'>{replyCount}</span>
              </span>
              <div className='comment-author'>
                <span className='comment-author__avatar'><img alt='' src={latestReply.avatar_url} /></span>
                <div className='comment-author__latest-reply'>
                  <div dangerouslySetInnerHTML={{ __html: replyContent }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

CommentItemCollapseWrapper.propTypes = {
  editor: PropTypes.object,
  element: PropTypes.object,
  topLevelComment: PropTypes.object,
  replyCount: PropTypes.number,
  latestReply: PropTypes.object,
  setCurrentCommentGroup: PropTypes.func,
};

export default withTranslation('sdoc-editor')(CommentItemCollapseWrapper);
