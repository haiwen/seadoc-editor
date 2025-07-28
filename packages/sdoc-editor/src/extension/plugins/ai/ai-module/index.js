import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor, Node, Path, Range, Transforms } from '@seafile/slate';
import { ReactEditor } from '@seafile/slate-react';
import copy from 'copy-to-clipboard';
import isHotkey from 'is-hotkey';
import toaster from '../../../../components/toast';
import context from '../../../../context';
import processor from '../../../../slate-convert/md-to-html';
import mdStringToSlate from '../../../../slate-convert/md-to-slate';
import slateToMdString from '../../../../slate-convert/slate-to-md';
import { ElementPopover } from '../../../commons';
import DropdownMenuItem from '../../../commons/dropdown-menu-item';
import { PARAGRAPH } from '../../../constants';
import { focusEditor, generateEmptyElement, getAboveBlockNode, getTopLevelBlockNode } from '../../../core';
import AIIcon from '../ai-icon';
import { AI_MIN_HEIGHT, OPERATION_MENUS_CONFIG, OPERATION_TYPES } from '../constants';
import AdjustSubMenu from './adjust-sub-menu';
import { handleSelectElements, insertHtmlTransferredNodes, markdownTableRenderer, removeMarks, validateNestedStructure } from './helpers';
import LangSubMenu from './lang-sub-menu';
import TipDialog from './tip-dialog';

import './style.css';

export default function AIModule({ editor, element, closeModule }) {
  const { t } = useTranslation('sdoc-editor');
  const aiRef = useRef(null);
  const inputRef = useRef(null);

  const scrollRef = useRef(null);
  const [isShowAIPopover, setIsShowAIPopover] = useState(false);
  const [opType, setOpType] = useState('');
  const [selectedValue, setSelectedValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [oldSearchValue, setOldSearchValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [currentLang, setCurrentLang] = useState('en');
  const [isShowTipDialog, setIsShowTipDialog] = useState(false);

  const toggleAskAI = useCallback(() => {
    // Add marks for selection
    Editor.addMark(editor, 'sdoc_ai', true);
    scrollRef.current = document.querySelector('.sdoc-scroll-container');
    const { scrollTop, scrollHeight } = scrollRef.current;

    if (!element) {
      const selectElements = handleSelectElements(editor);
      let content = '';

      if (selectElements) {
        if (validateNestedStructure(selectElements[0])) {
          // list.length === 1
          content = window.getSelection().toString();
        } else {
          selectElements.forEach((item) => {
            content += slateToMdString(item);
          });
        }

        // Add paragraph symbol for selected content
        let newContent = content;
        if (content.includes('\n')) {
          newContent = content.replace(/\n/g, '\n\n');
        }
        setSelectedValue(newContent);
      }

      const domSelection = window.getSelection();
      const domRange = domSelection.getRangeAt(0);
      const rect = domRange.getBoundingClientRect();

      const needPaddingBottomHeight = scrollTop + rect.bottom + AI_MIN_HEIGHT - scrollHeight;

      if (needPaddingBottomHeight > 0) {
        const articleDom = document.querySelector('.sdoc-editor__article');
        articleDom.style.paddingBottom = needPaddingBottomHeight + 'px';
      }

      const isInView = (rect.top + rect.height) - window.innerHeight;
      const heightDiff = rect.bottom + AI_MIN_HEIGHT - window.innerHeight;
      if (heightDiff > 0) {
        if (isInView < 0) {
          scrollRef.current.scrollTo({
            top: scrollTop + rect.top - 94,
            behavior: 'smooth'
          });
        } else {
          scrollRef.current.scrollTo({
            top: scrollTop + (rect.bottom - 94) - 100, // scroll top + the rect bottom with container top - shown content height
            behavior: 'smooth'
          });
        }
      }

      setTimeout(() => {
        const aboveNode = getAboveBlockNode(editor);
        const slateDom = ReactEditor.toDOMNode(editor, aboveNode[0]);
        const slateRect = slateDom.getBoundingClientRect();
        const markedSpan = document.querySelectorAll('span[data-slate-leaf="true"].sdoc_ai');
        let rect;
        if (markedSpan.length) {
          rect = markedSpan[markedSpan.length - 1].getBoundingClientRect();
        }
        const el = aiRef.current;
        el.style.top = `${rect?.bottom + 8 - 3.23 }px`; // top = Current top + Element height - Element padding bottom
        el.style.left = `${slateRect.left}px`;
        el.style.display = 'block';

        setIsShowAIPopover(true);
        inputRef.current?.focus();
      }, 500);
      return;
    }

    const slateDom = ReactEditor.toDOMNode(editor, element);
    const slateRect = slateDom.getBoundingClientRect();

    const content = Node.string(element);
    if (content) {
      let newContent = content;
      if (content.includes('\n')) {
        newContent = content.replace(/\n/g, '\n\n');
      }
      setSelectedValue(newContent);
    }

    const needPaddingBottomHeight = scrollTop + slateRect.bottom + AI_MIN_HEIGHT - scrollHeight;

    if (needPaddingBottomHeight > 0) {
      const articleDom = document.querySelector('.sdoc-editor__article');
      articleDom.style.paddingBottom = needPaddingBottomHeight + 'px';
    }

    const heightDiff = slateRect.bottom + AI_MIN_HEIGHT - window.innerHeight;
    if (heightDiff > 0) {
      scrollRef.current.scrollTo({
        top: scrollTop + slateRect.top - 94,
        behavior: 'smooth'
      });
    }

    setTimeout(() => {
      const slateRect = slateDom.getBoundingClientRect();

      const el = aiRef.current;
      el.style.top = `${slateRect.bottom + 8}px`; // top = Current top + Element height
      el.style.left = `${slateRect.left}px`;
      el.style.display = 'block';

      setIsShowAIPopover(true);
      inputRef.current?.focus();
    }, 500);


  }, [editor, element]);

  const onCloseClick = useCallback(() => {
    removeMarks(editor);
    const element = aiRef.current;
    element.style.display = 'none';

    const articleDom = document.querySelector('.sdoc-editor__article');
    articleDom.style.removeProperty('padding-bottom');

    setSearchValue('');
    setSearchResult('');
    setIsShowAIPopover(false);
    closeModule();
  }, [closeModule, editor]);

  const onDocumentClick = useCallback((event) => {
    // not in ai container
    if (aiRef.current && aiRef.current.contains(event.target) && aiRef.current !== event.target) return;
    // context menu toggle
    const contextAskAI = document.querySelector('#context-toolbar-ai');
    if (contextAskAI && contextAskAI.contains(event.target)) return;

    const sideAskAI = document.querySelector('#side-toolbar-ai');
    if (sideAskAI && sideAskAI.contains(event.target)) return;

    // click in submenu
    const adjustSubMenu = document.querySelector('.ai-adjust-sub-menu');
    if (adjustSubMenu && adjustSubMenu.contains(event.target)) return;

    const langSubMenu = document.querySelector('.ai-lang-sub-menu');
    if (langSubMenu && langSubMenu.contains(event.target)) return;


    if (!searchResult || opType === OPERATION_TYPES.TRANSLATE) {
      onCloseClick();
      return;
    }
    if (searchResult) {
      setIsShowTipDialog(true);
    }
  }, [onCloseClick, opType, searchResult]);

  useEffect(() => {
    toggleAskAI();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.addEventListener('click', onDocumentClick);
    return () => {
      window.removeEventListener('click', onDocumentClick);
    };
  }, [onDocumentClick]);

  const onScroll = useCallback((event) => {
    if (!element) {
      const markedSpan = document.querySelectorAll('span[data-slate-leaf="true"].sdoc_ai');
      let rect;
      if (markedSpan.length) {
        rect = markedSpan[markedSpan.length - 1].getBoundingClientRect();
      }

      const aboveNode = getAboveBlockNode(editor);
      const slateDom = ReactEditor.toDOMNode(editor, aboveNode[0]);
      const slateRect = slateDom.getBoundingClientRect();

      const el = aiRef.current;
      el.style.top = `${rect?.bottom + 8 - 3.23}px`; // top = Current top + Element height - Element padding bottom
      el.style.left = `${slateRect.left}px`;
      el.style.display = 'block';
    } else {
      const slateDom = ReactEditor.toDOMNode(editor, element);
      const slateRect = slateDom.getBoundingClientRect();
      const el = aiRef.current;
      el.style.top = `${slateRect.bottom + 8}px`; // top = Current top + Element height
      el.style.left = `${slateRect.left}px`;
      el.style.display = 'block';
    }

  }, [editor, element]);

  useEffect(() => {
    let observerRefValue = null;
    if (isShowAIPopover) {
      scrollRef.current && scrollRef.current.addEventListener('scroll', onScroll);
      observerRefValue = scrollRef.current;
    } else {
      scrollRef.current && scrollRef.current.removeEventListener('scroll', onScroll);
    }
    return () => {
      if (observerRefValue) {
        observerRefValue.removeEventListener('scroll', onScroll);
      }
    };
  }, [isShowAIPopover, onScroll]);

  const onSearchValueChanged = useCallback((event) => {
    const value = event.target.value;
    if (value === searchValue) return;
    setSearchValue(value);
  }, [searchValue]);

  const transferHtml = async (mdString) => {
    const htmlString = await processor.process(mdString);
    const formatHtml = String(htmlString).trim();
    setSearchResult(formatHtml);
  };

  const onEnter = useCallback((event) => {
    if (!searchValue) return;
    setOpType(OPERATION_TYPES.DEFAULT);
    setIsGenerating(true);
    const defaultContent = selectedValue;
    const custom_prompt = searchValue;
    if (!custom_prompt) {
      toaster.danger(t('Processing_content_cannot_be_empty'));
      return;
    }
    context.writingAssistant(defaultContent, 'ask', custom_prompt).then(res => {
      let { content } = res.data;
      transferHtml(content);
      setIsGenerating(false);
      setSearchValue('');
      setOldSearchValue(searchValue);
    }).catch(err => {
      setIsGenerating(false);
      toaster.danger('AI_error_message');
      setSearchValue('');
      setOldSearchValue(searchValue);
    });
  }, [searchValue, selectedValue, t]);

  const onKeyDown = useCallback((event) => {
    if (isHotkey('enter', event)) {
      event.preventDefault();
      onEnter();
    }
  }, [onEnter]);

  const inputValue = useMemo(() => {
    const generatingPlaceHolder = t('Thinking');
    if (isGenerating) return generatingPlaceHolder;
    if (!isGenerating) return searchValue;
  }, [isGenerating, searchValue, t]);


  const onContinuationClick = useCallback(() => {
    setOpType(OPERATION_TYPES.CONTINUATION);
    setIsGenerating(true);
    const defaultContent = selectedValue;
    if (!defaultContent) {
      toaster.danger(t('Processing_content_cannot_be_empty'));
      return;
    }
    context.writingAssistant(defaultContent, 'continue_writing').then(res => {
      const { content } = res.data;
      transferHtml(content);
      setIsGenerating(false);
    }).catch(err => {
      setIsGenerating(false);
      toaster.danger('AI_error_message');
    });
  }, [selectedValue, t]);

  const onMoreDetailsClick = useCallback(() => {
    setOpType(OPERATION_TYPES.MORE_DETAILS);
    setIsGenerating(true);
    const defaultContent = selectedValue;
    if (!defaultContent) {
      toaster.danger(t('Processing_content_cannot_be_empty'));
      return;
    }
    context.writingAssistant(defaultContent, OPERATION_TYPES.MORE_DETAILS).then(res => {
      const { content } = res.data;
      transferHtml(content);
      setIsGenerating(false);
    }).catch(err => {
      setIsGenerating(false);
      toaster.danger('AI_error_message');
    });
  }, [selectedValue, t]);

  const onMoreFluentClick = useCallback(() => {
    setOpType(OPERATION_TYPES.MORE_FLUENT);
    setIsGenerating(true);
    const defaultContent = selectedValue;
    if (!defaultContent) {
      toaster.danger(t('Processing_content_cannot_be_empty'));
      return;
    }
    context.writingAssistant(defaultContent, OPERATION_TYPES.MORE_FLUENT).then(res => {
      const { content } = res.data;
      transferHtml(content);
      setIsGenerating(false);
    }).catch(err => {
      setIsGenerating(false);
      toaster.danger('AI_error_message');
    });
  }, [selectedValue, t]);

  const onMoreConciseClick = useCallback(() => {
    setOpType(OPERATION_TYPES.MORE_CONCISE);
    setIsGenerating(true);
    const defaultContent = selectedValue;
    if (!defaultContent) {
      toaster.danger(t('Processing_content_cannot_be_empty'));
      return;
    }
    context.writingAssistant(defaultContent, OPERATION_TYPES.MORE_CONCISE).then(res => {
      const { content } = res.data;
      transferHtml(content);
      setIsGenerating(false);
    }).catch(err => {
      setIsGenerating(false);
      toaster.danger('AI_error_message');
    });
  }, [selectedValue, t]);

  const onMoreVividClick = useCallback(() => {
    setOpType(OPERATION_TYPES.MORE_VIVID);
    setIsGenerating(true);
    const defaultContent = selectedValue;
    if (!defaultContent) {
      toaster.danger(t('Processing_content_cannot_be_empty'));
      return;
    }
    context.writingAssistant(defaultContent, OPERATION_TYPES.MORE_VIVID).then(res => {
      const { content } = res.data;
      transferHtml(content);
      setIsGenerating(false);
    }).catch(err => {
      setIsGenerating(false);
      toaster.danger('Translation_error_message');
    });
  }, [selectedValue, t]);

  const onTranslateClick = useCallback((lang) => {
    const translateValue = selectedValue;
    if (!translateValue) {
      toaster.warning(t('The_translation_content_cannot_be_empty'));
      return;
    }
    setOpType(OPERATION_TYPES.TRANSLATE);
    const translateLang = lang ? lang : currentLang;
    setCurrentLang(translateLang);
    setIsGenerating(true);
    context.aiTranslate(translateValue, translateLang).then(res => {
      const { translation } = res.data;
      transferHtml(translation);
      setIsGenerating(false);
    }).catch(err => {
      setIsGenerating(false);
      toaster.danger('Translation_error_message');
    });
  }, [currentLang, selectedValue, t]);

  const focusToEndPath = useCallback((path) => {
    setTimeout(() => {
      const endOfLastNodePoint = Editor.end(editor, path);
      const range = {
        anchor: endOfLastNodePoint,
        focus: endOfLastNodePoint,
      };
      focusEditor(editor, range);
    }, 0);
  }, [editor]);

  const onInsertClick = useCallback(() => {
    let nextPath = null;
    if (!element) {
      const end = Range.end(editor.selection);
      const aboveNode = getAboveBlockNode(editor, { at: end });
      nextPath = Path.next([aboveNode[1][0]]);
    } else {
      const path = ReactEditor.findPath(editor, element);
      nextPath = Path.next(path);
    }

    // Transfer markdown search result to slate
    // If codeMd，keep all; otherwise，delete \n and empty area
    const optimizedSearchResult = searchResult.replace(/<pre[\s\S]*?<\/pre>|>\s+</g, (match) => {
      return match.startsWith('<pre') ? match : '><';
    }).trim();
    const slateNodeList = mdStringToSlate(optimizedSearchResult);
    insertHtmlTransferredNodes(slateNodeList, nextPath, editor);
    onCloseClick();
    focusToEndPath(nextPath);
  }, [editor, element, focusToEndPath, onCloseClick, searchResult]);

  const onTryAgainClick = useCallback((event) => {
    switch (opType) {
      case OPERATION_TYPES.TRANSLATE:
        onTranslateClick();
        return;
      case OPERATION_TYPES.MORE_FLUENT:
        onMoreFluentClick();
        return;
      case OPERATION_TYPES.MORE_DETAILS:
        onMoreDetailsClick();
        return;
      case OPERATION_TYPES.MORE_CONCISE:
        onMoreConciseClick();
        return;
      case OPERATION_TYPES.MORE_VIVID:
        onMoreVividClick();
        return;
      case OPERATION_TYPES.CONTINUATION:
        onContinuationClick();
        return;
      case OPERATION_TYPES.DEFAULT:
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();

        setSearchValue(oldSearchValue);
        setSearchResult('');
        setOldSearchValue('');
        return;
      default:
        return;
    }
  }, [oldSearchValue, onContinuationClick, onMoreConciseClick, onMoreDetailsClick, onMoreVividClick, onTranslateClick, opType]);

  const onReplaceClick = useCallback(() => {
    if (!element) {
      editor.deleteFragment();
      if (searchResult) {
        const optimizedSearchResult = searchResult.replace(/<pre[\s\S]*?<\/pre>|>\s+</g, (match) => {
          return match.startsWith('<pre') ? match : '><';
        }).trim();
        const slateNodeList = mdStringToSlate(optimizedSearchResult);
        // Insert selection as text if result node is one paragraph nodes; otherwise, insert below
        if (slateNodeList.length === 1 && slateNodeList[0].type === PARAGRAPH && slateNodeList[0].children.length <= 1) {
          const text = slateNodeList[0].children[0].text;
          editor.insertText(text);
        } else {
          const topBlockNode = getTopLevelBlockNode(editor);
          const nextPath = Path.next(topBlockNode[1]);
          insertHtmlTransferredNodes(slateNodeList, nextPath, editor);
        }
      }
      onCloseClick();
      const end = Range.end(editor.selection);
      const aboveNode = getAboveBlockNode(editor, { at: end });
      focusToEndPath(aboveNode[1]);
    } else {
      const path = ReactEditor.findPath(editor, element);
      Transforms.removeNodes(editor, { at: path });
      const p = generateEmptyElement(PARAGRAPH);
      p.children[0].text = searchResult;
      Transforms.insertNodes(editor, p, { at: path });

      onCloseClick();
      focusToEndPath(path);
    }
  }, [editor, element, focusToEndPath, onCloseClick, searchResult]);

  const onCopyClick = useCallback(() => {
    copy(searchResult);
    toaster.success(t('Copied'), { hasCloseButton: false, duration: 2 });
    onCloseClick();
  }, [onCloseClick, searchResult, t]);

  const onDeprecationClick = useCallback(() => {
    onCloseClick();
  }, [onCloseClick]);

  const isShowAdjust = useMemo(() => {
    return ![OPERATION_TYPES.DEFAULT, OPERATION_TYPES.TRANSLATE].includes(opType);
  }, [opType]);

  const closeTipDialog = useCallback(() => {
    setIsShowTipDialog(false);
  }, []);

  const discardCurrentContent = useCallback(() => {
    onCloseClick();
    setIsShowTipDialog(false);
    focusEditor(editor);
  }, [editor, onCloseClick]);

  return (
    <ElementPopover>
      <div className='sdoc-ai-module-container' ref={aiRef}>
        {!searchResult && (
          <Fragment>
            <div className='sdoc-ai-content'>
              <div className='sdoc-ai-search'>
                <AIIcon />
                <input type="text" ref={inputRef} autoFocus placeholder={t('Ask_AI_anything')} value={inputValue} onKeyDown={onKeyDown} onChange={onSearchValueChanged}></input>
                <span className={`sdocfont sdoc-send-arrow ${!searchValue ? 'disable' : ''}`} onClick={onEnter}></span>
              </div>
            </div>
            {!searchValue && (
              <div className='sdoc-ai-operations sdoc-dropdown-menu'>
                <div>
                  <div className='op-type'>{t('Suggestion')}</div>
                  <DropdownMenuItem menuConfig={OPERATION_MENUS_CONFIG.CONTINUATION} onClick={onContinuationClick}/>
                </div>
                <div className="sdoc-dropdown-menu-divider"></div>
                <div>
                  <div className='op-type'>{t('Edit')}</div>
                  <DropdownMenuItem menuConfig={OPERATION_MENUS_CONFIG.MORE_FLUENT} onClick={onMoreFluentClick} />
                  <DropdownMenuItem menuConfig={OPERATION_MENUS_CONFIG.MORE_DETAILS} onClick={onMoreDetailsClick} />
                  <DropdownMenuItem menuConfig={OPERATION_MENUS_CONFIG.MORE_CONCISE} onClick={onMoreConciseClick} />
                  <DropdownMenuItem menuConfig={OPERATION_MENUS_CONFIG.MORE_VIVID} onClick={onMoreVividClick} />
                </div>
                <div className="sdoc-dropdown-menu-divider"></div>
                <div>
                  <div className='op-type'>{t('Translate')}</div>
                  <DropdownMenuItem menuConfig={OPERATION_MENUS_CONFIG.TRANSLATE}>
                    <i className="sdocfont sdoc-right-slide sdoc-dropdown-item-right-icon"></i>
                    <LangSubMenu target={OPERATION_MENUS_CONFIG.TRANSLATE.id} onTranslateClick={onTranslateClick}/>
                  </DropdownMenuItem>
                </div>
              </div>
            )}
          </Fragment>
        )}
        {searchResult && (
          <Fragment>
            <div className='sdoc-ai-content has-result'>
              <div className='sdoc-ai-result'>
                <div className='sdoc-ai-result-content'>
                  {isGenerating ? t('Processing_message') : markdownTableRenderer(searchResult)}
                </div>
              </div>
              <div className='sdoc-ai-search'>
                <AIIcon />
                <input placeholder={t('Ask_AI_anything')} value={inputValue} onKeyDown={onKeyDown} onChange={onSearchValueChanged}></input>
                <span className={`sdocfont sdoc-send-arrow ${!searchValue ? 'disable' : ''}`} onClick={onEnter}></span>
              </div>
            </div>
            {!searchValue && (
              <div className='sdoc-ai-operations sdoc-dropdown-menu'>
                <DropdownMenuItem menuConfig={OPERATION_MENUS_CONFIG.ADJUSTMENT} isHidden={!isShowAdjust}>
                  <i className="sdocfont sdoc-right-slide sdoc-dropdown-item-right-icon"></i>
                  <AdjustSubMenu
                    target={OPERATION_MENUS_CONFIG.ADJUSTMENT.id}
                    onMoreFluentClick={onMoreFluentClick}
                    onMoreDetailsClick={onMoreDetailsClick}
                    onMoreConciseClick={onMoreConciseClick}
                    onMoreVividClick={onMoreVividClick}
                  />
                </DropdownMenuItem>
                <DropdownMenuItem menuConfig={OPERATION_MENUS_CONFIG.INSERT_BELOW} onClick={onInsertClick} />
                <DropdownMenuItem menuConfig={OPERATION_MENUS_CONFIG.TRY_AGAIN} onClick={onTryAgainClick} />
                <DropdownMenuItem menuConfig={OPERATION_MENUS_CONFIG.REPLACE} onClick={onReplaceClick} />
                <DropdownMenuItem menuConfig={OPERATION_MENUS_CONFIG.COPY} onClick={onCopyClick} />
                <DropdownMenuItem menuConfig={OPERATION_MENUS_CONFIG.DEPRECATION} onClick={onDeprecationClick} />
              </div>
            )}
          </Fragment>
        )}
      </div>
      {isShowTipDialog && <TipDialog closeDialog={closeTipDialog} discardCurrentContent={discardCurrentContent} />}
    </ElementPopover>
  );
}
