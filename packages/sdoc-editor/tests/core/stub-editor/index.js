import { Editor } from '@seafile/slate';
import { createSdocEditor, formatChildren2 } from '../utils';

class StubEditor {

  constructor(input, plugins = []) {
    if (!input) {
      throw new Error('Param input is required');
    }
    this.editor = createSdocEditor(input, plugins);
    this.pendingOperationList = [];
  }

  getEditor = () => {
    return this.editor;
  };

  getContent = () => {
    return formatChildren2(this.editor.children);
  };

  getStringContent = () => {
    return JSON.stringify(this.getContent());
  };

  applyOperations = (operations) => {
    const editor = this.editor;
    Editor.withoutNormalizing(editor, () => {
      operations.forEach(op => editor.apply(op));
    });
    const ops = editor.operations.slice();
    this.pendingOperationList.push(ops);
    editor.operations = [];
  };

  getPendingOperationList = () => {
    return this.pendingOperationList;
  };

  resetPendingOperationList = () => {
    const { operations } = this.editor;
    this.pendingOperationList = [];
    this.pendingOperationList.push(operations);
  };

  clearPendingOperationList = () => {
    this.pendingOperationList = [];
  };

}

export default StubEditor;
