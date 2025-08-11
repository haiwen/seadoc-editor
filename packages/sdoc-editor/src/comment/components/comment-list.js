import React, { useCallback, useEffect, useRef, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { Input } from 'reactstrap';
import { SeafileCommentEditor } from '@seafile/comment-editor';
import classNames from 'classnames';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import slugid from 'slugid';
import context from '../../context';
import { useCommentListPosition } from '../../hooks/use-selection-position';
import { updateElementsAttrs } from '../helper';
import { useCommentContext } from '../hooks/comment-hooks/use-comment-context';
import { useParticipantsContext } from '../hooks/use-participants';
import CommentItemWrapper from './comment-item-wrapper';

import './comment-list.css';

const CommentList = ({
  activeElementIds,
  commentDetail = {},
  onSetCommentDetail,
  isContextComment = false,
  isClickedContextComment = false,
  setIsClickedContextComment,
  onSelectElement,
  closeComment,
  commentedDom,
  editor,
  t
}) => {
  const commentPopover = useRef(null);
  const commentDetailRef = useRef(null);
  const position = useCommentListPosition(activeElementIds, isContextComment, isClickedContextComment, commentedDom, commentDetail, closeComment, editor);
  const { addParticipants } = useParticipantsContext();
  const { dispatch } = useCommentContext();
  const [showEditor, setShowEditor] = useState(false);
  const [inputContent, setInputContent] = useState(null);
  const [activeCommentKey, setActiveCommentKey] = useState(null);
  const [translateY, setTranslateY] = useState();
  const isEmptyComment = Object.keys(commentDetail).length ? false : true;
  const isCollapseCommentEditor = !isEmptyComment && !showEditor;
  const [isCommentPanelVisible, setIsCommentPanelVisible] = useState(true);

  // Multi context comments
  const [commentInputs, setCommentInputs] = useState({});
  const contextCommentRef = useRef({});

  const insertComment = useCallback(
    async (elementId, comment, isContextComment = false) => {
      const res = await context.insertComment(comment);
      const { comment: returnComment } = res.data;
      const newComment = {
        ...comment,
        isContextComment: isContextComment,
        id: returnComment.id,
        user_name: returnComment.user_name,
        avatar_url: returnComment.avatar_url,
        replies: [],
      };
      dispatch({
        type: 'INSERT_COMMENT',
        payload: { element_id: elementId, comment: newComment },
      });
      onSetCommentDetail(newComment);
      setShowEditor(true);
    },
    [dispatch, onSetCommentDetail]
  );

  const addNewComment = useCallback(
    (content) => {
      const user = context.getUserInfo();
      const time = dayjs().format('YYYY-MM-DD HH:mm:ss');
      const textCommentId = slugid.nice();
      const comment = {
        comment: content,
        detail: {
          text_comment_id: textCommentId,
          element_id_list: activeElementIds
        },
        author: user.username,
        updated_at: time,
      };
      updateElementsAttrs(activeElementIds, editor, textCommentId);
      insertComment(activeElementIds[0], comment, isContextComment);
    },
    [isContextComment, activeElementIds, editor, insertComment]
  );

  const replyComment = useCallback((content) => {
    if (commentDetailRef?.current) {
      commentDetailRef.current.insertContent(content);
    }
  }, []);

  const hiddenComment = useCallback(() => {
    setShowEditor(false);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      if (commentPopover?.current && Array.isArray(activeElementIds)) {
        const { bottom } = commentPopover.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        if (bottom > viewportHeight) {
          const overflowY = bottom - viewportHeight;
          setTranslateY(-(overflowY + 16));
        } else {
          setTranslateY(0);
        }
      }
    });
  }, [activeElementIds]);

  const handleInputChange = (id, value) => {
    setCommentInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleReplySubmit = (content, id) => {
    if (contextCommentRef?.current?.[id]) {
      contextCommentRef.current[id].insertContent(content);
    }
  };

  return (
    <div
      ref={commentPopover}
      id="sdoc-comment-list-container"
      className={classNames('sdoc-comment-list-container sdoc-comment-list-container-popover', 'sdoc-context-comment-list-container')}
      style={{ top: position.y, ...(isContextComment || isClickedContextComment ? { right: position.right } : {}), width: '300px', transform: `translateY(${translateY}px)` }}
    >
      {Object.values(commentDetail).length !== 0 && isCommentPanelVisible && Object.values(commentDetail).map((item, index) => {
        const isActiveEditor = activeCommentKey === index;
        return (
          <div className='sdoc-context-comment-popover-wrapper' key={item.id || index}>
            <CommentItemWrapper
              ref={(el) => {
                if (el) contextCommentRef.current[item.id] = el;
                else delete contextCommentRef.current[item.id];
              }}
              editor={editor}
              comment={item}
              commentsDetail={commentDetail}
              setIsClickedContextComment={setIsClickedContextComment}
              setIsCommentPanelVisible={setIsCommentPanelVisible}
              onSelectElement={onSelectElement}
              isActive={true}
              isEmptyComment={isEmptyComment}
              isCollapseCommentEditor={isCollapseCommentEditor}
              isClickedContextComment={isClickedContextComment}
              closeComment={closeComment}
            />
            <div className='non-global-comment-input-wrapper' style={{ paddingTop: isEmptyComment ? '16px' : '' }}>
              {isEmptyComment && (
                <SeafileCommentEditor
                  userInfo={context.getUserInfo()}
                  pluginName='sdoc'
                  addParticipants={addParticipants}
                  type="comment"
                  insertContent={addNewComment}
                  hiddenComment={hiddenComment}
                  closePanel={closeComment}
                  api={{ uploadLocalImage: context.uploadLocalImage }}
                />
              )}
              {!isEmptyComment && (
                <>
                  {!isActiveEditor && (
                    <Input
                      value={inputContent?.trim() ? '.....' : ''}
                      readOnly={true}
                      placeholder={t('Enter_reply')}
                      onFocus={() => {
                        setActiveCommentKey(index);
                      }}
                    />
                  )}
                  {isActiveEditor && (
                    <SeafileCommentEditor
                      userInfo={context.getUserInfo()}
                      pluginName='sdoc'
                      type="reply"
                      placeholder={'Enter_reply_shift_Enter_for_new_line_Enter_to_send'}
                      addParticipants={addParticipants}
                      content={commentInputs[item.id] || ''}
                      insertContent={(value) => handleReplySubmit(value, item.id)}
                      onContentChange={(content) =>
                        handleInputChange(item.id, content)
                      }
                      hiddenComment={hiddenComment}
                      api={{ uploadLocalImage: context.uploadLocalImage }}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
      {Object.values(commentDetail).length === 0 && (
        <div className='non-global-comment-input-wrapper' style={{ paddingTop: isEmptyComment ? '16px' : '' }}>
          {isEmptyComment && (
            <SeafileCommentEditor
              userInfo={context.getUserInfo()}
              pluginName='sdoc'
              type="comment"
              addParticipants={addParticipants}
              insertContent={addNewComment}
              hiddenComment={hiddenComment}
              closePanel={closeComment}
              api={{ uploadLocalImage: context.uploadLocalImage }}
            />
          )}
          {!isEmptyComment && (
            <>
              {!showEditor && (
                <Input
                  value={inputContent?.trim() ? '.....' : ''}
                  readOnly={true}
                  placeholder={t('Enter_reply')}
                  onFocus={() => {
                    setShowEditor(true);
                  }}
                />
              )}
              {showEditor && (
                <SeafileCommentEditor
                  userInfo={context.getUserInfo()}
                  pluginName='sdoc'
                  type="reply"
                  placeholder={'Enter_reply_shift_Enter_for_new_line_Enter_to_send'}
                  addParticipants={addParticipants}
                  content={inputContent}
                  insertContent={replyComment}
                  onContentChange={(content) => {
                    setInputContent(content);
                  }}
                  hiddenComment={hiddenComment}
                  api={{ uploadLocalImage: context.uploadLocalImage }}
                />
              )}
            </>
          )}
        </div>)
      }
    </div>
  );
};

CommentList.propTypes = {
  activeElementIds: PropTypes.array,
  commentDetail: PropTypes.object,
  onSetCommentDetail: PropTypes.func,
};

export default withTranslation('sdoc-editor')(CommentList);

