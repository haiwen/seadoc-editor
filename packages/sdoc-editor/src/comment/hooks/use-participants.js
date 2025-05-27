import React, { useContext } from 'react';

export const ParticipantsContext = React.createContext(null);

export const useParticipantsContext = () => {
  const context = useContext(ParticipantsContext);
  if (!context) {
    throw new Error('\'ParticipantsContext\' is null');
  }
  const { participants, addParticipants, deleteParticipant } = context;
  return { participants, addParticipants, deleteParticipant };
};

