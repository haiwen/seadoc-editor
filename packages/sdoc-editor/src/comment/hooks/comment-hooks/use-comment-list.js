import { useEffect, useState } from 'react';
import { COMMENT_TYPES } from '../../constants';
import { useCommentContext } from './use-comment-context';

const useCommentList = () => {
  const { commentsInfo, dispatch } = useCommentContext();
  const { comment_list } = commentsInfo || {};
  const [commentType, setCommentType] = useState(COMMENT_TYPES.ALL);
  const [commentList, setCommentList] = useState([]);

  useEffect(() => {
    if (commentType === COMMENT_TYPES.ALL) {
      const commentList = comment_list.map(item => {
        item.replies = item.replies.filter(reply => !['True', 'False'].includes(reply.reply));
        return item;
      });
      setCommentList(commentList);
    } else if (commentType === COMMENT_TYPES.RESOLVED) {
      const commentList = comment_list.filter(item => item.resolved);
      setCommentList(commentList);
    } else if (commentType === COMMENT_TYPES.UNRESOLVED) {
      const commentList = comment_list.filter(item => !item.resolved);
      setCommentList(commentList);
    }
  }, [commentType, comment_list]);

  return {
    dispatch,
    commentList,
    commentType,
    setCommentType,
  };
};

export default useCommentList;
