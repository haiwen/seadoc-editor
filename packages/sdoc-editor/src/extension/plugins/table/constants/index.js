export const TABLE_MAX_ROWS = 500;
export const TABLE_MAX_COLUMNS = 50;

export const EMPTY_SELECTED_RANGE = {
  minRowIndex: -1,
  maxRowIndex: -1,
  minColIndex: -1,
  maxColIndex: -1,
};

export const TABLE_ROW_MIN_HEIGHT = 42;

export const TABLE_CELL_MIN_WIDTH = 35;

export const TABLE_ELEMENT = {
  TABLE: 'table',
  ROW: 'row',
  COLUMN: 'column',
  CELL: 'cell',
};

export const TABLE_ELEMENT_SPAN = {
  [TABLE_ELEMENT.TABLE]: 'table',
  [TABLE_ELEMENT.ROW]: 'tr',
  [TABLE_ELEMENT.CELL]: 'td',
};

export const TABLE_ELEMENT_POSITION = {
  AFTER: 'after',
  BEFORE: 'before',
};

export const SELECTED_TABLE_CELL_BACKGROUND_COLOR = '#dee8fe';

export const TABLE_CELL_STYLE = {
  TEXT_ALIGN: 'text_align',
  BACKGROUND_COLOR: 'background_color',
  ALIGN_ITEMS: 'align_items',
};

export const TABLE_ROW_STYLE = {
  MIN_HEIGHT: 'min_height',
};

export const TABLE_ALTERNATE_HIGHLIGHT_CLASS_MAP = {
  'sdoc-table-header-3f495d': 'sdoc-table-body-3f495d',
  'sdoc-table-header-2367f2': 'sdoc-table-body-2367f2',
  'sdoc-table-header-f77d21': 'sdoc-table-body-f77d21',
  'sdoc-table-header-0099f4': 'sdoc-table-body-0099f4',
};

export const TABLE_TEMPLATE_POSITION_MAP = {
  '[0,0]': 'sdoc-table-header-3f495d',
  '[1,0]': 'sdoc-table-header-2367f2',
  '[0,1]': 'sdoc-table-header-f77d21',
  '[1,1]': 'sdoc-table-header-0099f4',
};

export const INHERIT_CELL_STYLE_WHEN_SELECT_SINGLE = ['background_color'];

export const INHERIT_CELL_STYLE_WHEN_SELECT_MULTIPLE = ['background_color', 'text_align'];

export const RESIZE_MASK_TOP = 'top';
export const RESIZE_MASK_RIGHT = 'right';
export const RESIZE_MASK_BOTTOM = 'bottom';
export const RESIZE_MASK_LEFT = 'left';
export const RESIZE_HANDLER_ROW = 'row';
export const RESIZE_HANDLER_COLUMN = 'column';
export const RESIZE_HANDLER_FIRST_COLUMN = 'first_column';
export const DRAG_HANDLER_ROW = 'row';
export const DRAG_HANDLER_COLUMN = 'column';

export const CELL_SELECTED = 'cell-selected';

