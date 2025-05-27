import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { eventStopPropagation } from '../../../utils/mouse-event';
import { useParticipantsContext } from '../../hooks/use-participants';

const SearchedCollaborators = ({ collaborators }) => {
  const { participants, deleteParticipant, addParticipants } = useParticipantsContext();
  const { t } = useTranslation('sdoc-editor');

  const onSelectParticipant = useCallback((event, participant, isSelected) => {
    eventStopPropagation(event);
    if (isSelected) {
      deleteParticipant(participant.username);
      return;
    }
    addParticipants(participant.username);
  }, [deleteParticipant, addParticipants]);

  if (!Array.isArray(collaborators) || collaborators.length === 0) {
    return (
      <div className="sdoc-searched-collaborators sdoc-searched-collaborators-empty-tip">{t('No_collaborators_available')}</div>
    );
  }
  return (
    <div className="sdoc-searched-collaborators">
      {collaborators.map((collaborator) => {
        const { name, username, avatar_url } = collaborator;
        const isSelected = participants.find(participant => participant.username === username);
        return (
          <div key={username} className="sdoc-searched-collaborator" onClick={(event) => onSelectParticipant(event, collaborator, isSelected)}>
            <img src={avatar_url} alt="" />
            <div className="sdoc-selected-participant-name">{name}</div>
            <div className="sdoc-searched-collaborator-operation">
              {isSelected && (<i className="sdocfont sdoc-check-mark"></i>)}
            </div>
          </div>
        );
      })}
    </div>
  );

};

SearchedCollaborators.propTypes = {
  collaborators: PropTypes.array,
};

export default SearchedCollaborators;
