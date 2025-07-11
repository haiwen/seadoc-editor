import EventBus from '../utils/event-bus';
import { ACTION_TYPES } from './constants';
import jsBridge from './js-bridge';


export const handleTitleBar = (params) => {
  const eventBus = EventBus.getInstance();
  if (typeof params === 'object' && params.edit) {
    eventBus.dispatch('ViewOrEdit', { isEdit: true });
    return true;
  }
  return true;
};

export const registerTitleBarEventHandler = () => {
  jsBridge.registerEventHandler(ACTION_TYPES.EDITOR_ACTION_TRANSFER, handleTitleBar);
};
