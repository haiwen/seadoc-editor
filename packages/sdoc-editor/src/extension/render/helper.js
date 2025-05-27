import { Editor } from '@seafile/slate';
import { INTERNAL_EVENT } from '../../constants';
import EventBus from '../../utils/event-bus';
import { MOUSE_ENTER_EVENT_DISABLED_MAP, ROOT_ELEMENT_TYPES, TABLE_DRAG_KEY } from '../constants';
import { findPath } from '../core';

const isNeedAddMouseEnterEvent = (editor, element,) => {
  const elementPath = findPath(editor, element);
  // If the element is the root element, return true
  if (elementPath.length <= 1) return true;
  // If the element type is not in filter list, return true
  if (!Reflect.ownKeys(MOUSE_ENTER_EVENT_DISABLED_MAP).includes(element.type)) return true;
  const disableEventEntry = Editor.above(editor, {
    match: n => MOUSE_ENTER_EVENT_DISABLED_MAP[element.type].includes(n.type),
    mode: 'highest',
    at: elementPath
  });
  return !disableEventEntry;
};

export const setMouseEnter = (editor, element, attributes) => {
  if (!isNeedAddMouseEnterEvent(editor, element)) return;
  attributes['onMouseEnter'] = (e) => onMouseEnter(e, element);
};

export const setDataRoot = (element, attributes) => {
  if (!ROOT_ELEMENT_TYPES.includes(element.type)) return;
  attributes['data-root'] = 'true';
};

export const onMouseEnter = (event, element) => {
  event.stopPropagation();
  const eventBus = EventBus.getInstance();
  eventBus.dispatch(INTERNAL_EVENT.ON_MOUSE_ENTER_BLOCK, event);
};

export const onDragOver = (event) => {
  event.stopPropagation();
  event.preventDefault();
  const dragTypes = event.dataTransfer.types;
  if (dragTypes.includes(TABLE_DRAG_KEY)) return;
  const eventBus = EventBus.getInstance();
  eventBus.dispatch(INTERNAL_EVENT.ON_DRAG_OVER_BLOCK, event);
};

export const onDragLeave = (event) => {
  event.stopPropagation();
  event.preventDefault();
  const eventBus = EventBus.getInstance();
  eventBus.dispatch(INTERNAL_EVENT.ON_DRAG_LEAVE_BLOCK, event);
};

export const onDrop = (event) => {
  event.stopPropagation();
  event.preventDefault();
  const eventBus = EventBus.getInstance();
  eventBus.dispatch(INTERNAL_EVENT.ON_DRAG_DROP_BLOCK, event);
};
