import React from 'react';
import { withTranslation } from 'react-i18next';
import { EventBus, toaster } from '@seafile/sdoc-editor';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';

import './style.css';

const propTypes = {
  isEditMode: PropTypes.bool,
  t: PropTypes.func.isRequired,
};

class TipMessage extends React.Component {

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
    const { t } = this.props;
    const message = t('Failed_to_execute_operation_on_server');
    toaster.warning(message, { hasCloseButton: true });
  };

  onSyncServerOperationError = () => {
    const { t } = this.props;
    const message = t('Failed_to_sync_with_server_operations');
    toaster.danger(message, { hasCloseButton: false, duration: null });
  };

  onInternalServerExecError = () => {
    const { t } = this.props;
    const message = t('Internal_server_exec_operations_error');
    toaster.danger(message, { hasCloseButton: false, duration: null });
  };

  onTokenExpiredError = (msg) => {
    const { t } = this.props;
    const message = t('Token_expired_Please_refresh_the_page');
    toaster.closeAll();
    toaster.danger(message, { duration: null });
  };

  onPendingOpExceedLimit = () => {
    const { t } = this.props;
    toaster.closeAll();
    const message = t('Pending_operations_exceed_limit');
    toaster.warning(message, { duration: 5 });
  };

  onDisconnect = () => {
    const { t, isEditMode } = this.props;
    if (!isEditMode) return;
    const message = t('Server_is_not_connected_Operation_will_be_sent_to_server_later');
    toaster.warning(message, { hasCloseButton: true, duration: null });
  };

  onReconnectError = () => {
    if (!this.isConnectError) {
      this.isConnectError = true;
      const { t } = this.props;
      const message = t('Server_is_disconnected_Reconnecting');
      toaster.closeAll();
      toaster.warning(message, { hasCloseButton: true, duration: null });
    }
  };

  onReconnect = () => {
    this.isConnectError = false;
    const { t } = this.props;
    const message = t('Server_is_reconnected');
    toaster.closeAll();
    toaster.success(message); // close after serval seconds
  };

  onDocumentSaving = () => {
    this.setState({
      isSaving: true,
      isSaved: false
    });
  };

  onDocumentSaved = (lastSavedAt) => {
    if (this.saveTimer) clearTimeout(this.saveTimer);
    if (this.resetTimer) clearTimeout(this.resetTimer);
    this.saveTimer = setTimeout(() => {
      this.setState({
        lastSavedAt,
        isSaving: false,
        isSaved: true
      });
    }, 1000);
    this.resetTimer = setTimeout(() => {
      this.setState({
        isSaving: false,
        isSaved: false
      });
    }, 2000);
  };

  render = () => {
    const { t } = this.props;
    const { isSaved, isSaving, lastSavedAt } = this.state;

    if (isSaving && !isSaved) {
      return <span className="tip-message">{t('Saving')}</span>;
    }

    if (!isSaving && isSaved) {
      return <span className="tip-message">{t('All_changes_saved')}</span>;
    }
    if (lastSavedAt) {
      return (
        <span className='tip-message'>
          <span className='sdocfont sdoc-save-tip mr-2'></span>
          <span className='save-time'>{dayjs(lastSavedAt).format('HH:mm')}</span>
        </span>
      );
    }

    return null;
  };
}

TipMessage.propTypes = propTypes;

export default withTranslation('sdoc-editor')(TipMessage);
