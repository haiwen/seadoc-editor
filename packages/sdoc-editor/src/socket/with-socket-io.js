import { generateCursorData } from '../cursor/helper';
import EventBus from '../utils/event-bus';
import SocketManager from './socket-manager';

const withSocketIO = (editor, options) => {
  const { onChange } = editor;
  const newEditor = editor;

  let socketManager = null;

  const { user } = options.config;
  newEditor.user = user;

  newEditor.openConnection = () => {
    const { document, config } = options;
    const cursorData = generateCursorData(options.config);
    config['cursorData'] = cursorData;
    socketManager = SocketManager.getInstance(newEditor, document, config);
  };

  newEditor.closeConnection = () => {
    socketManager && socketManager.closeSocketConnect();
    SocketManager.destroy();
  };

  newEditor.onChange = () => {
    if (newEditor.readonly) return;
    const { document, config } = options;
    let operations = newEditor.operations;
    if (!newEditor.isRemote && operations.length > 0) {
      const isAllSetSelection = operations.every(operation => operation.type === 'set_selection');
      const socketManager = SocketManager.getInstance(newEditor, document, config);
      if (!isAllSetSelection) {
        // get update content value operations
        const updateOperations = operations.filter(operation => operation.type !== 'set_selection');
        socketManager.onReceiveLocalOperations(updateOperations);
      }
      socketManager.sendCursorLocation(editor.selection);
    }

    // dispatch editor change event
    const eventBus = EventBus.getInstance(newEditor, document, config);
    eventBus.dispatch('change');

    onChange();
  };

  newEditor.rebaseContent = (document, originFileVersion) => {
    const { config } = options;
    const socketManager = SocketManager.getInstance(newEditor, document, config);
    socketManager.sendRebaseContent(document, originFileVersion);
  };

  newEditor.updateDocumentVersion = (document) => {
    const { config } = options;
    const socketManager = SocketManager.getInstance(newEditor, document, config);
    socketManager.updateDocumentVersion(document);
  };

  return newEditor;
};

export default withSocketIO;
