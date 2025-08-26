import deepCopy from 'deep-copy';
import { getPrimaryElementId } from '../helper';

export const formatCommentsData = (comments) => {
  const formatComments = [];
  const dupComments = deepCopy(comments);
  for (let i = 0; i < dupComments.length; i++) {
    const item = dupComments[i];

    // the comment is not in sdoc document
    if (!item.detail) continue;

    try {
      item.detail = JSON.parse(item.detail);
      formatComments.push(item);
    } catch (err) {
      continue;
    }
  }
  return formatComments;
};

export const initElementCommentsMap = (comments) => {
  const elementCommentsMap = {};
  const formatComments = formatCommentsData(comments);
  for (let i = 0; i < formatComments.length; i++) {
    const item = formatComments[i];
    const element_id = getPrimaryElementId(item.detail);
    if (!elementCommentsMap[element_id]) {
      elementCommentsMap[element_id] = [];
    }
    elementCommentsMap[element_id].push(item);
  }
  return elementCommentsMap;
};

export const initCommentList = (comments) => {

  // format comments
  const formatComments = formatCommentsData(comments);
  return formatComments;

  // sort comments by update time
  // return sortCommentList(formatComments);
};

export const sortCommentList = (commentList) => {
  const newComments = commentList.map(item => {
    const { updated_at, replies } = item;
    const replayUpdatedTimes = replies.map(item => item.updated_at);
    const updatedTimes = [updated_at, ...replayUpdatedTimes];
    updatedTimes.sort((a, b) => {
      return new Date(a).getTime() <= new Date(b).getTime() ? 1 : -1;
    });
    item.updated_time = updatedTimes[0];
    return item;
  });

  const unresolvedComments = [];
  const resolvedComments = [];
  // Differentiate between resolved and unresolved comments
  newComments.forEach(item => {
    if (item.resolved) {
      resolvedComments.push(item);
    } else {
      unresolvedComments.push(item);
    }
  });

  unresolvedComments.sort((a, b) => {
    return new Date(a.updated_time).getTime() <= new Date(b.updated_time).getTime() ? 1 : -1;
  });
  resolvedComments.sort((a, b) => {
    return new Date(a.updated_time).getTime() <= new Date(b.updated_time).getTime() ? 1 : -1;
  });
  return [...unresolvedComments, ...resolvedComments];
};

export const initCommentsInfo = {
  isFetching: true,
  comment_list: [],
  element_comments_map: {},
  error: false,
};

export const commentReducer = (state, action) => {
  switch (action.type) {
    case 'FETCHING_STATE': {
      return initCommentsInfo;
    }
    case 'RECEIVE_STATE': {
      const commentList = initCommentList(action.payload);
      return {
        isFetching: false,
        comment_list: commentList,
        element_comments_map: initElementCommentsMap(action.payload),
        error: false,
      };
    }
    case 'FETCHING_ERROR': {
      return {
        isFetching: false,
        element_comments_map: {},
        error: true
      };
    }
    case 'INSERT_COMMENT': {
      const { element_comments_map, comment_list } = state;
      const { element_id, comment } = action.payload;
      if (!element_comments_map[element_id]) {
        element_comments_map[element_id] = [];
      }
      element_comments_map[element_id] = [...element_comments_map[element_id], comment];

      const commentList = [...comment_list, deepCopy(comment)];
      return {
        ...state,
        element_comments_map: { ...element_comments_map },
        comment_list: commentList,
      };
    }
    case 'DELETE_COMMENT': {
      const { element_comments_map, comment_list } = state;
      const { element_id, comment_id } = action.payload;
      if (element_comments_map[element_id]) {
        element_comments_map[element_id] = element_comments_map[element_id].filter(item => item.id !== comment_id);
      }

      const commentList = comment_list.filter(item => item.id !== comment_id);
      return {
        ...state,
        element_comments_map: { ...element_comments_map },
        comment_list: commentList
      };
    }
    case 'UPDATE_COMMENT': {
      const { element_comments_map, comment_list } = state;
      const { element_id, comment_id, comment } = action.payload;

      element_comments_map[element_id] = element_comments_map[element_id].map(item => {
        if (item.id === comment_id) {
          item.comment = comment.comment;
          item.detail = comment.detail;
          item.updated_at = comment.updated_at;
          return item;
        }
        return item;
      });

      const commentList = comment_list.map(item => {
        if (item.id === comment_id) {
          item.comment = comment.comment;
          item.detail = comment.detail;
          item.updated_at = comment.updated_at;
          return item;
        }
        return item;
      });
      return {
        ...state,
        element_comments_map: { ...element_comments_map },
        comment_list: commentList,
      };
    }
    case 'UPDATE_COMMENT_STATE': {
      const { element_comments_map, comment_list } = state;
      const { element_id, comment_id, comment } = action.payload;

      // modify comment state
      element_comments_map[element_id] = element_comments_map[element_id].map(item => {
        if (item.id === comment_id) {
          item.resolved = comment.resolved;
          return item;
        }
        return item;
      });

      const commentList = comment_list.map(item => {
        if (item.id === comment_id) {
          item.resolved = comment.resolved;
          return item;
        }
        return item;
      });
      return {
        ...state,
        element_comments_map: { ...element_comments_map },
        comment_list: commentList,
      };
    }
    case 'INSERT_REPLY': {
      const { element_comments_map, comment_list } = state;
      const { element_id, comment_id, reply } = action.payload;

      element_comments_map[element_id] = element_comments_map[element_id].map(item => {
        if (item.id === comment_id) {
          item.replies = [...item.replies, deepCopy(reply)];
          return item;
        }
        return item;
      });

      const commentList = comment_list.map(item => {
        if (item.id === comment_id) {
          item.replies = [...item.replies, reply];
          return item;
        }
        return item;
      });
      return {
        ...state,
        element_comments_map: { ...element_comments_map },
        comment_list: commentList,
      };
    }
    case 'DELETE_REPLY': {
      const { element_comments_map, comment_list } = state;
      const { element_id, comment_id, reply_id } = action.payload;

      element_comments_map[element_id] = element_comments_map[element_id].map(item => {
        if (item.id === comment_id) {
          item.replies = item.replies.filter(reply => reply.id !== reply_id);
          return item;
        }
        return item;
      });

      const commentList = comment_list.map(item => {
        if (item.id === comment_id) {
          item.replies = item.replies.filter(reply => reply.id !== reply_id);
          return item;
        }
        return item;
      });

      return {
        ...state,
        element_comments_map: { ...element_comments_map },
        comment_list: commentList,
      };
    }
    case 'UPDATE_REPLY': {
      const { element_comments_map, comment_list } = state;
      const { element_id, comment_id, reply_id, reply } = action.payload;

      element_comments_map[element_id] = element_comments_map[element_id].map(item => {
        if (item.id === comment_id) {
          item.replies = item.replies.map(replyItem => {
            if (replyItem.id === reply_id) {
              // need update replay updated_at
              return { ...replyItem, ...reply };
            }
            return replyItem;
          });
          return item;
        }
        return item;
      });

      const commentList = comment_list.map(item => {
        if (item.id === comment_id) {
          item.replies = item.replies.map(replyItem => {
            if (replyItem.id === reply_id) {
              // need update replay updated_at
              return { ...replyItem, ...reply };
            }
            return replyItem;
          });
          return item;
        }
        return item;
      });

      return {
        ...state,
        element_comments_map: { ...element_comments_map },
        comment_list: commentList,
      };
    }
    default:
      return state;
  }
};
