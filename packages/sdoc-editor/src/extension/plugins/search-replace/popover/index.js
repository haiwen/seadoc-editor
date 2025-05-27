import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Input, Label } from 'reactstrap';
import isHotkey from 'is-hotkey';
import PropTypes from 'prop-types';
import { INTERNAL_EVENT } from '../../../../constants';
import context from '../../../../context';
import debounce from '../../../../utils/debounce';
import EventBus from '../../../../utils/event-bus';
import { handleReplaceKeyword, getHighlightInfos, drawHighlights } from '../helper';
import ReplaceAllConfirmModal from './replace-all-confirm-modal';

import './index.css';

const SearchReplacePopover = ({ editor, closePopover, readonly }) => {
  const [searchContent, setSearchContent] = useState('');
  const [replacementContent, setReplacementContent] = useState('');
  const [highlightInfos, setHighlightInfos] = useState([]);
  const [isMoving, setIsMoving] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 100 });
  const [currentSelectIndex, setCurrentSelectIndex] = useState(0);
  const [isOpenReplaceAllModal, setIsOpenReplaceAllModal] = useState(false);
  const pageInnerSizeRef = useRef({ x: window.innerWidth, y: window.innerHeight });
  const shouldScrollIntoView = useRef(false);
  const popoverContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const { t } = useTranslation('sdoc-editor');

  const searchInputSuffixContent = useMemo(() => {
    if (!!searchContent.length && !highlightInfos.length) return t('Search_not_found');
    if (highlightInfos.length) return `${currentSelectIndex + 1} / ${highlightInfos.length}`;
  }, [currentSelectIndex, highlightInfos.length, searchContent.length, t]);

  useEffect(() => {
    let y = 95;
    if (editor.topOffset) {
      y = editor.topOffset;
    }
    setPopoverPosition({ x: pageInnerSizeRef.current.x - 420, y });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isOwnReplacePermission = useMemo(() => {
    if (readonly) return false;

    const isFreezed = context.getSetting('isFreezed');
    if (isFreezed) return false;

    const isPublished = context.getSetting('isPublished');
    const isSdocRevision = context.getSetting('isSdocRevision');
    if (isSdocRevision && isPublished) return false;

    const docPerm = context.getSetting('docPerm');
    if (docPerm === 'rw') return true;

    return false;
  }, [readonly]);

  const handleDrawHighlight = useCallback((editor, keyword) => {
    const newHighlightInfos = getHighlightInfos(editor, keyword);
    setHighlightInfos(newHighlightInfos);
    let newSelectIndex = currentSelectIndex;
    if (!shouldScrollIntoView.current && newHighlightInfos.length !== highlightInfos.length) {
      newSelectIndex = 0;
    }
    if (newSelectIndex >= newHighlightInfos.length) {
      newSelectIndex = newHighlightInfos.length - 1;
    }
    if (newSelectIndex < 0 && newHighlightInfos.length) {
      newSelectIndex = 0;
    }
    setCurrentSelectIndex(newSelectIndex);
  }, [currentSelectIndex, highlightInfos.length, shouldScrollIntoView]);

  const handleDrawHighlightLister = useCallback(() => {
    handleDrawHighlight(editor, searchContent);
    pageInnerSizeRef.current = { x: window.innerWidth, y: window.innerHeight };
  }, [editor, handleDrawHighlight, searchContent]);

  useEffect(() => {
    const highlightInfos = getHighlightInfos(editor, searchContent);
    drawHighlights(editor, highlightInfos, currentSelectIndex, shouldScrollIntoView.current);
    shouldScrollIntoView.current = false;
  }, [currentSelectIndex, editor, searchContent, highlightInfos, shouldScrollIntoView]);

  useEffect(() => {
    const eventBus = EventBus.getInstance();
    const unSubscribe = eventBus.subscribe(INTERNAL_EVENT.UPDATE_SEARCH_REPLACE_HIGHLIGHT, handleDrawHighlightLister);
    return () => {
      unSubscribe();
    };
  }, [editor, handleDrawHighlight, handleDrawHighlightLister, highlightInfos.length, searchContent]);

  const handleSearchInputChange = useCallback((e) => {
    const keyword = e.target.value;
    shouldScrollIntoView.current = true;
    setSearchContent(keyword);
    handleDrawHighlight(editor, keyword);
    setCurrentSelectIndex(0);
  }, [editor, handleDrawHighlight]);

  const handleLast = useCallback(() => {
    const currentIndex = currentSelectIndex === 0
      ? highlightInfos.length - 1
      : currentSelectIndex - 1;
    setCurrentSelectIndex(currentIndex);
    shouldScrollIntoView.current = true;
  }, [currentSelectIndex, highlightInfos.length]);

  const handleNext = useCallback(() => {
    const currentIndex = currentSelectIndex === highlightInfos.length - 1
      ? 0
      : currentSelectIndex + 1;
    setCurrentSelectIndex(currentIndex);
    shouldScrollIntoView.current = true;
  }, [currentSelectIndex, highlightInfos.length]);

  const handleOpenReplaceAllModal = useCallback(() => {
    setIsOpenReplaceAllModal(true);
  }, []);

  const handleCloseReplaceAllModal = useCallback(() => {
    setIsOpenReplaceAllModal(false);
  }, []);

  const handleReplace = useCallback(() => {
    handleReplaceKeyword(editor, [highlightInfos[currentSelectIndex]], replacementContent);
    shouldScrollIntoView.current = true;
  }, [currentSelectIndex, editor, highlightInfos, replacementContent]);

  const handleReplaceAll = useCallback(() => {
    handleReplaceKeyword(editor, highlightInfos, replacementContent);
    handleCloseReplaceAllModal();
  }, [editor, handleCloseReplaceAllModal, highlightInfos, replacementContent]);

  const handleStartMove = useCallback((e) => {
    if (!e.target.className.includes('sdoc-search-replace-popover-container')) return;
    setIsMoving(true);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isMoving) return;
    const { width, height } = popoverContainerRef.current.getBoundingClientRect();
    const { movementX, movementY } = e;
    let x = popoverPosition.x + movementX;
    let y = popoverPosition.y + movementY;
    if (x <= 0) x = 0;
    if (y < 0) y = 0;
    if (x + width >= pageInnerSizeRef.current.x) x = pageInnerSizeRef.current.x - width;
    if (y + height >= pageInnerSizeRef.current.y) y = pageInnerSizeRef.current.y - height;
    setPopoverPosition({ x, y });
  }, [isMoving, popoverPosition.x, popoverPosition.y]);

  const handleFinishMove = useCallback(() => {
    setIsMoving(false);
  }, []);

  const handleInputKeyDown = (e) => {
    if (!highlightInfos.length) return;
    if (isHotkey('enter', e)) handleNext();
    if (isHotkey('enter+shift', e)) handleLast();
  };

  return (
    createPortal(
      <>
        <div
          className='sdoc-search-replace-popover-container'
          onMouseDown={handleStartMove}
          onMouseMove={handleMouseMove}
          onMouseUp={handleFinishMove}
          onMouseLeave={handleFinishMove}
          ref={popoverContainerRef}
          style={{ left: popoverPosition.x, top: popoverPosition.y }}
        >
          <div className='sdoc-search-replace-popover-title'>
            <span className='sdoc-search-replace-title-text'>{t('Search_and_replace')}</span>
            <i onClick={closePopover} className='sdocfont sdoc-sm-close sdoc-search-replace-title-close'></i>
          </div>
          <div className='sdoc-search-replace-popover-body'>
            <Label for='sdoc-search-replace-search-ipt'>{t('Search')}</Label>
            <div className='sdoc-replace-ipt-container'>
              <Input ref={searchInputRef} autoFocus onKeyUp={handleInputKeyDown} onChange={debounce(handleSearchInputChange, 300)} id='sdoc-search-replace-search-ipt' placeholder={t('Type_search_content')} />
              {searchInputSuffixContent && <div className='sdoc-replace-ipt-tip'>{searchInputSuffixContent}</div>}
            </div>
            <Label className='sdoc-replace-ipt-label' for='sdoc-search-replace-replace-ipt'>{t('Replace_as')}</Label>
            <Input onChange={(e) => setReplacementContent(e.target.value)} id='sdoc-search-replace-replace-ipt' placeholder={t('Type_replace_content')} />
            <div className='sdoc-search-replace-popover-btn-group'>
              <button disabled={!highlightInfos.length} onClick={handleLast} className='btn btn-secondary'>{t('Prevs')}</button>
              <button disabled={!highlightInfos.length} onClick={handleNext} className='btn btn-secondary'>{t('Next')}</button>
              <button disabled={!highlightInfos.length || !isOwnReplacePermission} onClick={handleReplace} className='btn btn-primary'>{t('Replace')}</button>
              <button disabled={!highlightInfos.length || !isOwnReplacePermission} onClick={handleOpenReplaceAllModal} className='btn btn-primary'>{t('Replace_all')}</button>
            </div>
          </div>
        </div>
        <ReplaceAllConfirmModal
          isOpen={isOpenReplaceAllModal}
          handleConfirm={handleReplaceAll}
          handleCancel={handleCloseReplaceAllModal}
          number={highlightInfos.length}
          originalWord={searchContent}
          replacedWord={replacementContent}
        />
      </>, document.body)
  );
};

SearchReplacePopover.propTypes = {
  editor: PropTypes.object.isRequired,
};

export default SearchReplacePopover;
