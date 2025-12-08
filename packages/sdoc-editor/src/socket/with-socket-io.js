import { Editor, Point } from '@seafile/slate';
import deepCopy from 'deep-copy';
import { generateCursorData } from '../cursor/helper';
import EventBus from '../utils/event-bus';
import SocketManager from './socket-manager';

const withSocketIO = (editor, options) => {
  const { onChange } = editor;
  const newEditor = editor;

  let socketManager = null;
  let lastOperations = null;
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
    // mobile: If the operation is exactly the same as the previous one, return directly
    if (JSON.stringify(operations) === JSON.stringify(lastOperations)) {
      return;
    }

    lastOperations = deepCopy(operations);
    if (!newEditor.isRemote && operations.length > 0) {
      const isAllSetSelection = operations.every(operation => operation.type === 'set_selection');
      const socketManager = SocketManager.getInstance(newEditor, document, config);
      if (!isAllSetSelection) {
        // get update content value operations
        const updateOperations = operations.filter(operation => operation.type !== 'set_selection');
        socketManager.onReceiveLocalOperations(updateOperations);
      }

      // Initially collapse the collaborator‘s selections to  start point
      let newCursor = editor.selection;
      const { anchor, focus } = editor.selection;
      if (!Point.equals(anchor, focus)) {
        const frontPoint = Editor.start(editor, { anchor: anchor, focus: focus });
        newCursor = { anchor: frontPoint, focus: frontPoint };
      }
      socketManager.sendCursorLocation(newCursor);
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
