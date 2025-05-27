import { HEADERS, LIST_ITEM_CORRELATION_TYPE } from '../../constants';
import { BLOCKQUOTE, CALL_OUT, CHECK_LIST_ITEM, IMAGE, LINK, ORDERED_LIST, PARAGRAPH, SDOC_LINK, SUBTITLE, TITLE, UNORDERED_LIST } from '../../constants/element-type';

// key as container fill color
export const CALLOUT_COLOR_MAP = {
  '#f1f3f6': { border_color: '#d9dbe0', background_color: '#f1f3f6' },
  '#e1e9fe': { border_color: '#cbdeff', background_color: '#e1e9fe' },
  '#def0ff': { border_color: '#c7ecff', background_color: '#def0ff' },
  '#e7f9ee': { border_color: '#a5dfbf', background_color: '#e7f9ee' },
  '#eaf7d6': { border_color: '#c3e788', background_color: '#eaf7d6' },
  '#fef7e0': { border_color: '#faecb3', background_color: '#fef7e0' },
  '#fff1e8': { border_color: '#ffe1cd', background_color: '#fff1e8' },
  '#ffe6e3': { border_color: '#ffc6c4', background_color: '#ffe6e3' },
  '#ffe9f2': { border_color: '#ffd0e6', background_color: '#ffe9f2' },
  '#fde8ff': { border_color: '#f0c1ff', background_color: '#fde8ff' },
};

export const CALLOUT_ICON_MAP = {
  'trumpet': '📢',
  'bulb': '💡',
  'prohibited': '🚫',
  'warning': '⚠️'
};

export const CALLOUT_ALLOWED_INSIDE_TYPES = [
  CALL_OUT,
  ORDERED_LIST,
  UNORDERED_LIST,
  PARAGRAPH,
  TITLE,
  SUBTITLE,
  BLOCKQUOTE,
  ...HEADERS,
  ...LIST_ITEM_CORRELATION_TYPE,
  CHECK_LIST_ITEM,
  IMAGE,
  LINK,
  SDOC_LINK
];
