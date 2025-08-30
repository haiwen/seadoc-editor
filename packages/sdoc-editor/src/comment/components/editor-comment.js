import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Editor } from '@seafile/slate';
import classNames from 'classnames';
import { INTERNAL_EVENT } from '../../constants';
import { removeMarks } from '../../extension/plugins/ai/ai-module/helpers';
import { useSelectionElement } from '../../hooks/use-selection-element';
import useSelectionUpdate from '../../hooks/use-selection-update';
import EventBus from '../../utils/event-bus';
import { getDomById, getSelectedElemIds } from '../helper';
import { useCommentContext } from '../hooks/comment-hooks/use-comment-context';
import CommentList from './comment-list';
import ElementsCommentCount from './elements-comment-count';

const EditorComment = ({ editor }) => {
  useSelectionUpdate();
  const { element_comments_map } = useCommentContext().commentsInfo;
  const currentSelectionElement = useSelectionElement({ editor }); // The slate node of the current cursor line
  const [activeElementIds, setActiveElementIds] = useState([]); // The elements currently activated by clicking
  const [isShowComments, setIsShowComments] = useState(false);
  const [commentDetail, setCommentDetail] = useState({});
  const [isContextComment, setIsContextComment] = useState(false);
  const [isClickedContextComment, setIsClickedContextComment] = useState(false);
  const commentedDomRef = useRef(null);

  const hiddenComment = useCallback(() => {
    setCommentDetail({});
    setIsShowComments(false);
    setIsContextComment(false);
    removeMarks(editor);
    setIsClickedContextComment(false);
  }, [editor]);

  const onSelectElement = useCallback((elementId, isClickInContext = false) => {
    if (!isClickInContext) {
      hiddenComment();
      const activeElementIds = [elementId];
      setActiveElementIds(activeElementIds);
      const unresolvedComments = element_comments_map[elementId].filter(item => !item.resolved);
      setCommentDetail({ ...unresolvedComments });
      setIsClickedContextComment(false);
    }
    setIsShowComments(true);
    if (isClickInContext) {
      const clickedComments = [];
      for (const comments of Object.values(editor.element_comments_map)) {
        for (const comment of comments) {
          if (elementId.includes(comment.detail.text_comment_id)) {
            clickedComments.push(comment);
          }
        }
      }
      setCommentDetail({ ...clickedComments });
      setIsClickedContextComment(true);
    }
  }, [editor, element_comments_map, hiddenComment]);

  useEffect(() => {
    const handleHoverContextComment = (event) => {
      const parentDom = event.target.parentElement;
      const clazzNames = parentDom?.className || [];
      if (clazzNames.includes('sdoc_comment_')) {
        const isHover = event.type === 'mouseover';
        const matchedAttributes = parentDom.className.split(' ').filter(cls => cls.startsWith('sdoc_comment_'));
        matchedAttributes.forEach((className) => {
          const el = document.querySelectorAll(`.${className}`);
          el.forEach(el => {
            el.style.textDecoration = isHover ? 'underline #eb8205' : '';
            el.style.textDecorationThickness = isHover ? '2px' : '';
          });
        });
      }
    };

    document.addEventListener('mouseover', handleHoverContextComment);
    document.addEventListener('mouseout', handleHoverContextComment);

    return () => {
      document.removeEventListener('mouseover', handleHoverContextComment);
      document.removeEventListener('mouseout', handleHoverContextComment);
    };
  }, []);

  const onSetCommentDetail = useCallback((comment) => {
    setCommentDetail(comment);
  }, []);

  // Comments are updated to modify the current comment
  useEffect(() => {
    if (isContextComment && activeElementIds) {
      const unresolvedComments = element_comments_map[activeElementIds[0].element.id].filter(item => !item.resolved);
      if (unresolvedComments.length === 0) {
        setIsShowComments(false);
      }
    }
    if (activeElementIds && !Array.isArray(activeElementIds)) {
      const unresolvedComments = element_comments_map[activeElementIds.id].filter(item => !item.resolved);
      if (unresolvedComments.length === 0) {
        setIsShowComments(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element_comments_map]);

  useEffect(() => {
    // Close when the currently selected element changes
    if (isShowComments) {
      hiddenComment();
    }

    if (isContextComment) {
      removeMarks(editor);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSelectionElement, editor.selection]);

  useEffect(() => {
    const handleAddContextComment = () => {
      // Add temporary marks for selection
      Editor.addMark(editor, 'comment', true);

      setTimeout(() => {
        const activeElementIds = getSelectedElemIds(editor);
        const lastSelectedDom = getDomById(activeElementIds[activeElementIds.length - 1]);
        commentedDomRef.current = lastSelectedDom;
        setActiveElementIds(activeElementIds);
        setIsShowComments(true);
        setCommentDetail({});
        setIsContextComment(true);
      }, 0);
    };

    const handleClickCommentedText = (event) => {
      const parentDom = event.target.parentElement;
      if (parentDom?.className.split(/\s+/).some(cls => cls.startsWith('sdoc_comment'))) {
        commentedDomRef.current = parentDom;
        const matchedAttributes = parentDom.className.split(' ').filter(cls => cls.startsWith('sdoc_comment_'));
        const clickedCommmentIdArray = matchedAttributes.map(item => item.replace('sdoc_comment_', ''));
        onSelectElement(clickedCommmentIdArray, true);
      }
    };

    const eventBus = EventBus.getInstance();
    const unsubscribeAddContextComment = eventBus.subscribe(INTERNAL_EVENT.ADD_CONTEXT_COMMENT, handleAddContextComment);
    document.addEventListener('click', handleClickCommentedText);
    return (() => {
      unsubscribeAddContextComment();
      document.removeEventListener('click', handleClickCommentedText);
    });
  }, [editor, onSelectElement]);

  return (
    <div className="sdoc-comment-container">
      <div className="comment-container-main"></div>
      <div className={classNames('comment-container-right', { 'is-context-comment': isContextComment })}>
        <ElementsCommentCount
          elementCommentsMap={element_comments_map}
          activeElementIds={activeElementIds}
          editor={editor}
          onSelectElement={onSelectElement}
        />
        {isShowComments && (
          <CommentList
            activeElementIds={activeElementIds}
            commentDetail={commentDetail}
            onSetCommentDetail={onSetCommentDetail}
            isContextComment={isContextComment}
            isClickedContextComment={isClickedContextComment}
            setIsClickedContextComment={setIsClickedContextComment}
            onSelectElement={onSelectElement}
            commentedDom={commentedDomRef.current}
            closeComment={hiddenComment}
            editor={editor}
          />
        )}
      </div>
    </div>
  );
};

export default EditorComment;
