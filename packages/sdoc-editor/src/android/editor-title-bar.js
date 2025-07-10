import EventBus from '../utils/event-bus';
import { ACTION_TYPES } from './constants';
import jsBridge from './js-bridge';


export const handleTitleBar = (params) => {
  const eventBus = EventBus.getInstance();
  if (params?.success && params.success === 'true') {
    eventBus.dispatch('ViewOrEdit', { isEdit: true });
  }
};

export const registerTitleBarEventHandler = () => {
  jsBridge.registerEventHandler(ACTION_TYPES.EDITOR_ACTION_TRANSFER, handleTitleBar);
};
