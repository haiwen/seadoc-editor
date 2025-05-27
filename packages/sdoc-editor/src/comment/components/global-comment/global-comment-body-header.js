import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import { eventStopPropagation } from '../../../utils/mouse-event';
import { COMMENT_TYPES } from '../../constants';

const CommentTypeDropdownItem = ({ type, setCommentType }) => {
  const { t } = useTranslation('sdoc-editor');

  const handleCommentTypeChanged = useCallback((event, type) => {
    eventStopPropagation(event);
    setCommentType(type);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DropdownItem className='sdoc-dropdown-menu-item' tag={'div'} onClick={(event) => handleCommentTypeChanged(event, type)}>
      {t(type)}
    </DropdownItem>
  );
};

const GlobalCommentBodyHeader = ({ commentList = [], commentType, setCommentType }) => {
  const { t } = useTranslation('sdoc-editor');
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  let commentTip = null;
  if (commentList.length === 1) {
    commentTip = t('Total_1_comment');
  } else if (commentList.length > 1) {
    commentTip = t('Total_count_comments', { count: commentList.length });
  }

  const id = 'comment-type-controller';
  return (
    <div className='comments-panel-body__header'>
      <div className="comments-types-count">
        <div id="comment-types" className='comment-type'>
          <Dropdown isOpen={isDropdownOpen} toggle={() => setDropdownOpen(!isDropdownOpen)}>
            <DropdownToggle tag={'div'} caret className='d-flex align-items-center justify-content-center'>
              <div id={id}>{t(commentType)}</div>
            </DropdownToggle>
            <DropdownMenu className='sdoc-dropdown-menu sdoc-comment-filter-dropdown' container="comment-types">
              <CommentTypeDropdownItem type={COMMENT_TYPES.ALL} setCommentType={setCommentType}/>
              <CommentTypeDropdownItem type={COMMENT_TYPES.DOC} setCommentType={setCommentType}/>
              <CommentTypeDropdownItem type={COMMENT_TYPES.RESOLVED} setCommentType={setCommentType}/>
              <CommentTypeDropdownItem type={COMMENT_TYPES.UNRESOLVED} setCommentType={setCommentType}/>
            </DropdownMenu>
          </Dropdown>
        </div>
        <div className='comment-count-tip'>{commentTip}</div>
      </div>
    </div>
  );
};

export default GlobalCommentBodyHeader;

