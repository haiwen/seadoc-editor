import React from 'react';
import PropTypes from 'prop-types';
import { getCommentedElementIds } from '../../helper';
import ElementCommentCount from './element-comment-count';

import './index.css';

const ElementsCommentCount = ({ elementCommentsMap, selectionElement, editor, onSelectElement }) => {
  if (!elementCommentsMap) return null;

  const commentsByElement = {};
  Object.entries(elementCommentsMap).forEach(([originElementId, comments]) => {
    comments.filter(comment => !comment.resolved).forEach(comment => {
      const elementId = comment.detail.element_id_list
        ? getCommentedElementIds(editor, comment.detail.text_comment_id)[0]
        : originElementId;
      if (!elementId) return;
      if (!commentsByElement[elementId]) commentsByElement[elementId] = [];
      commentsByElement[elementId].push(comment);
    });
  });

  return (
    <div className="elements-comments-count">
      {Object.entries(commentsByElement).map(([elementId, comments]) => {
        return (
          <ElementCommentCount
            key={elementId}
            elementId={elementId}
            isElementSelected={selectionElement && selectionElement.id === elementId}
            commentsCount={comments.length}
            editor={editor}
            onSelectElement={() => onSelectElement(elementId, false, comments)}
          />
        );
      })}
    </div>
  );
};

ElementsCommentCount.propTypes = {
  selectionElement: PropTypes.object,
  elementCommentsMap: PropTypes.object,
};

export default ElementsCommentCount;
