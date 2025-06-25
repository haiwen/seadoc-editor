import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import isHotkey from 'is-hotkey';
import Tooltip from '../../../components/tooltip';
import context from '../../../context';
import { usePlugins } from '../../../hooks/use-plugins';
import ImageLoader from '../image/image-loader';
import ChatHistory from './chat-history';
import { AI_FINISHED, AI_GENERATING, IS_USER_SPEAK } from './constant';
import { transferredHtml } from './helper';

import './index.css';

const AIAssistantWrapper = ({ chatHistories, setChatHistories }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStop, setIsStop] = useState(false);
  const [isInputFocus, setIsInputFocus] = useState(false);
  const inputRef = useRef();
  const stopGenerationRef = useRef(null);
  const btnRef = useRef();
  const { closePlugin } = usePlugins();
  const { t } = useTranslation('sdoc-editor');

  const getInputContent = () => {
    return inputRef.current.innerText;
  };

  const sendUserMsg = useCallback((text) => {
    setIsGenerating(true);
    const userMsg = { messages: [text], status: IS_USER_SPEAK };
    setChatHistories((prev) => [...prev, userMsg]);
    inputRef.current.innerText = '';
    inputRef.current.focus();
  }, [setChatHistories]);

  const sendAiMsg = useCallback(async (reply) => {
    const formattedHtml = await transferredHtml(reply);
    const aiMsg = { messages: [formattedHtml], status: AI_FINISHED };
    setChatHistories((prev) => [...prev, aiMsg]);
  }, [setChatHistories]);

  const executeAiAssistant = useCallback(async (text, isRegenerated, changedChatIndex) => {
    stopGenerationRef.current = false;
    if (!(text || '').trim()) return;

    const res = await context.aiDocumentAssistant(text);
    const reply = res.data.content;

    if (!stopGenerationRef.current) {
      setIsGenerating(false);
      setIsStop(false);

      if (isRegenerated) {
        const formattedHtml = await transferredHtml(reply);
        setChatHistories(prev =>
          prev.map((chat, index) => {
            if (index === changedChatIndex) {
              return { ...chat, messages: [formattedHtml], status: AI_FINISHED };
            }
            return chat;
          })
        );
      } else {
        await sendAiMsg(reply);
      }
    }
  }, [sendAiMsg, setChatHistories]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const text = getInputContent();
    if (!text.trim()) return '';

    sendUserMsg(text);
    executeAiAssistant(text);
  }, [executeAiAssistant, sendUserMsg]);

  const handleStop = useCallback((e) => {
    setIsGenerating(false);
    setIsStop(true);
    stopGenerationRef.current = true;
  }, []);

  const handleContinueGenerate = useCallback((e) => {
    setIsStop(false);
    setIsGenerating(true);
    const text = chatHistories.at(-1).messages[0];
    executeAiAssistant(text);
  }, [executeAiAssistant, chatHistories]);

  const onEnter = useCallback((e) => {
    if (isHotkey('shift+enter', e)) return;

    if (isHotkey('enter', e) && !isGenerating) {
      e.preventDefault();
      e.stopPropagation();
      const text = getInputContent();
      if (!text.trim()) return '';

      sendUserMsg(text);
      executeAiAssistant(text);
    }
  }, [executeAiAssistant, sendUserMsg, isGenerating]);

  const handleRegenerate = useCallback((chatIndex) => {
    const text = chatHistories[chatIndex - 1]?.messages[0];
    const newChatHistories = chatHistories.map((chat, index) => {
      if (index === chatIndex) {
        return { ...chat, status: AI_GENERATING };
      } else {
        return chat;
      }
    });
    setChatHistories(newChatHistories);

    executeAiAssistant(text, true, chatIndex);
  }, [executeAiAssistant, chatHistories, setChatHistories]);

  useEffect(() => {
    inputRef.current && inputRef.current.focus();
  }, []);

  return (
    <div className='sdoc-ai-assistant-drawer'>
      <div className='ai-assistant-panel-wrapper'>
        <div className='ai-assistant-panel-header'>
          <div className='ai-assistant-panel-header-left'>
            <i className='sdocfont sdoc-ai'></i>
            <span className='title'>{t('AI_document_assistant')}</span>
          </div>
          <div className='ai-assistant-panel-header-right' onClick={closePlugin}>
            <i className='sdocfont sdoc-sm-close'></i>
          </div>
        </div>
        <div className='ai-assistant-panel-body'>
          <div className='ai-assistant-body-content'>
            <div className='ai-assistant-body-title'>{t('Hi_I_am_AI_document_assistant')}</div>
            {chatHistories.map((chat, chatIndex) => {
              return (
                <ChatHistory
                  key={`chat-${chatIndex}`}
                  chat={chat}
                  t={t}
                  chatIndex={chatIndex}
                  handleRegenerate={handleRegenerate}
                />
              );
            })}
            {isGenerating &&
              <div className='sdoc-ai-assistant-tip'>
                <ImageLoader />
                <div className='sdoc-ai-assistant-tip-content'>{t('Generating_answers_based_on_this_document ...')}</div>
              </div>
            }
            {isStop &&
              <div className='sdoc-ai-assistant-chat-pause'>
                <div className='sdoc-ai-assistant-pause-content'>{t('Response_paused')}</div>
                <div className='sdoc-ai-assistant-chat-assistant-avatar'>
                  <i className='sdocfont sdoc-play' id='sdoc-play-btn' onClick={handleContinueGenerate}>
                    <Tooltip target='sdoc-play-btn'>
                      {t('Resume_generating')}
                    </Tooltip>
                  </i>
                </div>
              </div>
            }
          </div>
          <div className='ai-assistant-input-wrapper'>
            <div className={classNames('ai-assistant-input-container', { 'active': isInputFocus })}>
              <div className='ai-assistant-chat-input-content' onKeyDown={onEnter}>
                <div className='input-content'
                  ref={inputRef}
                  placeholder={t('Please_input_your_command')}
                  contentEditable='true'
                  onFocus={() => setIsInputFocus(true)}
                  onBlur={() => setIsInputFocus(false)}
                />
              </div>
              <div className='ai-assistant-chat-operations'>
                {isGenerating ?
                  <i className='sdocfont sdoc-pause' ref={btnRef} onClick={handleStop}></i>
                  :
                  <i className='sdocfont sdoc-save' ref={btnRef} onClick={handleSubmit}></i>
                }
                <Tooltip target={btnRef}>
                  {isGenerating ? t('Pause_reply') : t('Send')}
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantWrapper;
