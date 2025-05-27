import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import toaster from '../../components/toast';
import { INTERNAL_EVENT } from '../../constants';
import context from '../../context';
import { User } from '../../model';
import { getErrorMsg } from '../../utils/common-utils';
import EventBus from '../../utils/event-bus';
import { ParticipantsContext } from '../hooks/use-participants';

const ParticipantsProvider = ({ children }) => {
  const isSdocRevision = context.getSetting('isSdocRevision');
  const isPublished = context.getSetting('isPublished');
  const [participants, setParticipants] = useState([]);
  const { t } = useTranslation('sdoc-editor');

  const updateLocalParticipants = useCallback((added = []) => {
    if (!Array.isArray(added) || added.length === 0) return;
    let newParticipants = participants.slice(0);
    added.forEach(participant => {
      const newParticipant = new User(participant);
      if (!newParticipants.find(item => item.username === newParticipant.username)) {
        newParticipants.push(newParticipant);
      }
    });
    setParticipants(newParticipants);
  }, [participants]);

  const addParticipants = useCallback((otherEmail) => {
    if (participants.find(participant => participant.username === otherEmail)) return;
    context.addParticipants([otherEmail]).then(res => {
      const { success } = res.data;
      updateLocalParticipants(success);
    }).catch(error => {
      const errorMessage = getErrorMsg(error);
      toaster.danger(t(errorMessage));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateLocalParticipants, participants]);

  const deleteLocalParticipant = useCallback((email) => {
    if (!participants.find((participant) => participant.username === email))
      return;
    let newParticipants = participants.slice(0);
    newParticipants = newParticipants.filter(
      (participant) => participant.username !== email,
    );
    setParticipants(newParticipants);
  }, [participants]);

  const deleteParticipant = useCallback((email) => {
    if (!participants.find(participant => participant.username === email)) return;
    context.deleteParticipants(email).then(res => {
      let newParticipants = participants.slice(0);
      newParticipants = newParticipants.filter(participant => participant.username !== email);
      setParticipants(newParticipants);
    }).catch(error => {
      const errorMessage = getErrorMsg(error);
      toaster.danger(t(errorMessage));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participants]);

  useEffect(() => {
    if (isSdocRevision && isPublished) return;
    context.listParticipants().then(res => {
      const participants = res.data.participant_list;
      updateLocalParticipants(participants);
    }).catch(error => {

    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const eventBus = EventBus.getInstance();
    const unsubscribeParticipantAdded = eventBus.subscribe(INTERNAL_EVENT.PARTICIPANT_ADDED, updateLocalParticipants);
    const unsubscribeParticipantRemoved = eventBus.subscribe(INTERNAL_EVENT.PARTICIPANT_REMOVED, deleteLocalParticipant);
    return () => {
      unsubscribeParticipantAdded();
      unsubscribeParticipantRemoved();
    };
  }, [updateLocalParticipants, deleteLocalParticipant]);

  return (
    <ParticipantsContext.Provider value={{ participants, addParticipants, deleteParticipant }}>
      {children}
    </ParticipantsContext.Provider>
  );

};

export default ParticipantsProvider;
