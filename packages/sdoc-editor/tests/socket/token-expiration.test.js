import React, { act } from 'react';
import { toaster } from '@seafile/sdoc-editor';
import { createRoot } from 'react-dom/client';
import socketIOClient from 'socket.io-client';
import Tip from '../../../seafile-sdoc-editor/src/components/tip-message';
import Client from '../../src/socket/socket-client';
import Manager from '../../src/socket/socket-manager';
import EventBus from '../../src/utils/event-bus';

jest.mock('socket.io-client', () => jest.fn());
jest.mock('../../src/socket/socket-manager', () => ({
  __esModule: true, default: { getInstance: jest.fn() },
}));
jest.mock('../../src/utils/debug', () => ({ clientDebug: jest.fn(), serverDebug: jest.fn() }));
jest.mock('react-i18next', () => ({ withTranslation: () => Component => Component }));
// CI runs tests before building the workspace package entry point.
jest.mock('@seafile/sdoc-editor', () => ({
  EventBus: jest.requireActual('../../src/utils/event-bus').default,
  toaster: { warning: jest.fn(), danger: jest.fn(), success: jest.fn(), closeAll: jest.fn() },
}), { virtual: true });

describe('Socket expiry refresh message', () => {
  let root;
  let bus;
  let socket;
  let listeners;
  let client;
  let manager;

  beforeEach(() => {
    global.IS_REACT_ACT_ENVIRONMENT = true;
    jest.clearAllMocks();
    EventBus.instance = null;
    bus = EventBus.getInstance();
    manager = {
      dispatchConnectState: (type, payload) => bus.dispatch(type, payload),
      getDocumentVersion: () => 1,
      onGetRecentOperations: jest.fn(),
    };
    Manager.getInstance.mockReturnValue(manager);
    listeners = new Map();
    socket = { on: (type, callback) => listeners.set(type, callback), emit: jest.fn(), io: { on: jest.fn() } };
    socketIOClient.mockReturnValue(socket);
    client = new Client({ docUuid: 'test-document' });
    root = createRoot(document.createElement('div'));
    act(() => root.render(<Tip isEditMode t={key => key} />));
  });

  afterEach(() => {
    act(() => root.unmount());
    delete global.IS_REACT_ACT_ENVIRONMENT;
  });

  test('preserves the expiry message through subsequent connection and queue events', () => {
    act(() => {
      listeners.get('token-expired')({ error_type: 'token_expired' });
      listeners.get('disconnect')('io server disconnect');
      for (const type of ['pending_operations_exceed_limit', 'reconnect_error', 'reconnect', 'connect', 'token_expired']) {
        bus.dispatch(type);
      }
    });

    expect(toaster.danger).toHaveBeenCalledWith('Token_expired_Please_refresh_the_page', { duration: null });
    expect(toaster.danger).toHaveBeenCalledTimes(1);
    expect(toaster.closeAll).toHaveBeenCalledTimes(1);
    expect(toaster.warning).not.toHaveBeenCalled();
    expect(toaster.success).not.toHaveBeenCalled();
  });

  test.each([
    { message: 'authentication failed', data: { code: 'token_expired' } },
    { message: 'jwt expired' },
  ])('shows the refresh message for an expired handshake: %j', error => {
    act(() => listeners.get('connect_error')(error));

    expect(toaster.danger).toHaveBeenCalledWith('Token_expired_Please_refresh_the_page', { duration: null });
  });

  test.each(['server_error', 'permission_denied', 'token_expired'])('shows a refresh message after sync-document returns %s', errorType => {
    client.getRecentOperations();
    const acknowledge = socket.emit.mock.calls[0][2];
    act(() => acknowledge({ success: false, error_type: errorType }));

    expect(toaster.danger).toHaveBeenCalledTimes(1);
    expect(manager.onGetRecentOperations).not.toHaveBeenCalled();
  });

  test('keeps the queue warning before expiry', () => {
    act(() => bus.dispatch('pending_operations_exceed_limit'));

    expect(toaster.warning).toHaveBeenCalledWith('Pending_operations_exceed_limit', { duration: 5 });
  });
});
