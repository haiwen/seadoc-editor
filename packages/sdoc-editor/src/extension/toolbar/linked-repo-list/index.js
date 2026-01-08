import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from 'reactstrap';
import PropTypes from 'prop-types';
import { getAccessibleRepos } from '../../plugins/file-view/helpers';

import './index.css';

const LinkedRepoList = ({ onRepoClick }) => {
  const { t } = useTranslation('sdoc-editor');
  const repoRef = useRef(null);
  const isComposingRef = useRef(null);

  const tablesRef = useRef(getAccessibleRepos());
  const [tables, setTables] = useState(tablesRef.current || []);


  const onChange = useCallback((event) => {
    event.nativeEvent.stopImmediatePropagation();
    event.stopPropagation();
    if (isComposingRef.current) return;
    const value = event.target.value.trim().toUpperCase();
    if (value) {
      const list = tablesRef.current.filter(item => item.repo_name.toUpperCase().includes(value));
      setTables(list);
    } else {
      setTables(tablesRef.current);
    }
  }, []);

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
