import React from 'react';
import { SeafileCommentEditor } from '@seafile/comment-editor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import context from '../../../context';
import { useCollaborators } from '../../../hooks/use-collaborators';
import { useParticipantsContext } from '../../hooks/use-participants';

const GlobalCommentEditor = ({ isScrollDisplayed, globalCommentContent, type, insertDocComment, hiddenCommentEditor, onContentChange }) => {
  const { addParticipants, participants } = useParticipantsContext();
  const { collaborators } = useCollaborators();

  const commentEditorProps = {
    type,
    className: 'sdoc-doc-comment-editor',
    settings: { ...context.getSettings(), mediaUrl: context.getSetting('mediaUrl') + 'comment-editor/' },
    hiddenUserInfo: true,
    content: globalCommentContent,
    insertContent: insertDocComment,
    onContentChange: onContentChange,
    hiddenComment: hiddenCommentEditor,
    addParticipants: addParticipants,
    collaborators,
    participants,
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
