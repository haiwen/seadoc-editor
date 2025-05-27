import React, { useEffect, useReducer } from 'react';
import { INTERNAL_EVENT } from '../../constants';
import EventBus from '../../utils/event-bus';
import { CommentContext } from '../hooks/comment-hooks/use-comment-context';
import { useCommentsMount } from '../hooks/comment-hooks/use-comment-mount';
import { commentReducer, initCommentsInfo } from '../reducer/comment-reducer';

const CommentContextProvider = ({ children, editor }) => {
  const [commentsInfo, dispatch] = useReducer(commentReducer, initCommentsInfo);
  useCommentsMount(dispatch);

  useEffect(() => {
    if (Object.keys(commentsInfo.element_comments_map).length) {
      editor.element_comments_map = commentsInfo.element_comments_map;
      const eventBus = EventBus.getInstance();
      eventBus.dispatch(INTERNAL_EVENT.RELOAD_COMMENT);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentsInfo.element_comments_map]);

  return (
    <CommentContext.Provider value={{ commentsInfo, dispatch }}>
      {children}
    </CommentContext.Provider>
  );
};

export default CommentContextProvider;
