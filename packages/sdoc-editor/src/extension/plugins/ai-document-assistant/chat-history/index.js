import React from 'react';
import classNames from 'classnames';
import copy from 'copy-to-clipboard';
import toaster from '../../../../components/toast';
import Tooltip from '../../../../components/tooltip';
import ImageLoader from '../../image/image-loader';
import { AI_FINISHED, AI_GENERATING, IS_USER_SPEAK } from '../constant';
import { markdownContentRenderer } from '../helper';

const ChatHistory = ({ t, chat, chatIndex, handleRegenerate }) => {
  const { messages, status } = chat;
  if (!Array.isArray(messages) && messages.length === 0) return null;

  const onCopy = () => {
    copy('copy', {
      onCopy: (clipboardData) => {
        clipboardData.setData('text/html', messages);
      }
    });
    toaster.success(t('Copied'), { hasCloseButton: false, duration: 2 });
  };

  return (
    <div className={classNames('sdoc-ai-assistant-chat', { 'user-input-chat': status === IS_USER_SPEAK })}>
      {status === IS_USER_SPEAK &&
        <div className='sdoc-ai-assistant-chat-main'>
          {messages}
        </div>
      }
      {status === AI_FINISHED &&
        <div className='sdoc-ai-assistant-chat-container'>
          <div className='sdoc-ai-assistant-chat-main'>
            {markdownContentRenderer(messages[0])}
          </div>
          <div className='sdoc-ai-assistant-chat-footer'>
            <div className='sdoc-ai-assistant-chat-assistant-avatar'>
              <i className='sdocfont sdoc-copy' id='sdoc-copy-btn' onClick={onCopy}>
                <Tooltip target='sdoc-copy-btn'>
                  {t('Copy')}
                </Tooltip>
              </i>
              <i className='sdocfont sdoc-retry' id='sdoc-retry-btn' onClick={() => handleRegenerate(chatIndex)}>
                <Tooltip target='sdoc-retry-btn'>
                  {t('Generate_again')}
                </Tooltip>
              </i>
            </div>
          </div>
        </div>
      }
      {status === AI_GENERATING &&
        <div className='sdoc-ai-assistant-tip'>
          <ImageLoader />
          <div className='sdoc-ai-assistant-tip-content'>{t('Generating answers based on this document ...')}</div>
        </div>
      }
    </div>
  );
};

export default ChatHistory;
