import React from 'react';
import PropTypes from 'prop-types';
import { getCommentedElementIds } from '../../helper';
import { getCommentElementById } from '../../utils';
import ElementCommentCount from './element-comment-count';

import './index.css';

const ElementsCommentCount = ({ elementCommentsMap, selectionElement, editor, onSelectElement }) => {
  if (!elementCommentsMap) return null;

  return (
    <div className="elements-comments-count">
      {Object.keys(elementCommentsMap).map(originElementId => {
        const comments = elementCommentsMap[originElementId];
        if (!Array.isArray(comments) || comments.length === 0) return null;

        const currentElementId = getCommentedElementIds(editor, comments[0].detail?.text_comment_id)[0];
        let elementId = currentElementId || originElementId;
        const elementIdList = comments[0].detail?.element_id_list ?? [];
        if (!currentElementId && elementIdList.length > 1) {
          const existedId = elementIdList.find(id => getCommentElementById(id, editor));
          if (existedId) {
            elementId = existedId;
          } else {
            return null;
          }
        }
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
            onSelectElement={() => onSelectElement(elementId, false, originElementId)}
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
