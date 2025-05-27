import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import CommentEditor from '../comment-editor';

const GlobalCommentEditor = ({ isScrollDisplayed, globalCommentContent, type, insertDocComment, hiddenCommentEditor, onContentChange }) => {

  return (
    <div className={classNames('sdoc-doc-comment-editor-container', 'sdoc-comment-list-container', { 'scrolled': isScrollDisplayed })}>
      <div className="sdoc-doc-comment-editor-content">
        <CommentEditor
          type={type}
          className="sdoc-doc-comment-editor"
          commentContent={globalCommentContent}
          hiddenUserInfo={true}
          insertContent={insertDocComment}
          hiddenComment={hiddenCommentEditor}
          onContentChange={onContentChange}
        />
      </div>
    </div>
  );
};

GlobalCommentEditor.propTypes = {
  isScrollDisplayed: PropTypes.bool,
  globalCommentContent: PropTypes.string,
  type: PropTypes.string,
  insertDocComment: PropTypes.func,
  hiddenCommentEditor: PropTypes.func,
  onContentChange: PropTypes.func,
};

export default GlobalCommentEditor;
