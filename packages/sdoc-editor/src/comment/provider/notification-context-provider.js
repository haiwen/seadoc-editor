import React, { useEffect, useReducer } from 'react';
import { useNotificationsMount, NotificationContext } from '../hooks/notification-hooks';
import { notificationReducer, initNotificationsInfo } from '../reducer/notification-reducer';

const NotificationContextProvider = ({ children, editor }) => {
  const [notificationsInfo, dispatch] = useReducer(notificationReducer, initNotificationsInfo);
  useNotificationsMount(dispatch);

  useEffect(() => {
    editor.notifications_map = { ...notificationsInfo.notifications_map };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notificationsInfo]);

  return (
    <NotificationContext.Provider value={{ notificationsInfo, dispatch }}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContextProvider;
