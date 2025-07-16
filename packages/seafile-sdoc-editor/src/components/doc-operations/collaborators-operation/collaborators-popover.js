import React from 'react';
import { withTranslation } from 'react-i18next';
import { UncontrolledPopover, PopoverBody, PopoverHeader } from 'reactstrap';
import { context } from '@seafile/sdoc-editor';
import PropTypes from 'prop-types';
import Rename from './rename';

import './collaborators-popover.css';

const propTypes = {
  onEditUserName: PropTypes.func,
  t: PropTypes.func,
};

class CollaboratorsPopover extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      isRenaming: false,
    };
  }

  onEditNameToggle = () => {
    this.setState({ isRenaming: true });
  };

  onRenameConfirm = (newName) => {
    this.props.onEditUserName(newName);
    this.onRenameCancel();
  };

  onRenameCancel = () => {
    this.setState({ isRenaming: false });
  };

  render() {
    const { t, collaborators } = this.props;
    const { isRenaming } = this.state;
    const canEdit = context.getSetting('canEdit');
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
              const canEditName = index === 0 && canEdit;
              const isEditName = index === 0 && isRenaming;
              return (
                <div key={index} className="collaborator-details">
                  <span className="collaborator-tag" />
                  <img className="collaborator-avatar" alt={name} src={item.avatar_url} />
                  {!isEditName && (
                    <span className="collaborator-name">{name}</span>
                  )}
                  {isEditName && (
                    <Rename
                      name={item.name}
                      onRenameConfirm={this.onRenameConfirm}
                      onRenameCancel={this.onRenameCancel}
                    />
                  )}
                  {canEditName && (
                    <i className="sdocfont sdoc-rename" onClick={this.onEditNameToggle}></i>
                  )}
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
