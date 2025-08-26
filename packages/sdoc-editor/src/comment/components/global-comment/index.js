import React, { useCallback, useEffect, useRef, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { Input } from 'reactstrap';
import classNames from 'classnames';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import context from '../../../context';
import { getNodeById } from '../../../extension/core';
import { usePlugins } from '../../../hooks/use-plugins';
import { DOC_COMMENT_ELEMENT_ID } from '../../constants';
import useCommentList from '../../hooks/comment-hooks/use-comment-list';
import CommentItemCollapseWrapper from '../comment-item-collapse-wrapper';
import CommentItemWrapper from '../comment-item-wrapper';
import GlobalCommentBodyHeader from './global-comment-body-header';
import GlobalCommentEditor from './global-comment-editor';
import GlobalCommentHeader from './global-comment-header';

import './index.css';

const GlobalComment = ({ editor, deleteUnseenNotifications, t }) => {
  const contentRef = useRef(null);
  const commentDetailRef = useRef(null);
  const { closePlugin } = usePlugins();
  const [activeCommentGroup, setActiveCommentGroup] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [isScrollDisplayed, setIsScrollDisplayed] = useState(false);
  const [globalCommentContent, setGlobalCommentContent] = useState(null);
  const { commentList, commentType, setCommentType, dispatch } = useCommentList();

  const detectScroll = useCallback(() => {
    if (!contentRef.current) return;
    const contentContainer = contentRef.current;
    const isShowScroll = contentContainer.scrollHeight > contentContainer.clientHeight;
    setIsScrollDisplayed(isShowScroll);
  }, []);

  const onCommentsPanelBodyScroll = useCallback((position) => {
    contentRef.current?.scrollTo({
      top: position === 'top' ? 0 : contentRef.current?.scrollHeight,
      behavior: 'smooth',
    });
  }, [contentRef]);

  useEffect(() => {
    detectScroll();
    // When a comment is updated, update the comment details page
    if (activeCommentGroup) {
      const newActiveCommentGroup = commentList.find(item => item.id === activeCommentGroup.id);
      setActiveCommentGroup(newActiveCommentGroup);
      deleteUnseenNotifications && deleteUnseenNotifications(newActiveCommentGroup);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentList, detectScroll]);

  const updateScrollPosition = useCallback(() => {
    const resolvedDom = document.querySelector('.sdoc-resolved');
    if (!resolvedDom) return;
    contentRef.current?.scrollTo({
      top: resolvedDom.offsetTop,
      behavior: 'smooth',
    });
  }, []);

  const insertComment = useCallback(async (elementId, comment) => {
    const res = await context.insertComment(comment);
    const { comment: returnComment } = res.data;
    const newComment = {
      ...comment,
      id: returnComment.id,
      user_name: returnComment.user_name,
      avatar_url: returnComment.avatar_url,
      replies: []
    };
    dispatch({ type: 'INSERT_COMMENT', payload: { element_id: elementId, comment: newComment } });
  }, [dispatch]);

  const insertDocComment = useCallback((commentDetail) => {
    // Reply to a comment
    if (activeCommentGroup && commentDetailRef.current?.insertContent) {
      commentDetailRef.current.insertContent(commentDetail);
    } else {
      // Insert global comment
      const user = context.getUserInfo();
      const elementId = DOC_COMMENT_ELEMENT_ID;
      const time = dayjs().format('YYYY-MM-DD HH:mm:ss');
      const comment = {
        comment: commentDetail,
        detail: {
          element_id: elementId,
          comment: commentDetail,
        },
        author: user.username,
        updated_at: time,
      };
      insertComment(elementId, comment);
      detectScroll();
    }
    // After the comment is inserted, scroll to the bottom
    setTimeout(() => {
      onCommentsPanelBodyScroll('bottom');
    }, 500);
  }, [activeCommentGroup, detectScroll, insertComment, onCommentsPanelBodyScroll]);

  const hiddenCommentEditor = useCallback(() => {
    setShowEditor(false);
  }, []);

  const isClickCommentPanelBody = useCallback((event) => {
    if (contentRef.current && contentRef.current.contains(event.target)) return true;
    return false;
  }, []);

  const getNodeByElementId = useCallback((elementId, ) => {
    if (elementId !== DOC_COMMENT_ELEMENT_ID) {
      return getNodeById(editor.children, elementId);
    }
    return null;
  }, [editor.children]);

  const setCurrentCommentGroup = useCallback((commentGroupId) => {
    const activeCommentGroup = commentList.find(item => item.id === commentGroupId);
    if (activeCommentGroup) {
      setActiveCommentGroup(activeCommentGroup);
      deleteUnseenNotifications && deleteUnseenNotifications(activeCommentGroup);
    } else {
      setActiveCommentGroup(null);
    }
  }, [commentList, deleteUnseenNotifications]);

  const commentEditorPlaceholder = !activeCommentGroup ? t('Enter_comment_shift_enter_for_new_line_Enter_to_send') : t('Enter_reply_shift_Enter_for_new_line_Enter_to_send');

  useEffect(() => {
    if (!contentRef.current) return;

    if (showEditor) {
      // Scroll height 63 = 99 - 36. 99 is spread height and 36.4 is default height of input editor
      contentRef.current.scrollTop += 63;
    } else {
      contentRef.current.scrollTop -= 63;
    }
  }, [showEditor]);

  return (
    <div className="sdoc-comment-drawer">
      <div className="comments-panel-wrapper">
        <GlobalCommentHeader toggle={closePlugin} activeCommentGroup={activeCommentGroup} setCurrentCommentGroup={setCurrentCommentGroup} />
        <div className="comments-panel-body">
          {!activeCommentGroup && (
            <GlobalCommentBodyHeader commentList={commentList} commentType={commentType} setCommentType={setCommentType} />
          )}
          <div ref={contentRef} className="comments-panel-body__content">
            <div id="global-comment-list-container" className="sdoc-comment-list-container">
              {!activeCommentGroup && Array.isArray(commentList) && commentList.map(comment => {
                const replyCount = comment.replies?.length;
                const latestReply = comment.replies?.length > 0 ? comment.replies[comment.replies.length - 1] : null;
                const elementId = comment.detail.element_id;
                const element = getNodeByElementId(elementId);
                return (
                  <CommentItemCollapseWrapper
                    key={comment.id}
                    editor={editor}
                    element={element}
                    topLevelComment={comment}
                    replyCount={replyCount}
                    latestReply={latestReply}
                    setCurrentCommentGroup={setCurrentCommentGroup}
                    deleteUnseenNotifications={deleteUnseenNotifications}
                  />
                );
              })}
              {activeCommentGroup && (
                <CommentItemWrapper
                  key={activeCommentGroup.id}
                  editor={editor}
                  element={getNodeByElementId(activeCommentGroup.detail.element_id)}
                  container="global-comment-list-container"
                  commentDetailRef={commentDetailRef}
                  comment={activeCommentGroup}
                  isGlobalComment={true}
                  isActive={true}
                  updateScrollPosition={updateScrollPosition}
                  isClickCommentPanelBody={isClickCommentPanelBody}
                  setCurrentCommentGroup={setCurrentCommentGroup}
                />
              )}
            </div>
          </div>
          <div className={classNames('global-comment-input-wrapper', { 'active': globalCommentContent?.trim() } )}>
            {!showEditor && (
              <Input
                value={globalCommentContent?.trim() ? '.....' : ''}
                readOnly={true}
                placeholder={commentEditorPlaceholder}
                onFocus={() => {
                  setShowEditor(true);
                }}
              />
            )}
            {showEditor && (
              <GlobalCommentEditor
                globalCommentContent={globalCommentContent}
                isScrollDisplayed={isScrollDisplayed}
                type={activeCommentGroup ? 'replay' : 'comment'}
                hiddenCommentEditor={hiddenCommentEditor}
                insertDocComment={insertDocComment}
                onContentChange={(content) => {
                  setGlobalCommentContent(content);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

GlobalComment.propTypes = {
  editor: PropTypes.object,
};

export default withTranslation('sdoc-editor')(GlobalComment);
