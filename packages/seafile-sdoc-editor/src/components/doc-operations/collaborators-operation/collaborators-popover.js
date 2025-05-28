import React from 'react';
import { withTranslation } from 'react-i18next';
import { UncontrolledPopover, PopoverBody, PopoverHeader } from 'reactstrap';
import PropTypes from 'prop-types';

import './collaborators-popover.css';

const propTypes = {
  t: PropTypes.func,
};

class CollaboratorsPopover extends React.PureComponent {

  render() {
    const { t, collaborators } = this.props;
    return (
      <UncontrolledPopover
        target="collaborators"
        placement="bottom-end"
        popperClassName='collaborators-popover'
        trigger="legacy"
        hideArrow={true}
        fade={false}
        security='fixed'
      >
        <PopoverHeader className='popover-header'>{t('Online_members')}{' '}({collaborators.length})</PopoverHeader>
        <PopoverBody className="popover-container">
          <div className="content-list">
            {collaborators.map((item, index) => {
              const name = index === 0 ? `${item.name} (${t('Me')})` : item.name;
              return (
                <div key={index} className="collaborator-details">
                  <span className="collaborator-tag" />
                  <img className="collaborator-avatar" alt={name} src={item.avatar_url} />
                  <span className="collaborator-name">{name}</span>
                </div>
              );
            })}
          </div>
        </PopoverBody>
      </UncontrolledPopover>
    );
  }
}

CollaboratorsPopover.propTypes = propTypes;

export default withTranslation('sdoc-editor')(CollaboratorsPopover);
