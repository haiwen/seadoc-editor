import React from 'react';
import { withTranslation } from 'react-i18next';
import { EventBus, SocketManager, Tooltip, context } from '@seafile/sdoc-editor';
import CollaboratorsPopover from './collaborators-popover';

class CollaboratorsOperation extends React.PureComponent {

  constructor(props) {
    super(props);
    const userInfo = context.getUserInfo();
    this.state = {
      collaborators: [userInfo]
    };
    this.currentUser = userInfo;
  }

  componentDidMount() {
    context.getCollaborators().then(res => {
      const { collaborators } = res.data;

      // delete current user and push it at first one
      const currentUserIndex = collaborators.findIndex(user => user.username === this.currentUser.username);
      if (currentUserIndex > -1) {
        collaborators.splice(currentUserIndex, 1);
      }
      collaborators.unshift(this.currentUser);
      this.setState({ collaborators });
    });
    const eventBus = EventBus.getInstance();
    this.unsubscribeJoinEvent = eventBus.subscribe('join-room', this.onUserJoinRoom);
    this.unsubscribeLeaveEvent = eventBus.subscribe('leave-room', this.onUserLeaveRoom);
    this.unsubscribeUpdatedEvent = eventBus.subscribe('user-updated', this.onUserUpdated);
  }

  componentWillUnmount() {
    this.unsubscribeJoinEvent();
    this.unsubscribeLeaveEvent();
    this.unsubscribeUpdatedEvent();
  }

  onUserJoinRoom = (userInfo) => {
    const { collaborators } = this.state;
    let newCollaborators = collaborators.slice();
    if (!newCollaborators.find(user => user.username === userInfo.username)) {
      newCollaborators.push(userInfo);
      this.setState({ collaborators: newCollaborators });
    }
  };

  onUserLeaveRoom = (username) => {
    if (this.currentUser.username === username) return;
    const { collaborators } = this.state;
    let newCollaborators = collaborators.slice();
    if (newCollaborators.find(user => user.username === username)) {
      newCollaborators = newCollaborators.filter(user => user.username !== username);
      this.setState({ collaborators: newCollaborators });
    }
  };

  onUserUpdated = (userInfo) => {
    const { collaborators } = this.state;
    const newCollaborators = collaborators.map(item => {
      if (item.username === userInfo.username) {
        item.name = userInfo.name;
      }
      return item;
    });
    this.setState({ collaborators: newCollaborators });
  };

  onRename = (newName) => {
    const { collaborators } = this.state;
    const currentUser = this.currentUser;
    const socketManager = SocketManager.getInstance();
    socketManager.sendUserUpdated(newName);
    const newCollaborators = collaborators.map(item => {
      if (item.username === currentUser.username) {
        item.name = newName;
        this.currentUser.name = newName;
      }
      return item;
    });
    this.setState({ collaborators: newCollaborators });
  };

  render() {
    const { collaborators } = this.state;
    const { t } = this.props;

    return (
      <>
        <span className='op-item collaborators-op-item' id="collaborators">
          <i className='sdocfont sdoc-user mr-1'></i>
          {collaborators.length}
        </span>
        <Tooltip target='collaborators'>
          {t('Online_members')}
        </Tooltip>
        <CollaboratorsPopover collaborators={collaborators} onEditUserName={this.onRename}/>
      </>
    );
  }
}

export default withTranslation('sdoc-editor')(CollaboratorsOperation);
