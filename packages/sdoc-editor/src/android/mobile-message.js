import React from 'react';
import EventBus from '../utils/event-bus';
import { dispatchSystemEvent } from './dispatch-system-event';

class MobileMessage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isSaved: false,
      isSaving: false,
      lastSavedAt: '',
    };
    this.saveTimer = null;
  }

  componentDidMount() {
    const eventBus = EventBus.getInstance();
    this.unsubscribeSavingEvent = eventBus.subscribe('is-saving', this.onDocumentSaving);
    this.unsubscribeSavedEvent = eventBus.subscribe('saved', this.onDocumentSaved);
    this.unsubscribeSavedEvent = eventBus.subscribe('connect', this.onConnect);
    // offline reconnect
    this.unsubscribeDisconnectEvent = eventBus.subscribe('disconnect', this.onDisconnect);
    this.unsubscribeReconnectErrorEvent = eventBus.subscribe('reconnect_error', this.onReconnectError);
    this.unsubscribeReconnectEvent = eventBus.subscribe('reconnect', this.onReconnect);

    // server return error
    this.unsubscribeOpExecError = eventBus.subscribe('execute_client_operations_error', this.onOperationExecuteError);
    this.unsubscribeSyncServerOpError = eventBus.subscribe('sync_server_operations_error', this.onSyncServerOperationError);
    this.unsubscribeDocumentLoadError = eventBus.subscribe('load_document_content_error', this.onInternalServerExecError);
    this.unsubscribeOperationsSaveError = eventBus.subscribe('save_operations_to_database_error', this.onInternalServerExecError);
    this.unsubscribeOperationsSaveError = eventBus.subscribe('token_expired', this.onTokenExpiredError);

    // local error
    this.unsubscribePendingOpExceedLimit = eventBus.subscribe('pending_operations_exceed_limit', this.onPendingOpExceedLimit);
  }

  componentWillUnmount() {
    this.unsubscribeSavingEvent();
    this.unsubscribeSavedEvent();

    this.unsubscribeDisconnectEvent();
    this.unsubscribeReconnectErrorEvent();
    this.unsubscribeReconnectEvent();

    this.unsubscribeOpExecError();
    this.unsubscribeSyncServerOpError();
    this.unsubscribePendingOpExceedLimit();
    this.unsubscribeDocumentLoadError();
    this.unsubscribeOperationsSaveError();

    clearTimeout(this.saveTimer);
  }

  onOperationExecuteError = () => {
    const message = 'failed_to_execute_operation_on_server';
    dispatchSystemEvent(message);
  };

  onSyncServerOperationError = () => {
    const message = 'failed_to_sync_with_server_operations';
    dispatchSystemEvent(message);
  };

  onInternalServerExecError = () => {
    const message = 'internal_server_exec_operations_error';
    dispatchSystemEvent(message);
  };

  onTokenExpiredError = (msg) => {
    const message = 'token_expired_Please_refresh_the_page';
    dispatchSystemEvent(message);
  };

  onPendingOpExceedLimit = () => {
    const message = 'pending_operations_exceed_limit';
    dispatchSystemEvent(message);
  };

  onDisconnect = () => {
    const message = 'server_is_not_connected_operation_will_be_sent_to_server_later';
    dispatchSystemEvent(message);
  };

  onReconnectError = () => {
    if (!this.isConnectError) {
      this.isConnectError = true;
      const message = 'server_is_disconnected_reconnecting';
      dispatchSystemEvent(message);
    }
  };

  onConnect = () => {
    this.isConnectError = false;
  };

  onReconnect = () => {
    this.isConnectError = false;
    const message = 'server_is_reconnected';
    dispatchSystemEvent(message);
  };

  onDocumentSaving = () => {
    const message = 'document_is_saving';
    dispatchSystemEvent(message);
  };

  onDocumentSaved = () => {
    const message = 'document_is_saved';
    dispatchSystemEvent(message);
  };

  render = () => {
    return null;
  };
}


export default MobileMessage;
