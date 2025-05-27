import { useCallback, useEffect } from 'react';
import { INTERNAL_EVENT } from '../../../constants';
import context from '../../../context';
import EventBus from '../../../utils/event-bus';

export const useCommentsMount = (dispatch) => {

  const request = useCallback(async () => {
    dispatch({ type: 'FETCHING_STATE' });
    try {
      const res = await context.listComments();
      const comments = res.data.comments;
      dispatch({ type: 'RECEIVE_STATE', payload: comments });
    } catch (error) {
      console.log(error);
      dispatch({ type: 'FETCHING_ERROR' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reRequest = useCallback(async () => {
    dispatch({ type: 'REFETCHING_STATE' });
    try {
      const res = await context.listComments();
      const comments = res.data.comments;
      dispatch({ type: 'RECEIVE_STATE', payload: comments });
    } catch (error) {
      console.log(error);
      // dispatch({type: 'FETCHING_ERROR'});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    request();
    const eventBus = EventBus.getInstance();
    const unsubscribeNewNotification = eventBus.subscribe(INTERNAL_EVENT.NEW_NOTIFICATION, reRequest);
    return () => {
      unsubscribeNewNotification();
    };
  }, [request, reRequest]);
};
