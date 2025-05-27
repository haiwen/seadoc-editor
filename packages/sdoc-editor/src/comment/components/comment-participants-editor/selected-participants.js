import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParticipantsContext } from '../../hooks/use-participants';

const SelectedParticipants = () => {
  const { participants, deleteParticipant } = useParticipantsContext();
  const { t } = useTranslation('sdoc-editor');

  const onDeleteParticipant = useCallback((participant) => {
    deleteParticipant(participant.username);
  }, [deleteParticipant]);

  if (!Array.isArray(participants) || participants.length === 0) return null;
  return (
    <div className="sdoc-selected-participants">
      {participants.map((participant) => {
        const { name, username, avatar_url } = participant;
        return (
          <div key={username} className="sdoc-selected-participant">
            <img src={avatar_url} alt="" />
            <div className="sdoc-selected-participant-name">{name}</div>
            <div className="sdoc-selected-participant-delete" onClick={() => onDeleteParticipant(participant)} title={t('Delete')}>
              <i className="sdocfont sdoc-sm-close"></i>
            </div>
          </div>
        );
      })}
    </div>
  );

};

export default SelectedParticipants;
