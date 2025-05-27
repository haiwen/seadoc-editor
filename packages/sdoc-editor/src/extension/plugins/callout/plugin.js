import { Editor, Transforms } from '@seafile/slate';
import isHotkey from 'is-hotkey';
import { INTERNAL_EVENT } from '../../../constants';
import EventBus from '../../../utils/event-bus';
import { PARAGRAPH, INSERT_POSITION, CODE_BLOCK, CALL_OUT } from '../../constants';
import { isSelectionAtBlockStart } from '../../core';
import { insertElement } from '../../toolbar/side-toolbar/helpers';
import { CALLOUT_ALLOWED_INSIDE_TYPES } from './constant';
import { deleteCalloutIcon, getCalloutEntry, isCalloutContentEmpty, unwrapCallout } from './helper';

/**
 * @param {Editor} editor
 * @returns
 */
const withCallout = (editor) => {
  const { insertFragment, deleteBackward, onHotKeyDown, insertData } = editor;
  const newEditor = editor;

  newEditor.deleteBackward = (unit) => {
    const calloutEntry = getCalloutEntry(editor);
    if (calloutEntry) {
      const node = calloutEntry[0];
      if (isSelectionAtBlockStart(editor) && !!node.callout_icon) {
        deleteCalloutIcon(editor);
        return;
      }
      if (isSelectionAtBlockStart(editor) && isCalloutContentEmpty(calloutEntry)) {
        unwrapCallout(editor);
        return;
      }
    }
    return deleteBackward(unit);
  };

  newEditor.insertData = (data) => {
    if (getCalloutEntry(newEditor)) {
      if (data.types.includes('text/code-block')) {
        const eventBus = EventBus.getInstance();
        eventBus.dispatch(INTERNAL_EVENT.DISPLAY_CALLOUT_UNSUPPORT_ALERT, CODE_BLOCK);
        return;
      }
    }
    return insertData(data);
  };

  newEditor.insertFragment = (data) => {
    if (getCalloutEntry(editor)) {
      // No paste any unsupportedType content into callout
      const unsupportedType = data.find(node => !CALLOUT_ALLOWED_INSIDE_TYPES.includes(node.type))?.type;
      if (unsupportedType) {
        const eventBus = EventBus.getInstance();
        eventBus.dispatch(INTERNAL_EVENT.DISPLAY_CALLOUT_UNSUPPORT_ALERT, unsupportedType);
        return;
      }

      // Unwrap the callout nodes if nested within another callout
      const hasCalloutNode = data.some(node => node.type === CALL_OUT);
      if (hasCalloutNode) {
        const newData = data.flatMap(node => node.type === CALL_OUT ? node.children : [node]);
        insertFragment(newData);
      } else {
        insertFragment(data);
      }
      return;
    }
    return insertFragment(data);
  };

  newEditor.onHotKeyDown = (event) => {
    const calloutEntry = getCalloutEntry(editor);
    if (calloutEntry) {
      const [, calloutPath] = calloutEntry;
      // Close color picker
      const eventBus = EventBus.getInstance();
      eventBus.dispatch(INTERNAL_EVENT.CLOSE_CALLOUT_COLOR_PICKER);

      if (isHotkey('mod+enter', event)) {
        insertElement(newEditor, PARAGRAPH, INSERT_POSITION.AFTER);
        return true;
      }

      if (isHotkey('mod+a', event)) {
        event.preventDefault();
        try {
          const startPoint = Editor.start(newEditor, calloutPath);
          const endPoint = Editor.end(newEditor, calloutPath);
          const selectRange = Editor.range(newEditor, startPoint, endPoint);
          Transforms.select(newEditor, selectRange);
          return true;
        } catch (error) {
          return true;
        }
      }
    }
    return onHotKeyDown && onHotKeyDown(event);
  };

  newEditor.onCopy = (event) => {
    if (getCalloutEntry(editor)) {
      event.stopPropagation();
    }
  };


  return newEditor;
};

export default withCallout;
