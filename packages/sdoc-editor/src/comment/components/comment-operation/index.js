import React, { useCallback, useEffect, useState } from 'react';
import { INTERNAL_EVENT } from '../../../constants';
import EventBus from '../../../utils/event-bus';

import './index.css';

export default function CommentsOperation() {
  const [unseenNotificationsCount, setUnseenNotificationsCount] = useState(0);

  const updateUnseenNotificationsCount = useCallback((count) => {
    setUnseenNotificationsCount(count);
  }, []);

  useEffect(() => {
    const eventBus = EventBus.getInstance();
    const unsubscribeUnseenNotificationsCount = eventBus.subscribe(INTERNAL_EVENT.UNSEEN_NOTIFICATIONS_COUNT, updateUnseenNotificationsCount);
    return () => {
      unsubscribeUnseenNotificationsCount();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <i className="sdocfont sdoc-comments"></i>
      {unseenNotificationsCount > 0 && (
        <span className="sdoc-unread-message-tip"></span>
      )}
    </>
  );
}
