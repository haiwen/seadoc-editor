import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { INTERNAL_EVENT } from '../../../constants';
import context from '../../../context';
import { useCollaborators } from '../../../hooks/use-collaborators';
import EventBus from '../../../utils/event-bus';
import { DOC_NOTIFICATION_REDUCER_TYPE } from '../../constants';
import { createNotify } from '../../utils';

export const useNotificationsMount = (dispatch) => {

  const { t } = useTranslation('sdoc-editor');
  const { collaborators } = useCollaborators();

  const popupBrowserCommentNotification = useCallback((notification) => {
    if (!notification) return;
    const { author, msg_type: msgType, reply, comment } = notification;
    const authorInfo = collaborators.find(collaborator => collaborator.email === author);
    const notificationContent = comment || reply;
    const titleKey = msgType === 'comment' ? 'xxx_added_a_new_comment' : 'xxx_added_a_reply';
    const title = t(titleKey, { author: authorInfo ? authorInfo.name : t('Unknown') });
    const options = { body: `${notificationContent}` };
    createNotify(title, options);
  }, [collaborators, t]);

  const request = useCallback(async (notification) => {
    popupBrowserCommentNotification(notification);
    const eventBus = EventBus.getInstance();

    dispatch({ type: DOC_NOTIFICATION_REDUCER_TYPE.FETCHING });
    try {
      const res = await context.listUnseenNotifications();
      const notifications = res.data.notifications;
      dispatch({ type: DOC_NOTIFICATION_REDUCER_TYPE.FETCHED, payload: notifications });
      eventBus.dispatch(INTERNAL_EVENT.UNSEEN_NOTIFICATIONS_COUNT, notifications?.length);
    } catch (error) {
      console.log(error);
      dispatch({ type: DOC_NOTIFICATION_REDUCER_TYPE.FETCH_ERROR });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popupBrowserCommentNotification]);

  useEffect(() => {
    request();
    const eventBus = EventBus.getInstance();
    const unsubscribeNewNotification = eventBus.subscribe(INTERNAL_EVENT.NEW_NOTIFICATION, request);
    return () => {
      unsubscribeNewNotification();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
