import React, { useCallback, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { UncontrolledPopover } from 'reactstrap';
import { useCollaborators } from '../../../hooks/use-collaborators';
import { eventStopPropagation } from '../../../utils/mouse-event';
import { searchCollaborators } from '../../utils';
import SearchedCollaborators from './searched-collaborators';
import SelectedParticipants from './selected-participants';

import './index.css';

const CommentParticipantsEditor = forwardRef(({ target, editor }, ref) => {
  const popoverRef = useRef();
  const { collaborators } = useCollaborators();
  const { t } = useTranslation('sdoc-editor');
  const [searchValue, setSearchValue] = useState('');
  const [searchedCollaborators, setSearchedCollaborators] = useState([]);

  useImperativeHandle(ref, () => ({

    toggle: () => {
      popoverRef.current && popoverRef.current.toggle();
    },

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [popoverRef.current]);

  const onChangeSearch = useCallback((event) => {
    const newSearchValue = event.target.value;
    if (searchValue === newSearchValue) return;
    const searchedCollaborators = searchCollaborators(collaborators, newSearchValue, editor);
    setSearchValue(newSearchValue);
    setSearchedCollaborators(searchedCollaborators);
  }, [searchValue, collaborators, editor]);

  return (
    <UncontrolledPopover
      target={target}
      className="sdoc-comments-participants-popover"
      placement="bottom-start"
      hideArrow={true}
      trigger="legacy"
      fade={false}
      ref={popoverRef}
    >
      <div className="sdoc-comments-participants-editor-container" onClick={(event) => eventStopPropagation(event)}>
        <SelectedParticipants />
        <div className="sdoc-search-collaborators">
          <input className="form-control" type="text" placeholder={t('Search_collaborator')} value={searchValue} onChange={onChangeSearch}/>
        </div>
        <SearchedCollaborators collaborators={searchValue ? searchedCollaborators : collaborators} />
      </div>
    </UncontrolledPopover>
  );
});

export default CommentParticipantsEditor;
