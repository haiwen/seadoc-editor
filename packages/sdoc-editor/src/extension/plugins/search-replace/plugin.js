import isHotkey from 'is-hotkey';
import { INTERNAL_EVENT } from '../../../constants';
import EventBus from '../../../utils/event-bus';

const withSearchReplace = (editor) => {
  const { onHotKeyDown } = editor;
  const newEditor = editor;

  newEditor.onHotKeyDown = (event) => {
    if (isHotkey('mod+f', event)) {
      event.preventDefault();
      event.stopPropagation();
      const eventBus = EventBus.getInstance();
      eventBus.dispatch(INTERNAL_EVENT.OPEN_SEARCH_REPLACE_MODAL);
      return false;
    }

    return onHotKeyDown && onHotKeyDown(event);
  };

  return newEditor;
};

export default withSearchReplace;
