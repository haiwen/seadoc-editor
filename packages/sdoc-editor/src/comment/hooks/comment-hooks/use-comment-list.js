import { useEffect, useState } from 'react';
import useSelectionUpdate from '../../../hooks/use-selection-update';
import { COMMENT_TYPES } from '../../constants';
import { getCommentedElementIds } from '../../helper';
import { useCommentContext } from './use-comment-context';

const useCommentList = (editor) => {
  useSelectionUpdate();
  const { commentsInfo, dispatch } = useCommentContext();
  const { comment_list } = commentsInfo || {};
  const [commentType, setCommentType] = useState(COMMENT_TYPES.ALL);
  const [commentList, setCommentList] = useState([]);

  useEffect(() => {
    const visibleComments = comment_list.filter(item => !item.detail?.text_comment_id || getCommentedElementIds(editor, item.detail.text_comment_id).length > 0);
    if (commentType === COMMENT_TYPES.ALL) {
      const commentList = visibleComments.map(item => {
        item.replies = item.replies.filter(reply => !['True', 'False'].includes(reply.reply));
        return item;
      });
      setCommentList(commentList);
    } else if (commentType === COMMENT_TYPES.RESOLVED) {
      const commentList = visibleComments.filter(item => item.resolved);
      setCommentList(commentList);
    } else if (commentType === COMMENT_TYPES.UNRESOLVED) {
      const commentList = visibleComments.filter(item => !item.resolved);
      setCommentList(commentList);
    }
  }, [commentType, comment_list, editor, editor.children]);

  return {
    dispatch,
    commentList,
    commentType,
    setCommentType,
  };
};

export default useCommentList;
