import React, { useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UncontrolledPopover } from 'reactstrap';
import isHotkey from 'is-hotkey';
import { getEventClassName } from '../utils';

import './comment-list.css';

const CommentDeletePopover = ({ type, setIsShowDeletePopover, deleteConfirm, targetId, parentDom, isGlobalComment }) => {

  const popoverRef = useRef(null);

  const hide = useCallback((event) => {
    if (popoverRef.current && !getEventClassName(event).includes('popover') && !popoverRef.current.contains(event.target)) {
      setIsShowDeletePopover(false);
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, [setIsShowDeletePopover]);

  const onHotKey = useCallback((event) => {
    if (isHotkey('esc', event)) {
      event.preventDefault();
      setIsShowDeletePopover(false);
    }
  }, [setIsShowDeletePopover]);

  useEffect(() => {
    document.addEventListener('click', hide, true);
    document.addEventListener('keydown', onHotKey);
    return () => {
      document.removeEventListener('click', hide, true);
      document.removeEventListener('keydown', onHotKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { t } = useTranslation('sdoc-editor');

  const onDeleteCancel = useCallback((event) => {
    event.stopPropagation();
    setIsShowDeletePopover(false);
  }, [setIsShowDeletePopover]);

  const handleConfirm = useCallback((event) => {
    event.stopPropagation();
    deleteConfirm();
  }, [deleteConfirm]);

  return (
    <UncontrolledPopover
      container={parentDom}
      target={targetId}
      onClick={event => event.stopPropagation()}
      placement={isGlobalComment ? 'bottom' : 'left'}
      className='comment-delete-popover'
      isOpen={true}
    >
      <div className='comment-delete-popover-container' ref={popoverRef}>
        <div className='delete-tip'>{t(`Are_you_sure_to_delete_this_${type === 'comment' ? 'comment' : 'reply'}`)}</div>
        <div className='delete-control mt-5'>
          <button className='btn btn-secondary mr-2' onClick={onDeleteCancel}>{t('Cancel')}</button>
          <button className='btn btn-primary' onClick={handleConfirm}>{t('Confirm')}</button>
        </div>
      </div>
    </UncontrolledPopover >
  );
};

export default CommentDeletePopover;
