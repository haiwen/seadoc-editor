import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import Tooltip from '../../../components/tooltip';

const ParticipantAvatar = ({ participant, index, showMore }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    setShowTooltip(true);
  }, []);

  const { name, avatar_url } = participant;
  const id = `comment-participant-avatar-${index}-${Math.floor(Math.random() * 1000)}`;
  return (
    <div className={classnames('comment-participant-avatar', { 'position-relative': showMore })} id={id}>
      <img src={avatar_url} alt='' />
      {showTooltip && (<Tooltip target={id}>{name}</Tooltip>)}
      {showMore && (<div className="comment-participants-more"><i className="sdocfont sdoc-more"></i></div>)}
    </div>
  );
};

ParticipantAvatar.propTypes = {
  showMore: PropTypes.bool,
  participant: PropTypes.object.isRequired,
  index: PropTypes.number,
};

export default ParticipantAvatar;
