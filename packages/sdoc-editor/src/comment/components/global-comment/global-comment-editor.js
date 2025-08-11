import React from 'react';
import { SeafileCommentEditor } from '@seafile/comment-editor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import context from '../../../context';
import { useParticipantsContext } from '../../hooks/use-participants';

const GlobalCommentEditor = ({ isScrollDisplayed, globalCommentContent, type, insertDocComment, hiddenCommentEditor, onContentChange }) => {
  const { addParticipants } = useParticipantsContext();

  const commentEditorProps = {
    type,
    userInfo: context.getUserInfo(),
    pluginName: 'sdoc',
    className: 'sdoc-doc-comment-editor 11111',
    hiddenUserInfo: true,
    content: globalCommentContent,
    insertContent: insertDocComment,
    onContentChange: onContentChange,
    hiddenComment: hiddenCommentEditor,
    addParticipants: addParticipants,
    api: {
      uploadLocalImage: context.uploadLocalImage,
    }
  };

  return (
    <div className={classNames('sdoc-doc-comment-editor-container', 'sdoc-comment-list-container', { 'scrolled': isScrollDisplayed })}>
      <div className="sdoc-doc-comment-editor-content">
        <SeafileCommentEditor {...commentEditorProps} />
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
