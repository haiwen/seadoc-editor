import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSlateStatic } from '@seafile/slate-react';
import Tooltip from '../../../components/tooltip';
import { useParticipantsContext } from '../../hooks/use-participants';
import CommentParticipantsEditor from '../comment-participants-editor';
import ParticipantAvatar from './participant-avatar';

import './index.css';

const CommentAllParticipants = () => {
  const popoverRef = useRef();
  const { participants } = useParticipantsContext();
  const editor = useSlateStatic();
  const { t } = useTranslation('sdoc-editor');
  const addParticipantId = 'sdoc-add-participants';
  const commentsParticipantsId = 'sdoc-comments-participants';
  const [isDidMount, setDidMount] = useState(false);

  useEffect(() => {
    setDidMount(true);
  }, []);

  const toggle = useCallback(() => {
    popoverRef.current && popoverRef.current.toggle();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popoverRef.current]);

  const participantsCount = participants.length;

  return (
    <>
      <div className="comments-participants-container">
        <div className="comments-participants-editor-target" id={commentsParticipantsId}></div>
        {participants.slice(0, 14).map((participant, index) => {
          const { username } = participant;
          return (
            <ParticipantAvatar key={username} participant={participant} index={index} showMore={participantsCount > 13 && index === 13} />
          );
        })}
        <div className="add-comments-participants" id={addParticipantId} onClick={toggle}>
          <i className="sdocfont sdoc-add"></i>
        </div>
        {isDidMount && (<Tooltip target={addParticipantId}>{t('Add_participants')}</Tooltip>)}
      </div>
      {isDidMount && (
        <CommentParticipantsEditor target={commentsParticipantsId} ref={popoverRef} editor={editor} />
      )}
    </>
  );
};

export default CommentAllParticipants;
