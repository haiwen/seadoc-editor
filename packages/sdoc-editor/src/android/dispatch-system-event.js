import { ACTION_TYPES } from './constants';
import jsBridge from './js-bridge';

export const dispatchSystemEvent = (message_type) => {
  // op execute
  const opData = {
    v: 2,
    action: ACTION_TYPES.EDITOR_SYSTEM_EVENT,
    data: JSON.stringify({
      type: message_type
    })
  };
  jsBridge.callAndroidFunction(JSON.stringify(opData));
};
