import io from 'socket.io-client';
import { clientDebug, serverDebug } from '../utils/debug';
import SocketManager from './socket-manager';

class SocketClient {

  constructor(config) {
    this.config = config;
    this.isReconnect = false;
    this.socket = io(config.sdocServer, {
      reconnection: true,
      auth: { token: config.accessToken },
      query: {
        'sdoc_uuid': config.docUuid,
      }
    });
    this.socket.on('connect', this.onConnected);
    this.socket.on('disconnect', this.onDisconnected);
    this.socket.on('connect_error', this.onConnectError);
    this.socket.on('join-room', this.onJoinRoom);
    this.socket.on('leave-room', this.onLeaveRoom);
    this.socket.on('user-updated', this.onUserUpdated);
    this.socket.on('reload-image', this.onReloadImage);

    this.socket.on('update-document', this.onReceiveRemoteOperations);

    // doc replaced
    this.socket.on('doc-replaced', this.receiveDocumentReplaced);
    this.socket.on('doc-replaced-error', this.receiveDocumentReplacedError);

    // doc published
    this.socket.on('doc-published', this.receivePublishDocument);
    this.socket.on('doc-published-error', this.receivePublishDocumentError);

    // doc removed
    this.socket.on('doc-removed', this.receiveRemoveDocument);
    this.socket.on('doc-removed-error', this.receiveRemoveDocumentError);

    this.socket.on('update-cursor', this.receiveCursorLocation);

    // notification
    this.socket.on('new-notification', this.receiveNewNotification);

    // participant
    this.socket.on('participant-added', this.receiveParticipantAdded);
    this.socket.on('participant-removed', this.receiveParticipantRemoved);

    this.socket.io.on('reconnect', this.onReconnect);
    this.socket.io.on('reconnect_attempt', this.onReconnectAttempt);
    this.socket.io.on('reconnect_error', this.onReconnectError);
  }

  getParams = (params = {}) => {
    const { docUuid, user } = this.config;
    return {
      doc_uuid: docUuid,
      user,
      ...params
    };
  };

  onConnected = () => {
    // join room
    this.socket.emit('join-room', (result) => {
      const socketManager = SocketManager.getInstance();
      if (result.success) {
        // sync operations or document
        if (this.isReconnect) {
          this.isReconnect = false;
          // The reconnect of socketManager needs to be triggered after entering the room again
          socketManager.onReconnect(result);
        }

        socketManager.dispatchConnectState('onConnected', result);
        return;
      }

      // Disconnect the server in the client side. There will be no reconnection.
      this.socket.disconnect();
      socketManager.dispatchConnectState('connect-error', result);
    });
  };

  onReconnect = (data) => {
    clientDebug('reconnect.');
    this.isReconnect = true;
    const socketManager = SocketManager.getInstance();
    socketManager.dispatchConnectState('reconnect');
  };

  onReconnectAttempt = (attemptNumber) => {
    clientDebug('reconnect_attempt. %s', attemptNumber);
    const socketManager = SocketManager.getInstance();
    socketManager.dispatchConnectState('reconnect_attempt', attemptNumber);
  };

  onReconnectError = () => {
    clientDebug('reconnect_error.');
    const socketManager = SocketManager.getInstance();
    socketManager.dispatchConnectState('reconnect_error');
  };

  onDisconnected = (data) => {
    if (data === 'ping timeout') {
      clientDebug('Disconnected due to ping timeout, trying to reconnect...');
      this.socket.connect();
      return;
    }

    clientDebug('disconnect message: %s', data);
    const socketManager = SocketManager.getInstance();
    socketManager.dispatchConnectState('disconnect');
  };

  onConnectError = (e) => {
    clientDebug('connect_error.');
    const socketManager = SocketManager.getInstance();
    socketManager.dispatchConnectState('connect_error');
  };

  sendOperations = (operations, version, selection, callback) => {
    clientDebug('send operations: %O', operations);
    this.socket.emit('update-document', this.getParams({ operations, version, selection }), (result) => {
      callback && callback(result);
    });
  };

  sendUserUpdated = (name) => {
    clientDebug('send user change event: %s', name);
    const { user, docUuid } = this.config;
    this.socket.emit('user-updated', { user: { ...user, name }, doc_uuid: docUuid });
  };

  sendReloadImage = () => {
    const { docUuid } = this.config;
    this.socket.emit('reload-image', { doc_uuid: docUuid });
  };

  onJoinRoom = (userInfo) => {
    serverDebug('%s joined room success.', userInfo.username);
    const socketManager = SocketManager.getInstance();
    socketManager.dispatchConnectState('join-room', userInfo);
  };

  onLeaveRoom = (username) => {
    serverDebug('%s leaved room success.', username);
    const socketManager = SocketManager.getInstance();
    socketManager.dispatchConnectState('leave-room', username);
  };

  onUserUpdated = (userInfo) => {
    serverDebug('%s name updated: %s', userInfo.username, userInfo.name);
    const socketManager = SocketManager.getInstance();
    socketManager.dispatchConnectState('user-updated', userInfo);
  };

  onReloadImage = () => {
    serverDebug('Reload image by other people copy images from different repos');
    const socketManager = SocketManager.getInstance();
    socketManager.dispatchConnectState('reload_image');
  };

  /**
   * receive remote broadcast operations
   * @param {*} params {operations, version}
   */
  onReceiveRemoteOperations = (params) => {
    serverDebug('receive operations: %O', params);
    const socketManager = SocketManager.getInstance();
    socketManager.onReceiveRemoteOperations(params);
  };

  getRecentOperations = () => {
    const { docUuid } = this.config;
    const socketManager = SocketManager.getInstance();
    const clientVersion = socketManager.getDocumentVersion();
    this.socket.emit('sync-document', { doc_uuid: docUuid, version: clientVersion }, (result) => {
      if (result.success) {
        socketManager.onGetRecentOperations(result);
      }
    });
  };

  sendCursorLocation = (location) => {
    const { cursorData: cursor_data } = this.config;
    this.socket.emit('update-cursor', this.getParams({ location, cursor_data }));
  };

  receiveCursorLocation = (params) => {
    const socketManager = SocketManager.getInstance();
    socketManager.receiveCursorLocation(params);
  };

  disconnectWithServer = () => {
    this.socket.disconnect();
  };

  receivePublishDocument = () => {
    const socketManager = SocketManager.getInstance();
    socketManager.receivePublishDocument();
  };

  receivePublishDocumentError = () => {
    const socketManager = SocketManager.getInstance();
    socketManager.receivePublishDocumentError();
  };

  receiveDocumentReplaced = () => {
    const socketManager = SocketManager.getInstance();
    socketManager.receiveDocumentReplaced();
  };

  receiveDocumentReplacedError = () => {
    const socketManager = SocketManager.getInstance();
    socketManager.receiveDocumentReplacedError();
  };

  receiveRemoveDocument = () => {
    const socketManager = SocketManager.getInstance();
    socketManager.receiveRemoveDocument();
  };

  receiveRemoveDocumentError = () => {
    const socketManager = SocketManager.getInstance();
    socketManager.receiveRemoveDocumentError();
  };

  receiveNewNotification = (notification) => {
    const socketManager = SocketManager.getInstance();
    socketManager.receiveNewNotification(notification);
  };

  receiveParticipantAdded = (uses) => {
    const socketManager = SocketManager.getInstance();
    socketManager.receiveParticipantAdded(uses);
  };

  receiveParticipantRemoved = (email) => {
    const socketManager = SocketManager.getInstance();
    socketManager.receiveParticipantRemoved(email);
  };

}

export default SocketClient;
