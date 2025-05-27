import React, { useCallback } from 'react';
import { INTERNAL_EVENT } from '../../../constants';
import EventBus from '../../../utils/event-bus';
import MenuItem from './menu-item';

import './index.css';

const CommentContextMenu = ({ isRichEditor }) => {

  const onCommentClick = useCallback((event) => {
    const eventBus = EventBus.getInstance();
    eventBus.dispatch(INTERNAL_EVENT.ADD_CONTEXT_COMMENT);
  }, []);

  const commentProps = {
    id: 'context-toolbar-comment',
    isRichEditor,
    className: 'menu-group-item sdoc-comment-menu-container',
    disabled: false,
    isActive: false,
    onMouseDown: onCommentClick,
    iconClass: 'sdocfont sdoc-comments',
    text: 'Comment',
    ariaLabel: 'Add_Comment',
    type: 'sdoc-add-comment'
  };

  return (
    <>
      <div className='sdoc-context-menu-divider'></div>
      <MenuItem {...commentProps} />
    </>
  );
};

export default CommentContextMenu;
