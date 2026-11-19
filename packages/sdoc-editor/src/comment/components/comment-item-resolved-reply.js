import React, { Fragment } from 'react';
import { withTranslation } from 'react-i18next';
import dayjs from 'dayjs';

const CommentItemResolvedReply = ({ reply, t }) => {

  return (
    <Fragment>
      <div className='sdoc-comment-item'>
        <div className='sdoc-comment-header'>
          <div className='sdoc-comment-author'>
            <span className='sdoc-comment-author__avatar'><img alt='' src={reply.avatar_url}/></span>
            <span className='sdoc-comment-author__info'>
              <span className='sdoc-name'>{reply.user_name}</span>
              <span className='sdoc-time'>{dayjs(reply.updated_at).format('MM-DD HH:mm')}</span>
            </span>
          </div>
        </div>
        <p className='sdoc-comment-content'>
          {reply.reply === 'True' && <span>{t('Mark_as_Resolved')}</span>}
          {reply.reply === 'False' && <span>{t('Resubmitted')}</span>}
        </p>
      </div>
    </Fragment>
  );
};

export default withTranslation('sdoc-editor')(CommentItemResolvedReply);
