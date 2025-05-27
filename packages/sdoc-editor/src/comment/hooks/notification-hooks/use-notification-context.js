import React, { useContext } from 'react';
export const NotificationContext = React.createContext();

export const useNotificationContext = () => {
  const { notificationsInfo, dispatch } = useContext(NotificationContext);
  return {
    notificationsInfo,
    dispatch,
  };
};
