import { INTERNAL_EVENT } from '../constants';
import { deleteCursor } from '../cursor/helper';
import { clientDebug, conflictDebug, serverDebug, stateDebug } from '../utils/debug';
import EventBus from '../utils/event-bus';
import { syncRemoteOperations, reExecRevertOperationList, revertOperationList, syncRemoteCursorLocation } from './helpers';
import SocketClient from './socket-client';

//  idle --> sending --> conflict --> idle
//       --> conflict --> idle
//       --> disconnect --> conflict --> idle
//                      --> idle
const STATE = {
  IDLE: 'idle',
  SENDING: 'sending',
  CONFLICT: 'conflict',
  DISCONNECT: 'disconnect',
  NEED_RELOAD: 'need_reload',
};

class SocketManager {

  constructor(editor, document, config) {
    this.editor = editor;
    this.document = document;
    this.socketClient = new SocketClient(config);
    this.pendingOperationList = []; // Two-dimensional arrays： [operations, operations, ...]
    this.pendingOperationBeginTimeList = [];
    this.remoteOperationsList = []; // Same with pending operations
    this.revertOperationList = [];
    this.eventBus = EventBus.getInstance();
    this.state = STATE.IDLE;
  }

  static getInstance = (editor, document, socketConfig) => {
    if (this.instance) {
      return this.instance;
    }

    if (!document || !socketConfig) {
      throw new Error('SocketManager init params is invalid. Place check your code to fix it.');
    }

    this.instance = new SocketManager(editor, document, socketConfig);
    return this.instance;
  };

  getDocumentVersion = () => {
    const { version } = this.document;
    return version;
  };

  updateDocumentVersion = (document) => {
    this.document['version'] = document.version;
  };

  receivePublishDocument = () => {
    this.eventBus.dispatch(INTERNAL_EVENT.PUBLISH_DOCUMENT);
  };

  receivePublishDocumentError = () => {
    this.eventBus.dispatch(INTERNAL_EVENT.PUBLISH_DOCUMENT_ERROR);
  };

  receiveRemoveDocument = () => {
    this.eventBus.dispatch(INTERNAL_EVENT.REMOVE_DOCUMENT);
  };

  receiveRemoveDocumentError = () => {
    this.eventBus.dispatch(INTERNAL_EVENT.REMOVE_DOCUMENT_ERROR);
  };

  receiveDocumentReplaced = () => {
    this.eventBus.dispatch(INTERNAL_EVENT.DOCUMENT_REPLACED);
  };

  receiveDocumentReplacedError = () => {
    this.eventBus.dispatch(INTERNAL_EVENT.DOCUMENT_REPLACED_ERROR);
  };

  receiveNewNotification = (notification) => {
    this.eventBus.dispatch(INTERNAL_EVENT.NEW_NOTIFICATION, notification);
  };

  onReceiveLocalOperations = (operations) => {
    if (this.editor.readonly) return;

    this.pendingOperationList.push(operations);

    const lastOpBeginTime = new Date().getTime();
    this.pendingOperationBeginTimeList.push(lastOpBeginTime);
    const firstOpBeginTime = this.pendingOperationBeginTimeList[0];

    const isExceedExecuteTime = (lastOpBeginTime - firstOpBeginTime) / 1000 > 30 ? true : false;
    if (isExceedExecuteTime || this.pendingOperationList.length > 50) {
      this.dispatchConnectState('pending_operations_exceed_limit');
    }

    this.sendOperations();
  };

  sendOperations = () => {
    if (this.editor.readonly) return;
    if (this.state !== STATE.IDLE) return;
    stateDebug(`State changed: ${this.state} -> ${STATE.SENDING}`);
    this.state = STATE.SENDING;
    this.sendNextOperations();
  };

  sendNextOperations = () => {
    if (this.state !== STATE.SENDING) return;
    if (this.pendingOperationList.length === 0) {
      stateDebug(`State Changed: ${this.state} -> ${STATE.IDLE}`);
      this.state = STATE.IDLE;
      return;
    }

    this.dispatchConnectState('is-saving');
    const version = this.document.version;
    const operations = this.pendingOperationList.shift();
    const selection = this.editor.selection;
    this._sendingOperations = operations;
    this.socketClient.sendOperations(operations, version, selection, this.sendOperationsCallback);
  };

  sendOperationsCallback = (result) => {
    if (result && result.success) {
      const { version: serverVersion } = result;
      this.document['version'] = serverVersion;
      const lastSavedAt = new Date().getTime();
      this.dispatchConnectState('saved', lastSavedAt);

      // send next operations
      this.pendingOperationBeginTimeList.shift(); // remove current operation's begin time
      this._sendingOperations = null;
      this.sendNextOperations();
      return;
    }

    // Operations are execute failure
    const { error_type } = result;
    if (
      error_type === 'load_document_content_error' ||
      error_type === 'save_operations_to_database_error' ||
      error_type === 'token_expired'
    ) {
      // load_document_content_error: After a short-term reconnection, the content of the document fails to load
      // save_operation_to_database_error: Save operation to database error
      this.dispatchConnectState(error_type);

      // reset sending control
      stateDebug(`State Changed: ${this.state} -> ${STATE.NEED_RELOAD}`);
      this.state = STATE.NEED_RELOAD;
      this._sendingOperations = null;
    } else if (error_type === 'version_behind_server') {
      // Put the failed operation into the pending list and re-execute it
      this.pendingOperationList.unshift([...this._sendingOperations]);

      stateDebug(`State Changed: ${this.state} -> ${STATE.CONFLICT}`);
      this.state = STATE.CONFLICT;
      const { lose_operations } = result;
      this.resolveConflicting(lose_operations);

    } else if (error_type === 'execute_client_operations_error') {
      this.editor.isRemote = true;
      const dupSendingOperations = [...this._sendingOperations];
      revertOperationList(this.editor, [dupSendingOperations]);

      // Update the save time after revert
      const lastSavedAt = new Date().getTime();
      this.dispatchConnectState('saved', lastSavedAt);

      // Set isRemote to false must be in Promise.resolve function, make sure the modification of isRemote is later than the onChange event
      Promise.resolve().then(_ => {
        this.editor.isRemote = false;
        this.dispatchConnectState(error_type);

        // send next operations
        this._sendingOperations = null;
        this.sendNextOperations();
      });
    }
  };

  onReceiveRemoteOperations = (params) => {
    // if this.disconnect is true, Then the message sent by the remote end cannot be received
    if (this.state !== STATE.IDLE) return;

    if (this.editor.readonly) return;

    const { version: serverVersion } = params;
    const { version: clientVersion } = this.document;
    if (serverVersion === clientVersion + 1) {
      // update execute remote operations flag
      this.editor.isRemote = true;

      const { operations } = params;
      // Update content & version
      serverDebug('execute remote operations: %O', operations);
      try {
        syncRemoteOperations(this.editor, operations);
      } catch (error) {
        stateDebug(`State Changed: ${this.state} -> ${STATE.CONFLICT}`);
        this.state = STATE.CONFLICT;
        this.dispatchConnectState('sync_server_operations_error');
        return;
      }

      // Update document
      this.document.version = serverVersion;
      this.document.children = this.editor.children;

      Promise.resolve().then(() => {
        this.editor.isRemote = false;
        this.revertOperationList = [];
      });
    } else {
      // isConflict
      this.onConflictHappen();
    }
  };

  onReconnect = (result) => {
    const { version: serverVersion } = result;
    const clientVersion = this.getDocumentVersion();
    // The client version is inconsistent with the server version, and the latest operations performed by the server need to be loaded
    if (serverVersion !== clientVersion) {
      this.onConflictHappen();
      return;
    }

    // The version consistency indicates that there is no conflict and no processing is required
    stateDebug(`State Changed: ${this.state} -> ${STATE.IDLE}`);
    this.state = STATE.IDLE;
    if (this.pendingOperationList.length > 0) {
      clientDebug('After reconnection, manually trigger the execution of ops.');
      stateDebug(`State Changed: ${this.state} -> ${STATE.SENDING}`);
      this.state = STATE.SENDING;
      this.sendNextOperations();
    }
  };

  onConflictHappen = () => {
    stateDebug(`State Changed: ${this.state} -> ${STATE.CONFLICT}`);
    this.state = STATE.CONFLICT;
    this.socketClient.getRecentOperations();
  };

  onGetRecentOperations = (result) => {
    if (this.editor.readonly) return;
    const { mode, content } = result;
    conflictDebug('Start conflict resolution');
    // sync document
    if (mode === 'document') {
      const { version, children } = content;
      // 1. update document
      conflictDebug('Update local document to remote document');
      this.document.children = children;
      this.document.version = version;
      this.editor.children = children;
      this.editor.isRemote = true;
      this.editor.onChange();

      stateDebug(`State Changed: ${this.state} -> ${STATE.IDLE}`);
      this.editor.isRemote = false;
      this.state = STATE.IDLE;
      this._sendingOperations = null;

      // 2. exec client operationList
      const pendingOperationList = this.pendingOperationList.slice();
      this.pendingOperationList = [];

      // need resend this operations to server
      conflictDebug('Re-execute local unsynchronized operations: %o', pendingOperationList);
      reExecRevertOperationList(this.editor, pendingOperationList);
      return;
    }

    // mode os operations: sync operations
    // content is [{version, operations}, {version, operations}, ...]
    const loseOperations = content;
    this.resolveConflicting(loseOperations);
  };

  resolveConflicting = (loseOperations) => {
    if (this.editor.readonly) return;
    conflictDebug('resolve conflicts');
    this.editor.isRemote = true;
    if (this.pendingOperationList.length !== 0) {
      // 1. Revert operations
      // 1.1 record reverted operationList & clear pendingOperationList
      this.revertOperationList = this.pendingOperationList.slice();
      this.pendingOperationList = [];

      // 1.2 Revert operationList
      conflictDebug('revert locale operations: %O', this.revertOperationList);
      revertOperationList(this.editor, this.revertOperationList);
    }

    loseOperations = loseOperations.sort((prev, next) => prev.version - next.version);
    conflictDebug('lose operations length: %s', loseOperations.length);
    while (loseOperations.length > 0) {
      const operationParams = loseOperations.shift();
      // 2. execute operations
      const { operations, version: serverVersion } = operationParams;
      // 2.1 Update content & version
      conflictDebug('execute lose operations: %O', operations);
      try {
        syncRemoteOperations(this.editor, operations);
      } catch (error) {
        stateDebug(`State Changed: ${this.state} -> ${STATE.CONFLICT}`);
        this.state = STATE.CONFLICT;
        this.dispatchConnectState('sync_server_operations_error');
        return;
      }

      // 2.2 Update document
      this.document.version = serverVersion;
      this.document.children = this.editor.children;
    }

    if (this.revertOperationList.length === 0) {
      Promise.resolve().then(() => {
        this.editor.isRemote = false;
        stateDebug(`State Changed: ${this.state} -> ${STATE.IDLE}`);
        this.state = STATE.IDLE;
        this._sendingOperations = null;

        this.revertOperationList = [];
      });
      return;
    }

    // Set isRemote to false must be in Promise.resolve function, make sure the modification of isRemote is later than the onChange event
    Promise.resolve().then(() => {
      // reset execute remote operations flag
      this.editor.isRemote = false;

      stateDebug(`State Changed: ${this.state} -> ${STATE.IDLE}`);
      this.state = STATE.IDLE;
      this._sendingOperations = null;

      // 3. Execute pending operations
      // 3.1 Re-execute operations
      conflictDebug('Editor isRemote is false: %s', this.editor.isRemote);
      conflictDebug('Re-execute pending operations, %O', this.revertOperationList);
      reExecRevertOperationList(this.editor, this.revertOperationList);

      // 3.2 Clear revert operationList
      this.revertOperationList = [];
      conflictDebug('Complete conflict resolution');
    });
  };

  sendCursorLocation = (location) => {
    this.socketClient.sendCursorLocation(location);
  };

  receiveCursorLocation = (params) => {
    if (this.editor.readonly) return;
    const { user, location, cursor_data: cursorData } = params;
    syncRemoteCursorLocation(this.editor, user, location, cursorData);
    return;
  };

  dispatchConnectState = (type, message) => {
    if (type === 'leave-room') {
      deleteCursor(this.editor, message);
      this.editor.onCursor && this.editor.onCursor(this.editor.cursors);
    }

    if (type === 'disconnect') {
      // current state is sending
      if (this._sendingOperations) {
        this.pendingOperationList.unshift(this._sendingOperations.slice());
        this._sendingOperations = null;
      }
      stateDebug(`State Changed: ${this.state} -> ${STATE.DISCONNECT}`);
      this.state = STATE.DISCONNECT;
    }

    this.eventBus.dispatch(type, message);
  };

  closeSocketConnect = () => {
    this.socketClient.disconnectWithServer();
  };

  receiveParticipantAdded = (uses) => {
    this.eventBus.dispatch(INTERNAL_EVENT.PARTICIPANT_ADDED, uses);
  };

  receiveParticipantRemoved = (email) => {
    this.eventBus.dispatch(INTERNAL_EVENT.PARTICIPANT_REMOVED, email);
  };

  static destroy = () => {
    this.instance = null;
  };

}

export default SocketManager;
