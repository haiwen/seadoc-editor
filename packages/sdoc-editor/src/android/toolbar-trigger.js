import { CHECK_LIST_ITEM, ELEMENT_TYPE, ORDERED_LIST, PARAGRAPH, REDO, UNDO, UNORDERED_LIST } from '../extension/constants';
import { getNearestBlockNode } from '../extension/core';
import { setCheckListItemType } from '../extension/plugins/check-list/helpers';
import { setHeaderType } from '../extension/plugins/header/helpers';
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
  const { type } = data;
  if (headerTypes.includes(type)) {
    const nodeEntry = getNearestBlockNode(editor);
    if (!nodeEntry) return;
    let newType = type;
    if (nodeEntry[0].type === type) {
      newType = PARAGRAPH;
    }
    setHeaderType(editor, newType);
    return;
  }

  if (type === UNDO) {
    editor.undo();
    return;
  }

  if (type === REDO) {
    editor.redo();
    return;
  }

  if (type === UNORDERED_LIST || type === ORDERED_LIST) {
    setListType(editor, type);
    return;
  }

  if (type === CHECK_LIST_ITEM) {
    const nodeEntry = getNearestBlockNode(editor);
    if (!nodeEntry) return;
    let newType = type;
    if (nodeEntry[0].type === type) {
      newType = PARAGRAPH;
    }
    setCheckListItemType(editor, newType);
    return;
  }
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
