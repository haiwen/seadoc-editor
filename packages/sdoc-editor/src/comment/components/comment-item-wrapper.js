import React, { useCallback, useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Node } from '@seafile/slate';
import { ReactEditor } from '@seafile/slate-react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import context from '../../context';
import { COMMENT_URL_CLASSNAME } from '../constants';
import { getCommentedTextsByElementId, getPrimaryElementId, updateCommentedElementsAttrs } from '../helper';
import { useCommentContext } from '../hooks/comment-hooks/use-comment-context';
import CommentDeletePopover from './comment-delete-popover';
import CommentItemContent from './comment-item-content';
import CommentItemReply from './comment-item-reply';

const CommentItemWrapper = forwardRef(({
  container = 'sdoc-comment-list-container',
  editor,
  element,
  isActive,
  comment,
  commentsDetail,
  setIsClickedContextComment,
  setIsCommentPanelVisible,
  onSelectElement,
  isGlobalComment,
  commentDetailRef,
  updateScrollPosition,
  setCurrentCommentGroup,
  onCommentClick,
  isEmptyComment,
  isCollapseCommentEditor,
  isClickedContextComment = false,
  closeComment
}, ref) => {
  const listRef = useRef(null);
  const { dispatch } = useCommentContext();
  const scrollRef = useRef(document.querySelector('.sdoc-scroll-container'));
  const [isShowDeletePopover, setIsShowDeletePopover] = useState(false);
  const commentOpToolsId = `commentOpTools_${comment?.id}`;
  const style = !isGlobalComment && isCollapseCommentEditor ? { maxHeight: '341px' } : {};

  const deleteComment = useCallback(async (commentId) => {
    await context.deleteComment(commentId);

    let { element_id: elementId, element_id_list } = comment.detail;
    if (element_id_list) {
      elementId = element_id_list[0];
      updateCommentedElementsAttrs(element_id_list, editor, comment.detail?.text_comment_id, false, true);
    }
    dispatch({ type: 'DELETE_COMMENT', payload: { element_id: elementId, comment_id: commentId } });
    closeComment && closeComment();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comment.detail, dispatch, editor]);

  const updateComment = useCallback(async (commentId, newComment) => {
    await context.updateComment(commentId, newComment);
    const elementId = getPrimaryElementId(comment.detail);
    dispatch({ type: 'UPDATE_COMMENT', payload: { element_id: elementId, comment_id: commentId, comment: newComment } });
  }, [comment.detail, dispatch]);

  const updateCommentState = useCallback(async (commentId, newComment) => {
    const time = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const user = context.getUserInfo();
    const reply = {
      type: 'comment',
      reply: newComment.resolved,
      updated_at: time,
      author: user.username,
    };

    // When updating comment status, add a new reply
    const res = await context.insertReply(commentId, reply);
    const { reply: returnReply } = res.data;
    const newReply = {
      ...reply,
      id: returnReply.id,
      reply: returnReply.reply,
      user_name: returnReply.user_name,
      avatar_url: returnReply.avatar_url,
    };
    const elementId = getPrimaryElementId(comment.detail);

    if (newComment.resolved === true) {
      const resolvedComment = commentsDetail ? Object.values(commentsDetail).find(comments => comments.id === commentId) : comment;
      if (resolvedComment.detail.element_id_list) {
        updateCommentedElementsAttrs(resolvedComment.detail.element_id_list, editor, resolvedComment.detail?.text_comment_id, !newComment.resolved);
        closeComment && closeComment();
      }
      if (commentsDetail && Object.values(commentsDetail).length === 1) {
        setIsClickedContextComment(false);
        setIsCommentPanelVisible(false);
      }
    }

    if (newComment.resolved === false && comment.detail.element_id_list) {
      const unresolvedComment = commentsDetail ? Object.values(commentsDetail).find(comments => comments.id === commentId) : comment;
      if (unresolvedComment.detail.element_id_list) {
        updateCommentedElementsAttrs(unresolvedComment.detail.element_id_list, editor, unresolvedComment.detail?.text_comment_id, !newComment.resolved);
      }
    }

    dispatch({ type: 'INSERT_REPLY', payload: { element_id: elementId, comment_id: commentId, reply: newReply } });

    // Modify comment status
    await context.updateComment(commentId, newComment);
    dispatch({ type: 'UPDATE_COMMENT_STATE', payload: { element_id: elementId, comment_id: commentId, comment: newComment } });

    // If the status of the comment is set to resolved, the page jumps to the position of the comment
    if (!isClickedContextComment && newComment.resolved === true) {
      setTimeout(() => {
        updateScrollPosition && updateScrollPosition();
      }, 100);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comment, commentsDetail, dispatch, editor, isClickedContextComment, setIsClickedContextComment, setIsCommentPanelVisible, updateScrollPosition]);

  const insertReply = useCallback(async (commentId, replies) => {
    const elementId = getPrimaryElementId(comment.detail);
    for (let i = 0; i < replies.length; i++) {
      const reply = replies[i];
      const res = await context.insertReply(commentId, reply);
      const { reply: returnReply } = res.data;
      const newReply = {
        ...reply,
        id: returnReply.id,
        comment_id: commentId,
        reply: returnReply.reply,
        user_name: returnReply.user_name,
        avatar_url: returnReply.avatar_url,
      };
      dispatch({ type: 'INSERT_REPLY', payload: { element_id: elementId, comment_id: commentId, reply: newReply } });
    }

    // If the number of replies is greater than one, it means that the comment needs to be resubmitted and the status of the comment should be modified
    if (replies.length > 1) {
      const newComment = { resolved: false };
      await context.updateComment(commentId, newComment);
      dispatch({ type: 'UPDATE_COMMENT_STATE', payload: { element_id: elementId, comment_id: commentId, comment: newComment } });
    }
    setTimeout(() => {
      const options = {
        top: 10000,
        behavior: 'smooth',
      };
      listRef.current.scrollTo(options);
    }, 0);
  }, [comment.detail, dispatch]);

  const insertContent = useCallback((content) => {
    const user = context.getUserInfo();
    const replies = [];

    // The comment has already been resolved, when adding a new reply, resubmit the comment
    if (comment.resolved) {
      const time = dayjs().format('YYYY-MM-DD HH:mm:ss');
      const stateChangeReply = {
        type: 'comment',
        reply: false,
        updated_at: time,
        author: user.username,
      };
      replies.push(stateChangeReply);
    }

    // User added reply
    const time = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const reply = {
      type: 'reply',
      reply: content,
      updated_at: time,
      author: user.username,
    };
    replies.push(reply);
    insertReply(comment.id, replies);
  }, [comment.id, comment.resolved, insertReply]);

  useImperativeHandle(ref ? ref : commentDetailRef, () => ({
    insertContent,
  }));

  const deleteReply = useCallback(async (replyId) => {
    const commentId = comment.id;
    const elementId = getPrimaryElementId(comment.detail);
    await context.deleteReply(commentId, replyId);
    dispatch({ type: 'DELETE_REPLY', payload: { element_id: elementId, comment_id: commentId, reply_id: replyId } });
  }, [comment.detail, comment.id, dispatch]);

  const updateReply = useCallback(async (replyId, newReply) => {
    const commentId = comment.id;
    const elementId = getPrimaryElementId(comment.detail);
    await context.updateReply(commentId, replyId, newReply);
    dispatch({ type: 'UPDATE_REPLY', payload: { element_id: elementId, comment_id: commentId, reply_id: replyId, reply: newReply } });
  }, [comment.detail, comment.id, dispatch]);

  const onItemClick = useCallback((event) => {
    if (event.target.className === COMMENT_URL_CLASSNAME) return;
    onCommentClick && onCommentClick(comment);
  }, [comment, onCommentClick]);

  const onDeleteComment = useCallback(() => {
    setIsShowDeletePopover(true);
  }, []);

  const _deleteComment = useCallback(() => {
    deleteComment(comment.id);
    setIsShowDeletePopover(false);
    setCurrentCommentGroup && setCurrentCommentGroup(null);
    if (isClickedContextComment) {
      if (Object.values(commentsDetail).length === 1) {
        setIsClickedContextComment(false);
        setIsCommentPanelVisible(false);
      } else {
        const newCommentIdArray = Object.values(commentsDetail).filter((item) => item.id !== comment.id).map((item) => item.detail.text_comment_id);
        onSelectElement(newCommentIdArray, true);
      }
    }
  }, [comment.id, commentsDetail, deleteComment, isClickedContextComment, onSelectElement, setCurrentCommentGroup, setIsClickedContextComment, setIsCommentPanelVisible]);

  useEffect(() => {
    if (!isActive) {
      setIsShowDeletePopover(false);
    }
  }, [isActive]);

  const className = classNames('comment-ui-container', {
    'active': isActive,
    'sdoc-resolved': comment?.resolved,
    'd-flex flex-column': element,
    'global-comment-item-detail-wrapper': isGlobalComment,
    'comment-item-detail-wrapper': !isGlobalComment
  });

  const handleScrollToArticle = useCallback((e) => {
    e.stopPropagation();
    if (!element) return;
    const dom = ReactEditor.toDOMNode(editor, element);
    const headerHeight = 56 + 37;
    scrollRef.current.scrollTo({ top: dom.offsetTop - headerHeight, behavior: 'smooth' });
  }, [editor, element, scrollRef]);

  const newCommentId = (isClickedContextComment && comment?.detail.element_id_list) ? comment?.detail.element_id_list[0] : comment?.id;

  return (
    <div id={`comment-item-wrapper_${newCommentId}`} className={className} onClick={onItemClick}>
      {element && (
        <div className="comment-item-selected-text-container" onClick={handleScrollToArticle}>
          <i className="sdocfont sdoc-comment-quote mr-2"></i>
          <div className="comment-item-selected-text">{Node.string(element)}</div>
        </div>
      )}
      {!isEmptyComment && (
        <div ref={listRef} className="comment-item-list" style={style}>
          {comment.detail.element_id_list && !isGlobalComment && (
            <div className="context-comment-item-selected-text-container">
              <i className="sdocfont sdoc-comment-quote mr-2"></i>
              <div className="context-comment-items">
                {comment.detail.element_id_list.map((elementId, index) => {
                  return (<div className="context-comment-item-selected-text" key={index}>{getCommentedTextsByElementId(elementId, comment.detail.text_comment_id)}</div>);
                })}
              </div>
            </div>
          )}
          <CommentItemContent
            key={newCommentId}
            container={container}
            isActive={isActive}
            comment={comment}
            updateComment={updateComment}
            updateCommentState={updateCommentState}
            onDeleteComment={onDeleteComment}
            targetId={commentOpToolsId}
            isClickedContextComment={isClickedContextComment}
          />
          {isClickedContextComment && comment.replies && comment.replies.length > 0 && (
            comment.replies.filter(item => item.type === 'reply').map(reply => {
              const props = {
                key: reply.id,
                isActive,
                container,
                reply,
                deleteReply,
                updateReply,
              };
              return <CommentItemReply {...props} />;
            })
          )}
          {!isClickedContextComment && comment.replies && comment.replies.length > 0 && (
            comment.replies.filter(item => item.type === 'reply').map(reply => {
              const props = {
                key: reply.id,
                isActive,
                container,
                reply,
                deleteReply,
                updateReply,
              };
              return <CommentItemReply {...props} />;
            })
          )}
        </div>
      )}
      {isShowDeletePopover && isActive && (
        <CommentDeletePopover
          type="comment"
          targetId={commentOpToolsId}
          deleteConfirm={_deleteComment}
          setIsShowDeletePopover={setIsShowDeletePopover}
          parentDom={listRef.current}
        />
      )}
    </div>
  );
});

CommentItemWrapper.propTypes = {
  isActive: PropTypes.bool,
  element: PropTypes.object,
  commentDetailRef: PropTypes.any,
  editor: PropTypes.object,
  container: PropTypes.string,
  comment: PropTypes.object,
  isGlobalComment: PropTypes.bool,
  isEmptyComment: PropTypes.bool,
  isCollapseCommentEditor: PropTypes.bool,
  onCommentClick: PropTypes.func,
  updateScrollPosition: PropTypes.func,
  hiddenComment: PropTypes.func,
  setCurrentCommentGroup: PropTypes.func,
};

export default CommentItemWrapper;
