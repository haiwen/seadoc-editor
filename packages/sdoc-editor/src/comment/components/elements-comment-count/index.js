import React from 'react';
import PropTypes from 'prop-types';
import { getCommentedElementIds } from '../../helper';
import { getCommentElementById } from '../../utils';
import ElementCommentCount from './element-comment-count';

import './index.css';

const ElementsCommentCount = ({ elementCommentsMap, selectionElement, editor, onSelectElement }) => {
  if (!elementCommentsMap) return null;

  const groupedComments = {};
  for (const [originElementId, comments] of Object.entries(elementCommentsMap)) {
    if (!Array.isArray(comments)) continue;
    for (const comment of comments) {
      const [currentElementId] = getCommentedElementIds(editor, comment.detail?.text_comment_id);
      if (comment.detail?.text_comment_id && !currentElementId) continue;
      let elementId = currentElementId || originElementId;
      const elementIdList = comment.detail?.element_id_list ?? [];
      if (!currentElementId && elementIdList.length > 1) {
        elementId = elementIdList.find(id => getCommentElementById(id, editor));
        if (!elementId) continue;
      }
      if (!groupedComments[elementId]) groupedComments[elementId] = [];
      groupedComments[elementId].push(comment);
    }
  }

  return (
    <div className="elements-comments-count">
      {Object.keys(groupedComments).map(originElementId => {
        const comments = groupedComments[originElementId];
        let elementId = originElementId;
        const unresolvedComment = comments.filter(item => !item.resolved);
        const unresolvedCommentCount = unresolvedComment.length;
        if (unresolvedCommentCount === 0) return null;
        return (
          <ElementCommentCount
            key={`${originElementId}-${elementId}`}
            elementId={elementId}
            isElementSelected={selectionElement && selectionElement.id === elementId}
            commentsCount={unresolvedCommentCount}
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
