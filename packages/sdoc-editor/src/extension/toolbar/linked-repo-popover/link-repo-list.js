import React, { useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { INTERNAL_EVENT } from '../../../constants';
import context from '../../../context';
import EventBus from '../../../utils/event-bus';

import './link-repo-list.css';

const LinkedRepoList = ({ onRepoClick }) => {
  const { t } = useTranslation('sdoc-editor');
  const repoRef = useRef(null);
  const repos = context.getSetting('repos');

  const onAddLibraryClick = useCallback(() => {
    const eventBus = EventBus.getInstance();
    eventBus.dispatch(INTERNAL_EVENT.ADD_WIKI_LIBRARY_TOGGLE);
  }, []);

  return (
    <div ref={repoRef} className="sdoc-dropdown-menu-container sdoc-linked-repo-list-wrapper">
      <div className='sdoc-linked-repo-list-tip'>
        {t('Show_files_from_a_linked_library')}
      </div>
      <div className='sdoc-linked-repo-list-content-wrapper'>
        {repos.map(item => {
          return (
            <div key={item.repo_id} className="sdoc-dropdown-menu-item text-truncate d-block" onClick={() => onRepoClick(item)}>{item.repo_name}</div>
          );
        })}
      </div>
      <div className='sdoc-linked-repo-list-add-toolbar' onClick={onAddLibraryClick}>
        {t('Add library')}
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
