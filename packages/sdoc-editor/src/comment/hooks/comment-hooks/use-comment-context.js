import React, { useContext } from 'react';
export const CommentContext = React.createContext();

export const useCommentContext = () => {
  const { commentsInfo, dispatch } = useContext(CommentContext);
  return {
    commentsInfo,
    dispatch,
  };
};
