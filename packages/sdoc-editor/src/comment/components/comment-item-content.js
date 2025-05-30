import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import dayjs from 'dayjs';
import Tooltip from '../../components/tooltip';
import context from '../../context';
import processor from '../../slate-convert/md-to-html';
import { useNotificationContext } from '../hooks/notification-hooks';
import CommentEditor from './comment-editor';

const CommentItemContent = ({
  isActive, container, comment, updateComment,
  updateCommentState, onDeleteComment, t, targetId
}) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { notificationsInfo } = useNotificationContext();
  const [editorContent, setEditorContent] = useState('');
  const onEditToggle = useCallback((event) => {
    event.stopPropagation();
    setIsEditing(true);
  }, []);
  const isUnseen = notificationsInfo.notifications_map[`sdoc_notification_${comment.id}`] ? true : false;

  useEffect(() => {
    transferHtml(comment.comment);
  }, [comment.comment]);

  const transferHtml = async (mdString) => {
    const htmlString = await processor.process(mdString);
    setEditorContent(String(htmlString));
  };

  const onDeleteToggle = useCallback((event) => {
    event.stopPropagation();
    onDeleteComment(true);
  }, [onDeleteComment]);

  const updateContent = useCallback((content) => {
    const commentId = comment.id;
    if (comment.comment !== content) {
      const time = dayjs().format('YYYY-MM-DD HH:mm:ss');
      const newComment = {
        comment: content,
        detail: { ...comment.detail, comment: content },
        updated_at: time
      };
      updateComment(commentId, newComment);
    }
    setIsEditing(false);
  }, [comment, updateComment]);

  const updateCommentResolved = useCallback((state) => {
    const commentId = comment.id;
    const newComment = {
      resolved: state,
    };
    updateCommentState(commentId, newComment);
  }, [comment.id, updateCommentState]);

  const markAsResolved = useCallback((event) => {
    event.stopPropagation();
    updateCommentResolved(true);
  }, [updateCommentResolved]);

  const resubmit = useCallback((event) => {
    event.stopPropagation();
    updateCommentResolved(false);
  }, [updateCommentResolved]);

  const menuId = useMemo(() => `comment_${comment.id}`, [comment]);
  const user = context.getUserInfo();

  return (
    <div className='comment-item'>
      <div className='comment-header'>
        <div className='comment-author'>
          <span className='comment-author__avatar'><img alt='' src={comment.avatar_url} /></span>
          <span className='comment-author__info'>
            <span className='name'>{comment.user_name}</span>
            <span className='time'>
              {dayjs(comment.updated_at).format('MM-DD HH:mm')}
              {comment?.resolved && (<span className='comment-success-resolved sdocfont sdoc-mark-as-resolved'/>)}
            </span>
          </span>
        </div>
        {(isUnseen && !isActive) && (
          <span className="sdoc-unread-message-tip"></span>
        )}
        {isActive && [comment?.user_email, comment?.author].includes(user.username) && (
          <div className='d-flex comment-item-operation-wrapper'>
            {(!comment.resolved || comment?.isContextComment) && (
              <>
                <div id={`tooltip_${menuId}`} className="comment-operation mr-2" onClick={markAsResolved}>
                  <i className='sdocfont sdoc-confirm'></i>
                </div>
                <Tooltip target={`tooltip_${menuId}`}>
                  {t('Resolved_tip')}
                </Tooltip>
              </>
            )}
            <Dropdown id={targetId} isOpen={isDropdownOpen} toggle={() => setDropdownOpen(!isDropdownOpen)}>
              <DropdownToggle tag='div' className='comment-operation'>
                <i className='sdocfont sdoc-more'></i>
              </DropdownToggle>
              <DropdownMenu className='sdoc-dropdown-menu' container={container}>
                <DropdownItem className='sdoc-dropdown-menu-item' tag='div' onClick={onEditToggle}>{t('Edit')}</DropdownItem>
                <DropdownItem className='sdoc-dropdown-menu-item' tag='div' onClick={onDeleteToggle}>{t('Delete')}</DropdownItem>
                {!comment.resolved && (
                  <DropdownItem className='sdoc-dropdown-menu-item' tag='div' onClick={markAsResolved}>{t('Mark_as_Resolved')}</DropdownItem>
                )}
                {comment.resolved && (
                  <DropdownItem className='sdoc-dropdown-menu-item' tag='div' onClick={resubmit}>{t('Resubmit')}</DropdownItem>
                )}
              </DropdownMenu>
            </Dropdown>
          </div>
        )}
      </div>
      <div className='comment-content'>
        {!isEditing && <div dangerouslySetInnerHTML={{ __html: editorContent }}></div>}
      </div>
      {isEditing && <CommentEditor className="pb-3" content={comment.comment} updateContent={updateContent} setIsEditing={setIsEditing} />}
    </div>
  );
};

export default withTranslation('sdoc-editor')(CommentItemContent);
