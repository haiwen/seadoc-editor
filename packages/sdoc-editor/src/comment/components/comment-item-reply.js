import React, { useCallback, useState, useRef, useEffect } from 'react';
import { withTranslation } from 'react-i18next';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import { SeafileCommentEditor } from '@seafile/comment-editor';
import dayjs from 'dayjs';
import context from '../../context';
import { useCollaborators } from '../../hooks/use-collaborators';
import processor from '../../slate-convert/md-to-html';
import { useParticipantsContext } from '../hooks/use-participants';
import CommentDeletePopover from './comment-delete-popover';
import CommentImagePreviewer from './comment-image-previewer';

const CommentItemReply = ({
  isActive,
  container,
  reply,
  deleteReply,
  updateReply,
  t
}) => {
  const { addParticipants, participants } = useParticipantsContext();
  const { collaborators } = useCollaborators();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const itemRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const replyOpToolsId = `replyOpTools_${reply.id}`;
  const onEditToggle = useCallback((event) => {
    event.stopPropagation();
    setIsEditing(true);
  }, []);

  const [isShowDeletePopover, setIsShowDeletePopover] = useState(false);
  const onDeleteToggle = useCallback((event) => {
    event.stopPropagation();
    setIsShowDeletePopover(true);
  }, []);

  const transferHtml = async (mdString) => {
    const htmlString = await processor.process(mdString);
    const formatHtml = String(htmlString).replace(/\n */g, '');
    setEditorContent(formatHtml);
  };

  useEffect(() => {
    transferHtml(reply.reply);
  }, [reply.reply]);

  const _deleteReply = useCallback(() => {
    deleteReply(reply.id);
    setIsShowDeletePopover(false);
  }, [reply.id, deleteReply]);

  const updateContent = useCallback((content) => {
    if (reply.reply !== content) {
      const time = dayjs().format('YYYY-MM-DD HH:mm:ss');
      const newReply = {
        reply: content,
        updated_at: time,
      };
      updateReply(reply.id, newReply);
    }
    setIsEditing(false);
  }, [reply, updateReply]);

  const user = context.getUserInfo();

  const onCommentContentClick = useCallback((event) => {
    if (event.target && event.target.tagName === 'IMG' && event.target.src) {
      setImageUrl(event.target.src);
    }
  }, []);

  const commentEditorProps = {
    type: 'reply',
    className: 'pb-3',
    settings: { ...context.getSettings(), mediaUrl: context.getSetting('mediaUrl') + 'comment-editor/' },
    addParticipants: addParticipants,
    participants,
    collaborators,
    content: editorContent,
    insertContent: updateContent,
    hiddenComment: setIsEditing,
    api: {
      uploadLocalImage: context.uploadCommentImage,
    }
  };

  return (
    <div className='comment-item' ref={itemRef}>
      <div className='comment-header'>
        <div className='comment-author'>
          <span className='comment-author__avatar'><img alt='' src={reply.avatar_url} /></span>
          <span className='comment-author__info'>
            <span className='name'>{reply.user_name}</span>
            <span className='time'>
              {dayjs(reply.updated_at).format('MM-DD HH:mm')}
            </span>
          </span>
        </div>
        {isActive && user.username === reply.author && (
          <div className='comment-item-operation-wrapper'>
            <Dropdown id={replyOpToolsId} isOpen={isDropdownOpen} toggle={() => setDropdownOpen(!isDropdownOpen)}>
              <DropdownToggle tag='div' className='comment-operation'>
                <i className='sdocfont sdoc-more'></i>
              </DropdownToggle>
              <DropdownMenu className='sdoc-dropdown-menu' container={container}>
                <DropdownItem className='sdoc-dropdown-menu-item' tag='div' onClick={onEditToggle}>{t('Edit')}</DropdownItem>
                <DropdownItem className='sdoc-dropdown-menu-item' tag='div' onClick={onDeleteToggle}>{t('Delete')}</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        )}
      </div>
      <div className='comment-content' onClick={onCommentContentClick}>
        {!isEditing && <div dangerouslySetInnerHTML={{ __html: editorContent }}></div>}
      </div>
      {isEditing && <SeafileCommentEditor {...commentEditorProps} />}
      {isShowDeletePopover && isActive && (
        <CommentDeletePopover
          parentDom={itemRef.current}
          type="reply"
          deleteConfirm={_deleteReply}
          setIsShowDeletePopover={setIsShowDeletePopover}
          targetId={replyOpToolsId}
        />
      )}
      {imageUrl && <CommentImagePreviewer imageUrl={imageUrl} toggle={() => setImageUrl('')} />}
    </div>
  );
};

export default withTranslation('sdoc-editor')(CommentItemReply);
