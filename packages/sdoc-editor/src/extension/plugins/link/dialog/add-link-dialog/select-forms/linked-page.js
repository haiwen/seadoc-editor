import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from 'reactstrap';
import classNames from 'classnames';
import isHotkey from 'is-hotkey';
import { WIKI_EDITOR } from '../../../../../../constants';
import { PageDisplay } from './selected-page-display';

import './linked-page.css';

const LinkedPagesForm = ({ editor, element, setSelectedPageId, setSelectedBlockId, setURL }) => {
  const { t } = useTranslation('sdoc-editor');
  const [isOpenSelect, setIsOpenSelect] = useState(false);
  const [collapsedMap, setCollapsedMap] = useState({});
  const [temSearchContent, setTemSearchContent] = useState('');
  const [searchContent, setSearchContent] = useState('');
  const [isOpenSearch, setIsOpenSearch] = useState(false);
  const [searchResult, setSearchResult] = useState([]);
  const searchRef = useRef(null);

  const wikiPageList = editor.editorType === WIKI_EDITOR && window.wiki?.config?.navConfig.pages;
  const wikiNavPages = editor.editorType === WIKI_EDITOR && window.wiki?.config?.navConfig.navigation;
  const { linked_wiki_page_id } = element || {};
  const [displayedWikiPage, setDisplayedWikiPage] = useState(linked_wiki_page_id || '');

  const isCollapsed = (dirId) => !collapsedMap[dirId];

  const toggleDir = (dirId) => {
    setCollapsedMap(prev => ({
      ...prev,
      [dirId]: !prev[dirId],
    }));
  };

  const executeSearch = useCallback(() => {
    if (!temSearchContent.trim()) {
      setSearchContent('');
      setIsOpenSearch(false);
      return;
    }

    setSearchContent(temSearchContent);
    setIsOpenSearch(true);
  }, [temSearchContent]);

  const handleSearchInputChange = useCallback((e) => {
    const keyword = e.target.value.toLowerCase();
    setTemSearchContent(keyword);
  }, []);

  const handleInputKeyDown = useCallback((e) => {
    if (isHotkey('enter', e)) {
      e.preventDefault();
      executeSearch();
    }

    if (isHotkey('escape', e)) {
      e.preventDefault();
      e.stopPropagation();

      const el = searchRef.current;
      if (!el) return;
      el && el.blur();
      el && (el.value = '');

      setSearchContent('');
      setIsOpenSearch(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [executeSearch, isOpenSearch]);

  const getSearchPages = (searchContent) => {
    const result = wikiPageList.filter(p => p.name?.includes(searchContent));
    result && setSearchResult(result);
  };

  const handleSelect = (e, pageId) => {
    e.stopPropagation();
    setSelectedPageId(pageId);
    setSelectedBlockId('');
    setURL('');

    setDisplayedWikiPage(pageId);
    setIsOpenSelect(false);
    setIsOpenSearch(false);
  };

  const handleOnClickClose = (e) => {
    e.stopPropagation();

    const el = searchRef.current;
    if (!el) return;
    el && el.blur();
    el && (el.value = '');

    setIsOpenSearch(false);
    setSearchContent('');
  };

  useEffect(() => {
    if (searchContent.trim() && isOpenSearch) {
      getSearchPages(searchContent);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpenSearch, searchContent]);

  const renderPage = (item, wikiPageList, depth = 0, isFromSearch) => {
    const page = wikiPageList.find(p => p.id === item.id);

    if (isFromSearch) {
      page.isDir = false;
    }

    return (
      <div
        key={page.id}
        className='sdoc-wiki-link-page-item-wrapper'
        style={{ paddingLeft: depth * 16 }}
      >
        <div className={classNames('sdoc-wiki-link-page-item', {
          'is-dir': page.isDir,
        })}>
          {page.isDir &&
            <span className={classNames('toggle-icon-container', { 'opened': !isCollapsed(page.id) })} onClick={(e) => {
              e.stopPropagation();
              toggleDir(page.id);
            }}>
              <i className='sdoc-file-icon sdoc-file-icon-toggle sdocfont sdoc-arrow-down' />
            </span>}
          <span className='sdoc-wiki-link-page-main'
            onClick={(e) => handleSelect(e, page.id)}
          >
            {page.icon && <span className="page-icon">{page.icon}</span>}
            {!page.icon && (
              <>
                {page.isDir ? <span className='page-icon sf3-font sf3-font-files2'/> : <span className='page-icon sf3-font sf3-font-file'/>}
              </>
            )}
            <span className="page-name">{page.name}</span>
          </span>
        </div>
        {page.isDir && !isCollapsed(page.id) && item.children.length > 0 && (
          <div className="sdoc-wiki-link-page-children">
            {item.children.map(child =>
              renderPage(child, wikiPageList, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };


  return (
    <div className="form-group selected-linked-block-wrapper">
      <div
        className={classNames('form-control', { 'expanded': isOpenSelect })}
        onClick={() => {
          setIsOpenSelect(!isOpenSelect);
        }}
      >
        <span className='selected-wiki-linked-page'>
          <PageDisplay pageId={displayedWikiPage} wikiPageList={wikiPageList} />
        </span>
        <i className='sdoc-file-icon sdoc-file-icon-toggle sdocfont sdoc-arrow-down'></i>
      </div>
      {isOpenSelect && (
        <div className='link-block-wrapper sdoc-wiki-link-page'>
          <div className='sdoc-page-search-container'>
            <div className='sdocfont sdoc-find-replace sdoc-search'></div>
            <Input innerRef={searchRef} className='sdoc-search-input' onKeyUp={handleInputKeyDown} onChange={handleSearchInputChange} id='sdoc-search' placeholder={t('Search_page')} />
            <div className='sdoc-search-close-icon' onClick={handleOnClickClose}>
              <i className='sdocfont sdoc-sm-close'></i>
            </div>
          </div>
          {!isOpenSearch && wikiNavPages && wikiNavPages.length > 0 && wikiNavPages.map((item) => {
            return renderPage(item, wikiPageList, 0);
          })}
          {isOpenSearch && searchResult.length > 0 && searchResult.map((item) => {
            return renderPage(item, wikiPageList, 0, true);
          })}
          {isOpenSearch && searchResult.length === 0 &&
            <div className='no-search-result'>{t('No_page_results')}</div>
          }
        </div>
      )}
    </div>
  );
};

export default LinkedPagesForm;
