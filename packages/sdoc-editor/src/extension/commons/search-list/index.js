import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from 'reactstrap';
import { KeyCodes } from '../../../constants';

import './index.css';

export default function SearchList({ list: originalList, listItem: ListItem, onListItemClick, onEscClick }) {

  const { t } = useTranslation('sdoc-editor');
  const inputWrapperRef = useRef(null);
  const isComposingRef = useRef(null);
  const listRefs = useRef([]);
  const [searchedList, setSearchedList] = useState(originalList);
  const [currentSelectIndex, setCurrentSelectIndex] = useState(-1);

  // search input
  const onChange = useCallback((event) => {
    if (isComposingRef.current) return;

    const value = event.target.value.trim();
    if (value) {
      const list = originalList.filter(item => item.label.indexOf(value) > -1);
      setSearchedList(list);
    } else {
      setSearchedList(originalList);
    }
  }, [originalList]);

  const onCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const onCompositionEnd = useCallback((e) => {
    isComposingRef.current = false;
    onChange(e);
  }, [onChange]);

  // search content list
  const onItemClick = useCallback((item) => {
    onListItemClick && onListItemClick(item);
  }, [onListItemClick]);

  const onHandleInputFocus = useCallback((isFocus) => {
    if (inputWrapperRef.current) {
      queueMicrotask(() => {
        isFocus ? inputWrapperRef.current.focus() : inputWrapperRef.current.blur();
      });
    }
  }, []);

  useEffect(() => {
    if (currentSelectIndex === -1) {
      onHandleInputFocus(true);
    } else {
      onHandleInputFocus(false);
    }
  }, [currentSelectIndex, onHandleInputFocus]);

  const handleClick = useCallback((event) => {
    if (inputWrapperRef?.current?.contains(event.target) || inputWrapperRef.current === event.target) {
      event.stopPropagation();
      event.nativeEvent && event.nativeEvent.stopImmediatePropagation && event.nativeEvent.stopImmediatePropagation();
      return;
    }
  }, []);

  const scrollIntoView = useCallback((index) => {
    if (index === -1) return;
    listRefs.current[index].scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    });
  }, []);

  const handleKeyDown = useCallback((e) => {
    const { UpArrow, DownArrow, Enter, Esc } = KeyCodes;
    const { keyCode } = e;

    if (keyCode === UpArrow) {
      e.preventDefault();
      if (currentSelectIndex > -1) {
        setCurrentSelectIndex(currentSelectIndex - 1);
        scrollIntoView(currentSelectIndex - 1);
      }
    }

    if (keyCode === DownArrow) {
      e.preventDefault();
      if (currentSelectIndex === searchedList.length - 1) return;
      if (currentSelectIndex < searchedList.length - 1) {
        setCurrentSelectIndex(currentSelectIndex + 1);
        scrollIntoView(currentSelectIndex + 1);
      }
    }

    if (keyCode === Enter) {
      e.preventDefault();
      const item = searchedList[currentSelectIndex];
      onItemClick(item);
    }

    if (keyCode === Esc) {
      e.preventDefault();
      onEscClick && onEscClick();
    }
  }, [currentSelectIndex, onEscClick, onItemClick, scrollIntoView, searchedList]);


  useEffect(() => {
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClick);
    };
  }, [handleClick, handleKeyDown]);

  return (
    <div className='sdoc-search-list'>
      <div className='sdoc-search-list-wrapper'>
        <Input
          innerRef={inputWrapperRef}
          placeholder={t('Search_action')}
          onChange={onChange}
          onCompositionStart={onCompositionStart}
          onCompositionEnd={onCompositionEnd}
        />
      </div>
      <div className='sdoc-search-list-content-wrapper'>
        {searchedList.length === 0 && (
          <div className='sdoc-search-list-with-no-results'>{t('No_results')}</div>
        )}
        {searchedList.map((item, index) => {
          const isSelected = index === currentSelectIndex;
          return <ListItem innerRef={(el) => (listRefs.current[index] = el)} key={index} item={item} onItemClick={onItemClick} isSelected={isSelected} />;
        })}
      </div>
    </div>
  );
}
