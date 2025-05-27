/* eslint-disable react-hooks/rules-of-hooks */
import React, { useCallback, useEffect, useState } from 'react';
import { Node } from '@seafile/slate';
import { INTERNAL_EVENT } from '../../../../constants';
import EventBus from '../../../../utils/event-bus';
import ParticipantPopover from './participant-popover';

import './index.css';

const renderMention = ({ attributes, children, element, editor, readonly }) => {
  return (
    <span {...attributes} contentEditable="false" key={element.id} >
      <button className='sdoc-mention'>{children}</button>
    </span>
  );
};

const renderMentionTemporaryInput = ({ attributes, children, element, readonly }, editor) => {
  const [searchText, setSearchText] = useState('');

  const updateSearchText = useCallback(({ compositionText }) => {
    setSearchText(Node.string(element) + compositionText);
  }, [element]);

  useEffect(() => {
    setSearchText(Node.string(element));
  }, [element]);

  useEffect(() => {
    const eventBus = EventBus.getInstance();
    eventBus.subscribe(INTERNAL_EVENT.UPDATE_MENTION_TEMP_CONTENT, updateSearchText);
  }, [updateSearchText]);

  return (
    <span {...attributes} className='sdoc-mention-temp-ipt'>
      <span>@</span>
      <span>{children}</span>
      <ParticipantPopover searchText={searchText} editor={editor} />
    </span>
  );
};

export { renderMention, renderMentionTemporaryInput };
