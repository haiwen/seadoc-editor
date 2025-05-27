import React from 'react';
import PropTypes from 'prop-types';
import useSelectionUpdate from '../../../hooks/use-selection-update';
import EventBus from '../../../utils/event-bus';
import { MenuGroup } from '../../commons';
import { ORDERED_LIST, UNORDERED_LIST } from '../../constants';
import QuoteMenu from '../../plugins/blockquote/menu';
import ImageMenu from '../../plugins/image/menu';
import LinkMenu from '../../plugins/link/menu';
import ListMenu from '../../plugins/list/menu';
import CommentEditorTextStyleMenuList from '../../plugins/text-style/menu/comemnt-editor-menu';
import PostCommentBtn from './post-comment';

const CommentEditorToolbar = ({ editor, readonly = false, onSubmit, submitBtnText, onCancel }) => {
  useSelectionUpdate();
  const eventBus = EventBus.getInstance();
  return (
    <div className='sdoc-comment-editor-toolbar'>
      <MenuGroup className="menu-group sdoc-comment-editor-menu-group">
        <CommentEditorTextStyleMenuList editor={editor} readonly={readonly} />
        <QuoteMenu editor={editor} readonly={readonly} />
        <ListMenu editor={editor} type={UNORDERED_LIST} readonly={readonly}/>
        <ListMenu editor={editor} type={ORDERED_LIST} readonly={readonly} />
        <LinkMenu editor={editor} readonly={readonly} eventBus={eventBus} />
        <ImageMenu editor={editor} readonly={readonly} eventBus={eventBus} />
      </MenuGroup>
      <div className='sdoc-comment-editor-toolbar-right'>
        <PostCommentBtn editor={editor} onSubmit={onSubmit} submitBtnText={submitBtnText} onCancel={onCancel} />
      </div>
    </div>
  );
};

CommentEditorToolbar.propTypes = {
  readonly: PropTypes.bool,
  editor: PropTypes.object,
  onSubmit: PropTypes.func,
  submitBtnText: PropTypes.string,
  onCancel: PropTypes.func,
};

export default CommentEditorToolbar;
