import React from 'react';
import CommentContextProvider from './comment-context-provider';
import NotificationContextProvider from './notification-context-provider';
import ParticipantsProvider from './participants-content-provider';

const Provider = ({ children, editor }) => {
  return (
    <NotificationContextProvider editor={editor}>
      <CommentContextProvider editor={editor}>
        <ParticipantsProvider>
          {children}
        </ParticipantsProvider>
      </CommentContextProvider>
    </NotificationContextProvider>
  );
};

export default Provider;
