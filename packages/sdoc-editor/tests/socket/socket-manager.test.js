import SocketClient from '../../src/socket/socket-client';
import SocketManager from '../../src/socket/socket-manager';

jest.mock('../../src/socket/socket-client', () => jest.fn().mockImplementation(() => ({
  sendOperations: jest.fn(),
})));
jest.mock('../../src/constants', () => ({}));
jest.mock('../../src/cursor/helper', () => ({}));
jest.mock('../../src/socket/helpers', () => ({}));
jest.mock('../../src/utils/debug', () => ({
  clientDebug: jest.fn(), conflictDebug: jest.fn(), serverDebug: jest.fn(), stateDebug: jest.fn(),
}));

describe('SocketManager failed acknowledgements', () => {
  let manager;
  let acknowledge;

  beforeEach(() => {
    jest.clearAllMocks();
    manager = new SocketManager({ readonly: false, selection: null }, { version: 1 }, {});
    manager.eventBus.dispatch = jest.fn();
    manager.onReceiveLocalOperations([{ type: 'insert_text', text: 'a' }]);
    acknowledge = manager.socketClient.sendOperations.mock.calls[0][3];
    manager.eventBus.dispatch.mockClear();
  });

  test.each([
    'server_error', 'permission_denied', 'invalid_params', 'unsupported_event', 'unknown_error',
  ])('requests a refresh and stops sending after %s', errorType => {
    acknowledge({ success: false, error_type: errorType });
    manager.onReceiveLocalOperations([{ type: 'insert_text', text: 'b' }]);

    expect(manager.state).toBe('need_reload');
    expect(manager._sendingOperations).toBeNull();
    expect(manager.eventBus.dispatch).toHaveBeenCalledWith('sync_server_operations_error', undefined);
    expect(manager.socketClient.sendOperations).toHaveBeenCalledTimes(1);
    expect(manager.pendingOperationList).toHaveLength(1);
  });

  test('handles an empty acknowledgement as a synchronization failure', () => {
    acknowledge(undefined);

    expect(manager.state).toBe('need_reload');
    expect(manager.eventBus.dispatch).toHaveBeenCalledWith('sync_server_operations_error', undefined);
  });

  test('keeps the existing expiry error handling', () => {
    acknowledge({ success: false, error_type: 'token_expired' });

    expect(manager.state).toBe('need_reload');
    expect(manager.eventBus.dispatch).toHaveBeenCalledWith('token_expired', undefined);
  });

  test('keeps version conflict resolution', () => {
    manager.resolveConflicting = jest.fn();
    acknowledge({ success: false, error_type: 'version_behind_server', lose_operations: [] });

    expect(manager.state).toBe('conflict');
    expect(manager.resolveConflicting).toHaveBeenCalledWith([]);
  });

  test('continues sending after a successful acknowledgement', () => {
    acknowledge({ success: true, version: 2 });
    manager.onReceiveLocalOperations([{ type: 'insert_text', text: 'b' }]);

    expect(manager.document.version).toBe(2);
    expect(manager.socketClient.sendOperations).toHaveBeenCalledTimes(2);
    expect(SocketClient).toHaveBeenCalledTimes(1);
  });
});
