import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { eventStopPropagation } from '../../../../utils/mouse-event';

const CommentParticipantItem = ({ participant, setScrollTop, onSelectParticipant, participantIndex, activeParticipantIndex }) => {
  const ref = useRef(null);
  const oldValueRef = useRef({});

  useEffect(() => {
    oldValueRef.current.participantIndex = participantIndex;
    oldValueRef.current.activeParticipantIndex = activeParticipantIndex;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeParticipantIndex === participantIndex && activeParticipantIndex !== oldValueRef.current.activeParticipantIndex) {
      const offsetHeight = ref.current.offsetHeight;
      const offsetTop = ref.current.offsetTop;
      if (activeParticipantIndex > oldValueRef.current.activeParticipantIndex) {
        setScrollTop(offsetTop, offsetHeight, 'down');
      } else {
        setScrollTop(offsetTop, offsetHeight, 'up');
      }
    }

    oldValueRef.current.activeParticipantIndex = activeParticipantIndex;
  }, [setScrollTop, participantIndex, activeParticipantIndex, ref, oldValueRef]);

  const selectParticipant = useCallback((event) => {
    eventStopPropagation(event);
    onSelectParticipant(participant);
  }, [participant, onSelectParticipant]);

  const active = participantIndex === activeParticipantIndex;

  return (
    <div className={`comment-participant-item ${active ? 'active' : ''}`} ref={ref} onClick={selectParticipant}>
      <div className="comment-participant-container">
        <img className="comment-participant-avatar" alt={participant.name} src={participant.avatar_url} />
        <div className="comment-participant-name">{participant.name}</div>
      </div>
    </div>
  );

};

CommentParticipantItem.propTypes = {
  activeParticipantIndex: PropTypes.number.isRequired,
  participantIndex: PropTypes.number.isRequired,
  participant: PropTypes.object.isRequired,
  setScrollTop: PropTypes.func.isRequired,
  onSelectParticipant: PropTypes.func.isRequired,
};

export default CommentParticipantItem;
