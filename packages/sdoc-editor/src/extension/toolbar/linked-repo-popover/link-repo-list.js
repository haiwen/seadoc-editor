import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from 'reactstrap';
import PropTypes from 'prop-types';
import { getAccessibleRepos, getWikiSettings } from '../../plugins/file-view/helpers';

import './link-repo-list.css';

const useStopPropagation = () => {
  const stopPropagation = (e) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation?.();
  };

  return {
    onClick: stopPropagation,
    onFocus: stopPropagation,
    onKeyDown: stopPropagation,
    onKeyUp: stopPropagation,
    onKeyPress: stopPropagation,
    onMouseDown: stopPropagation,
    onTouchStart: stopPropagation,
  };
};

const useRepos = () => {
  const wikiSettings = getWikiSettings();
  const accessibleRepos = getAccessibleRepos();
  const { linked_repos: linkedRepoIds } = wikiSettings;
  const optionsMap = accessibleRepos.reduce((result, item) => {
    result[item.repo_id] = item;
    return result;
  }, {});
  return linkedRepoIds.map(id => optionsMap[id]);
};

const LinkedRepoList = ({ onRepoClick }) => {
  const { t } = useTranslation('sdoc-editor');
  const isComposingRef = useRef(null);
  const repoRef = useRef(null);
  const repos = useRepos();
  const [tables, setTables] = useState(repos || []);

  const inputEvents = useStopPropagation();

  const onChange = useCallback((event) => {
    if (isComposingRef.current) return;
    const value = event.target.value.trim().toUpperCase();
    if (value) {
      const list = repos.filter(item => item.repo_name.toUpperCase().includes(value));
      setTables(list);
    } else {
      setTables(repos);
    }
  }, [repos]);

  const onCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const onCompositionEnd = useCallback((e) => {
    isComposingRef.current = false;
    onChange(e);
  }, [onChange]);

  return (
    <div ref={repoRef} className="sdoc-dropdown-menu-container sdoc-linked-repo-list-wrapper">
      <div className='sdoc-linked-repo-list-search-wrapper'>
        <Input
          placeholder={t('Search_1')}
          onChange={onChange}
          autoFocus
          onCompositionStart={onCompositionStart}
          onCompositionEnd={onCompositionEnd}
          {...inputEvents}
        />
      </div>
      <div className='sdoc-linked-repo-list-content-wrapper'>
        {tables.map(item => {
          return (
            <div key={item.repo_id} className="sdoc-dropdown-menu-item text-truncate d-block" onClick={() => onRepoClick(item)}>{item.repo_name}</div>
          );
        })}
      </div>
    </div>
  );
};

LinkedRepoList.propTypes = {
  readonly: PropTypes.bool,
  editor: PropTypes.object,
  onRepoClick: PropTypes.func,
};

export default LinkedRepoList;
