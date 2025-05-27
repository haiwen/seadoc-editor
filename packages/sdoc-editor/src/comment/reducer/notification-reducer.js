import { INTERNAL_EVENT } from '../../constants';
import { Notification } from '../../model';
import EventBus from '../../utils/event-bus';
import { DOC_NOTIFICATION_REDUCER_TYPE } from '../constants';

export const initNotificationsInfo = {
  isFetching: true,
  notifications_map: {},
  error: false,
};

export const notificationReducer = (state, action) => {
  switch (action.type) {
    case DOC_NOTIFICATION_REDUCER_TYPE.FETCHING: {
      return initNotificationsInfo;
    }
    case DOC_NOTIFICATION_REDUCER_TYPE.FETCHED: {
      const notifications = action.payload;
      let notificationsMap = {};
      notifications.forEach(n => {
        const newNotification = new Notification(n);
        notificationsMap[newNotification.key] = newNotification;
      });
      return {
        isFetching: false,
        notifications_map: notificationsMap,
        error: false,
      };
    }
    case DOC_NOTIFICATION_REDUCER_TYPE.FETCH_ERROR: {
      return {
        isFetching: false,
        notifications_map: {},
        error: true
      };
    }
    case DOC_NOTIFICATION_REDUCER_TYPE.ADD: {
      const { notification } = action.payload;
      const newNotification = new Notification(notification);
      return {
        ...state,
        notifications_map: { ...state.notifications_map, [newNotification.key]: newNotification }
      };
    }
    case DOC_NOTIFICATION_REDUCER_TYPE.DEL: {
      const notificationKeys = action.payload;
      const { notifications_map } = state;
      if (Array.isArray(notificationKeys) && notificationKeys.length > 0) {
        notificationKeys.forEach((notificationKey) => {
          if (notifications_map[notificationKey]) {
            delete notifications_map[notificationKey];
          }
        });
      }
      const eventBus = EventBus.getInstance();
      eventBus.dispatch(INTERNAL_EVENT.UNSEEN_NOTIFICATIONS_COUNT, Object.keys(notifications_map).length);
      // No unread messages, clearly marked
      if (Object.keys(notifications_map).length === 0) {
        eventBus.dispatch(INTERNAL_EVENT.CLEAR_NOTIFICATION);
      }
      return { ...state, notifications_map };
    }
    default: {
      return state;
    }
  }
};
