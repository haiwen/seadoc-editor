import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import context from '../context';
import { EditorComment, GlobalComment } from './components';
import { DOC_NOTIFICATION_REDUCER_TYPE } from './constants';
import { useCommentContext } from './hooks/comment-hooks/use-comment-context';
import { useNotificationContext } from './hooks/notification-hooks';
import { generatorNotificationKey } from './utils';

const CommentWrapper = ({ type, editor }) => {
  const { commentsInfo } = useCommentContext();
  const { notificationsInfo, dispatch: notificationDispatch } = useNotificationContext();

  const deleteUnseenNotifications = useCallback((comment) => {
    let unseenCommentIds = [];
    let unseenNotificationKeys = [];
    const commentNotificationKey = generatorNotificationKey(comment.id);
    const commentNotification = notificationsInfo.notifications_map[commentNotificationKey];
    if (commentNotification) {
      unseenNotificationKeys.push(commentNotification.key);
      unseenCommentIds.push(commentNotification.id);
    }
    Array.isArray(comment.replies) && comment.replies.forEach(reply => {
      const replyNotificationKey = generatorNotificationKey(reply.comment_id, reply.id);
      const replyNotification = notificationsInfo.notifications_map[replyNotificationKey];
      if (replyNotification) {
        unseenNotificationKeys.push(replyNotification.key);
        unseenCommentIds.push(replyNotification.id);
      }
    });
    context.deleteUnseenNotifications(unseenCommentIds).then(res => {
      notificationDispatch({ type: DOC_NOTIFICATION_REDUCER_TYPE.DEL, payload: unseenNotificationKeys });
    }).catch((error) => {
      //
    });
  }, [notificationDispatch, notificationsInfo.notifications_map]);

  const { isFreezed } = context.getSettings('isFreezed');

  if (commentsInfo.isFetching) return null;

  return (
    <>
      {type === 'editor' && !isFreezed && <EditorComment editor={editor}/>}
      {type === 'global' && <GlobalComment deleteUnseenNotifications={deleteUnseenNotifications} editor={editor} />}
    </>
  );
};

CommentWrapper.propTypes = {
  editor: PropTypes.object.isRequired,
  type: PropTypes.oneOf(['editor', 'global']).isRequired,
};

export default CommentWrapper;
