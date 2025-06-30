import { EventBus } from '@seafile/sdoc-editor';
import { ACTION_TYPES } from './constants';
import jsBridge from './js-bridge';


export const handleTitleBar = (value) => {
  const eventBus = EventBus.getInstance();
  eventBus.dispatch('ViewOrEdit', { isEdit: value });
};

export const registerTitleBarEventHandler = () => {
  jsBridge.registerEventHandler(ACTION_TYPES.EDITOR_ACTION_TRANSFER, handleTitleBar);
};
