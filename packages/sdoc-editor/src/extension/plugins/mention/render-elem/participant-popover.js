import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Editor, Transforms } from '@seafile/slate';
import PropTypes from 'prop-types';
import { DOWN, FONT_SIZE_WIDTH, LINE_HEIGHT, POPOVER_ADDING_HEIGHT, UP } from '../../../../comment/constants';
import { useParticipantsContext } from '../../../../comment/hooks/use-participants';
import { searchCollaborators } from '../../../../comment/utils';
import { INTERNAL_EVENT, KeyCodes } from '../../../../constants';
import { useCollaborators } from '../../../../hooks/use-collaborators';
import EventBus from '../../../../utils/event-bus';
import { eventStopPropagation } from '../../../../utils/mouse-event';
import { ElementPopover } from '../../../commons';
import { focusEditor } from '../../../core';
import { getMentionTempIptEntry, insertMention, sortCollaborators, transformToText, getSelectionCoords } from '../helper';
import CommentParticipantItem from './comment-participant-item';

import './index.css';

const ParticipantPopover = ({ editor, searchText }) => {
  const collaboratorsPopoverRef = useRef(null);
  const { collaborators } = useCollaborators();
  const { addParticipants, participants } = useParticipantsContext();
  const [searchedCollaborators, setSearchedCollaborators] = useState([]);
  const [activeCollaboratorIndex, setActiveCollaboratorIndex] = useState(-1);
  const [validCollaborators, setValidCollaborators] = useState([]);

  useEffect(() => {
    const sortedCollaborators = sortCollaborators(collaborators, participants);
    setValidCollaborators(sortedCollaborators);
  }, [collaborators, participants]);

  useEffect(() => {
    return () => {
      transformToText(editor);
    };
  }, [editor]);

  const hideCommentPopover = useCallback(() => {
    if (searchedCollaborators.length === 0) return;
    setSearchedCollaborators([]);
    setActiveCollaboratorIndex(-1);
  }, [searchedCollaborators]);

  const handleForceClickPopover = useCallback((event) => {
    if (!collaboratorsPopoverRef.current?.contains(event.target)) {
      transformToText(editor);
    }
  }, [editor]);

  // onMount: handleCommentPopover
  useEffect(() => {
    document.addEventListener('mousedown', handleForceClickPopover);
    return () => {
      document.removeEventListener('mousedown', handleForceClickPopover);
    };
  }, [handleForceClickPopover]);

  const setScrollTop = useCallback((offsetTop, itemOffsetHeight, mouseDownType) => {
    const { offsetHeight, scrollTop } = collaboratorsPopoverRef.current;
    if (mouseDownType === DOWN) {
      if (offsetTop + itemOffsetHeight - scrollTop - offsetHeight + POPOVER_ADDING_HEIGHT > 0) {
        let top = offsetTop + itemOffsetHeight - offsetHeight + POPOVER_ADDING_HEIGHT;
        collaboratorsPopoverRef.current.scrollTop = top;
      }
    }

    if (mouseDownType === UP) {
      if (offsetTop < scrollTop) {
        collaboratorsPopoverRef.current.scrollTop = offsetTop - POPOVER_ADDING_HEIGHT;
      }
    }
  }, []);

  const setCollaboratorsPopoverPosition = useCallback((caretPosition) => {
    if (!collaboratorsPopoverRef.current) return;
    const { height, width } = collaboratorsPopoverRef.current.getBoundingClientRect();
    const { offsetHeight } = collaboratorsPopoverRef.current;

    // Whether the vertical direction exceeds the screen
    const isVerticalDirectionBeyondScreen = height + caretPosition.y + LINE_HEIGHT > window.innerHeight;

    // if the vertical direction exceeds the screen, collaboratorsPopoverRef appear above the cursor
    const top = isVerticalDirectionBeyondScreen ? `${caretPosition.y - offsetHeight + LINE_HEIGHT}px` : `${caretPosition.y + LINE_HEIGHT}px`;
    collaboratorsPopoverRef.current.style.top = top;

    // Whether the horizontal direction exceeds the screen
    const isHorizontalDirectionBeyondScreen = caretPosition.x + FONT_SIZE_WIDTH + width > window.innerWidth;

    // if the horizontal direction exceeds the screen, collaboratorsPopoverRef is displayed against the right side of the screen
    const left = isHorizontalDirectionBeyondScreen ? `${window.innerWidth - width}px` : `${caretPosition.x + FONT_SIZE_WIDTH}px`;
    collaboratorsPopoverRef.current.style.left = left;

  }, [collaboratorsPopoverRef]);

  const getSearchedCollaborators = useCallback((searchingText) => {
    if (!searchingText.length) return validCollaborators;
    if (searchingText) return searchCollaborators(validCollaborators, searchingText, editor);
    return [];
  }, [editor, validCollaborators]);

  const handleInvolvedKeyUp = useCallback(() => {
    const searchedCollaborators = getSearchedCollaborators(searchText);
    if (searchedCollaborators.length === 0) {
      hideCommentPopover();
      return;
    }
    setActiveCollaboratorIndex(0);
    setSearchedCollaborators(searchedCollaborators);
    setTimeout(() => {
      const caretPosition = getSelectionCoords();
      setCollaboratorsPopoverPosition(caretPosition);
    }, 1);
  }, [getSearchedCollaborators, searchText, hideCommentPopover, setCollaboratorsPopoverPosition]);

  const handleSelectingCollaborator = useCallback((event, direction) => {
    eventStopPropagation(event);
    const collaboratorsLen = searchedCollaborators.length;
    if (collaboratorsLen === 0) return;
    let nextActiveCollaboratorIndex = activeCollaboratorIndex;
    if (direction === DOWN) {
      nextActiveCollaboratorIndex++;
      if (nextActiveCollaboratorIndex >= collaboratorsLen) {
        nextActiveCollaboratorIndex = 0;
      }
    } else {
      nextActiveCollaboratorIndex--;
      if (nextActiveCollaboratorIndex < 0) {
        nextActiveCollaboratorIndex = collaboratorsLen - 1;
      }
    }

    setActiveCollaboratorIndex(nextActiveCollaboratorIndex);
  }, [searchedCollaborators, activeCollaboratorIndex]);

  const onSelectCollaborator = useCallback((collaborator) => {
    const [, path] = getMentionTempIptEntry(editor);
    insertMention(editor, collaborator);
    addParticipants(collaborator.username);
    Transforms.removeNodes(editor, { at: path });
    const focusPath = Editor.next(editor, { at: path })[1];
    focusEditor(editor, Editor.start(editor, focusPath));
    hideCommentPopover();
  }, [editor, hideCommentPopover, addParticipants]);

  const handleSelectCollaborator = useCallback((event) => {
    if (searchedCollaborators.length === 0) return;
    onSelectCollaborator(searchedCollaborators[activeCollaboratorIndex]);
  }, [searchedCollaborators, activeCollaboratorIndex, onSelectCollaborator]);

  const handleMentionChosen = useCallback(({ event }) => {
    if (event.keyCode === KeyCodes.DownArrow) {
      handleSelectingCollaborator(event, DOWN);
      return;
    }
    if (event.keyCode === KeyCodes.UpArrow) {
      handleSelectingCollaborator(event, UP);
      return;
    }
    if (event.keyCode === KeyCodes.Enter) {
      if (searchedCollaborators.length > 0) {
        handleSelectCollaborator();
        event.preventDefault();
        event.stopPropagation();
      } else {
        transformToText(editor);
      }
      return;
    }
    if (event.keyCode === KeyCodes.Esc) {
      transformToText(editor);
      return;
    }
    handleInvolvedKeyUp(event);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, handleInvolvedKeyUp, handleSelectCollaborator, handleSelectingCollaborator]);

  // Add the Enter keydown event listener during the capture phase
  useEffect(() => {
    const handleKeydownCapture = (event) => {
      if (event.keyCode === KeyCodes.Enter) {
        handleMentionChosen({ event });
      }
    };
    document.addEventListener('keydown', handleKeydownCapture, true);
    return () => {
      document.removeEventListener('keydown', handleKeydownCapture, true);
    };
  }, [handleMentionChosen]);

  const handleSearchTextChange = useCallback(() => {

    const newCollaborators = getSearchedCollaborators(searchText);
    if (newCollaborators.length === 0) {
      hideCommentPopover();
      return;
    }

    setSearchedCollaborators(newCollaborators);
    setTimeout(() => {
      const caretPosition = getSelectionCoords();
      setCollaboratorsPopoverPosition(caretPosition);
    }, 1);
  }, [getSearchedCollaborators, hideCommentPopover, searchText, setCollaboratorsPopoverPosition]);

  useEffect(() => {
    handleSearchTextChange();
    setActiveCollaboratorIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, validCollaborators]);

  useEffect(() => {
    const eventBus = EventBus.getInstance();
    const unsubscribe = eventBus.subscribe(INTERNAL_EVENT.HANDLE_MENTION_TEMP_CHOSEN, handleMentionChosen);
    return () => {
      unsubscribe();
    };
  }, [handleMentionChosen, searchText, validCollaborators]);


  if (searchedCollaborators.length === 0) return null;

  return (
    <ElementPopover >
      <div className="sdoc-comment-caret-list" ref={collaboratorsPopoverRef} >
        {searchedCollaborators.map((participant, index) => (
          <CommentParticipantItem
            key={participant.username}
            participantIndex={index}
            activeParticipantIndex={activeCollaboratorIndex}
            participant={participant}
            setScrollTop={setScrollTop}
            onSelectParticipant={onSelectCollaborator}
          />
        )
        )}
      </div>
    </ElementPopover>
  );
};

ParticipantPopover.propTypes = {
  searchText: PropTypes.string,
  editor: PropTypes.object,
};

export default ParticipantPopover;
