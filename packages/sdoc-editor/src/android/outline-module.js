import { ACTION_TYPES } from './constants';
import jsBridge from './js-bridge';

export const updateOutlineValue = (value) => {
  if (!value || !Array.isArray(value)) return;
  const outlines = value?.filter(item => ['header1', 'header2', 'header3'].includes(item.type));
  if (!window.seadroid) {
    window.seadroid = {};
  }
  window.seadroid['outlines'] = outlines;
};

export const scrollToOutline = (item) => {
  const { id } = item;
  document.getElementById(id).scrollIntoView();
  return true;
};

export const registerOutlineEventHandler = () => {
  jsBridge.registerEventHandler(ACTION_TYPES.SELECT_OUTLINE, scrollToOutline);
};
