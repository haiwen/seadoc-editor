import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor, Transforms, Node } from '@seafile/slate';
import { ReactEditor } from '@seafile/slate-react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { COMMENT_EDITOR, COMMENT_EDITOR_EDIT_AREA_WIDTH, INTERNAL_EVENT, KeyCodes } from '../../constants';
import context from '../../context';
import SdocCommentEditor from '../../editor/sdoc-comment-editor';
import { createCommentEditor } from '../../extension';
import { PARAGRAPH } from '../../extension/constants';
import { generateEmptyElement } from '../../extension/core';
import withNodeId from '../../node-id';
import mdStringToSlate from '../../slate-convert/md-to-slate';
import slateToMdString from '../../slate-convert/slate-to-md';
import EventBus from '../../utils/event-bus';
import { useParticipantsContext } from '../hooks/use-participants';

const getSubmitTip = (type, content) => {
  if (content) return 'Save';
  return type === 'comment' ? 'Comment' : 'Reply';
};

const DEFAULT_PLACEHOLDER = 'Enter_comment_shift_enter_for_new_line_Enter_to_send';

const CommentEditor = ({
  type,
  className,
  content,
  commentContent,
  placeholder = DEFAULT_PLACEHOLDER,
  insertContent,
  updateContent,
  setIsEditing,
  hiddenComment,
  hiddenUserInfo,
  onContentChange,
  isContextComment,
  closeComment
}) => {
  const commentWrapperRef = useRef();
  const { t } = useTranslation('sdoc-editor');
  const { addParticipants } = useParticipantsContext();
  const submitTip = useMemo(() => getSubmitTip(type, content), [content, type]);
  const userInfo = context.getUserInfo();

  const document = useMemo(() => {
    const cursor = {};
    let elements = null;
    elements = [generateEmptyElement(PARAGRAPH, { placeholder })];
    return { elements, cursor };
  }, [placeholder]);

  const editor = useMemo(() => {
    const defaultEditor = createCommentEditor();
    const newEditor = withNodeId(defaultEditor);
    const { cursors } = document;
    newEditor.cursors = cursors || {};
    newEditor.width = COMMENT_EDITOR_EDIT_AREA_WIDTH; // default width
    newEditor.editorType = COMMENT_EDITOR;

    return newEditor;
  }, [document]);

  const updateValue = useCallback((value) => {
    if (!value || value.trim() === '') return;
    if (!content) return insertContent(value);
    updateContent && updateContent(value);
  }, [content, insertContent, updateContent]);

  const onSubmit = useCallback((event) => {
    event && event.stopPropagation();
    const mdString = slateToMdString(editor.children);
    updateValue(mdString);
    addParticipants(userInfo.username);
    editor.children = [generateEmptyElement(PARAGRAPH, { placeholder })];
    Transforms.select(editor, Editor.start(editor, []));
    onContentChange && onContentChange(null);
    closeComment && closeComment();
  }, [editor, updateValue, addParticipants, userInfo.username, placeholder, onContentChange, closeComment]);

  const onSubmitByEnterKey = useCallback((event) => {
    if (!ReactEditor.isFocused(editor)) return;
    onSubmit(event);
  }, [editor, onSubmit]);

  useEffect(() => {
    const eventBus = EventBus.getInstance();
    const unsubscribePostComment = eventBus.subscribe(INTERNAL_EVENT.COMMENT_EDITOR_POST_COMMENT, onSubmitByEnterKey);

    return () => {
      unsubscribePostComment();
    };
  }, [onSubmitByEnterKey]);

  const onCancel = useCallback((event) => {
    event.stopPropagation();
    const { type: eventType, keyCode, target } = event;
    if (eventType === 'keydown' && keyCode !== KeyCodes.Esc) return;
    if (eventType === 'click') {
      const isSdocContentWrapper = target.classList.contains('sdoc-content-wrapper');
      const listContainer = window.document.querySelector('#global-comment-list-container');
      const resizeContainer = window.document.querySelector('.sdoc-comment-resize-handler');
      const isClickOnListContainer = listContainer && listContainer.contains(target);
      const isClickOnCommentEditorContainer = commentWrapperRef.current.contains(target);
      const isClickResizeContainer = resizeContainer && resizeContainer.contains(target);
      const isPreventCancel = isClickOnListContainer || isClickOnCommentEditorContainer || isClickResizeContainer || isSdocContentWrapper;
      if (isPreventCancel) return;
    }
    setIsEditing && setIsEditing(false);
    hiddenComment && hiddenComment(false);

    if (onContentChange) {
      if (editor.children.find(n => Node.string(n).trim())) {
        onContentChange(slateToMdString(editor.children));
      } else {
        onContentChange(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setIsEditing]);

  useEffect(() => {
    let children = mdStringToSlate(content);
    if (commentContent) {
      children = mdStringToSlate(commentContent);
    }
    editor.children = children;
    Transforms.select(editor, Editor.end(editor, []));
  }, [editor, content, commentContent]);

  return (
    <div className={classNames('comment-editor-wrapper', className)} ref={commentWrapperRef}>
      {type === 'comment' && !hiddenUserInfo && (
        <div className="comment-editor-user-info">
          <div className="comment-editor-user-img">
            <img src={userInfo.avatar_url} alt="" height="100%" width="100%" />
          </div>
          <div className="comment-editor-user-name">{userInfo.name}</div>
        </div>
      )}
      <SdocCommentEditor
        editor={editor}
        type={type}
        document={document}
        onSubmit={onSubmit}
        submitBtnText={t(submitTip)}
        onCancel={onCancel}
      />
    </div>
  );
};

CommentEditor.propTypes = {
  comment: PropTypes.object,
  placeholder: PropTypes.string,
  globalComment: PropTypes.bool,
  hiddenUserInfo: PropTypes.bool,
  hiddenComment: PropTypes.func,
  insertComment: PropTypes.func,
  updateComment: PropTypes.func,
  onContentChange: PropTypes.func,
};

export default CommentEditor;
