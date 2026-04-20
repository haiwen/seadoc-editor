import { CHECK_LIST_ITEM, ELEMENT_TYPE, LOCAL_IMAGE, ORDERED_LIST, PARAGRAPH, REDO, UNDO, UNORDERED_LIST } from '../extension/constants';
import { getNearestBlockNode } from '../extension/core';
import { setCheckListItemType } from '../extension/plugins/check-list/helpers';
import { setHeaderType } from '../extension/plugins/header/helpers';
import { insertImage } from '../extension/plugins/image/helpers';
import { setListType } from '../extension/plugins/list/helpers';
import { ACTION_TYPES } from './constants';
import jsBridge from './js-bridge';

const headerTypes = [
  ELEMENT_TYPE.TITLE,
  ELEMENT_TYPE.SUBTITLE,
  ELEMENT_TYPE.HEADER1,
  ELEMENT_TYPE.HEADER2,
  ELEMENT_TYPE.HEADER3,
  ELEMENT_TYPE.HEADER4,
  ELEMENT_TYPE.HEADER5,
  ELEMENT_TYPE.HEADER6,
  ELEMENT_TYPE.PARAGRAPH,
];

const onToolbarTrigger = (data, editor) => {
  const { type, images } = data || {};
  if (headerTypes.includes(type)) {
    const nodeEntry = getNearestBlockNode(editor);
    if (!nodeEntry) return;
    let newType = type;
    if (nodeEntry[0].type === type) {
      newType = PARAGRAPH;
    }
    setHeaderType(editor, newType);
    return true;
  }

  if (type === UNDO) {
    editor.undo();
    return true;
  }

  if (type === REDO) {
    editor.redo();
    return true;
  }

  if (type === UNORDERED_LIST || type === ORDERED_LIST) {
    setListType(editor, type);
    return true;
  }

  if (type === CHECK_LIST_ITEM) {
    const nodeEntry = getNearestBlockNode(editor);
    if (!nodeEntry) return;
    let newType = type;
    if (nodeEntry[0].type === type) {
      newType = PARAGRAPH;
    }
    setCheckListItemType(editor, newType);
    return true;
  }

  if (type === LOCAL_IMAGE) {
    if (!images || !Array.isArray(images) || images.length === 0) {
      return true;
    }
    insertImage(editor, images, editor.selection);
    return true;
  }

  return false;
};

export const updateEditorHistory = (editor) => {
  if (!window.seadroid) {
    window.seadroid = {};
  }
  window.seadroid['history'] = editor.history;
};

export const registerToolbarMenuTrigger = () => {
  jsBridge.registerEventHandler(ACTION_TYPES.TOOLBAR_MENU_TRIGGER, onToolbarTrigger);
};
