import React, { Fragment } from 'react';
import { withTranslation } from 'react-i18next';
import dayjs from 'dayjs';

const CommentItemResolvedReply = ({ reply, t }) => {

  return (
    <Fragment>
      <div className='comment-item'>
        <div className='comment-header'>
          <div className='comment-author'>
            <span className='comment-author__avatar'><img alt='' src={reply.avatar_url}/></span>
            <span className='comment-author__info'>
              <span className='name'>{reply.user_name}</span>
              <span className='time'>{dayjs(reply.updated_at).format('MM-DD HH:mm')}</span>
            </span>
          </div>
        </div>
        <p className='comment-content'>
          {reply.reply === 'True' && <span>{t('Mark_as_Resolved')}</span>}
          {reply.reply === 'False' && <span>{t('Resubmitted')}</span>}
        </p>
      </div>
    </Fragment>
  );
};

export default withTranslation('sdoc-editor')(CommentItemResolvedReply);
