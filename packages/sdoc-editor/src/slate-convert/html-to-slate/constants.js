export const BLOCKQUOTE = 'blockquote';
export const HEADER = 'header';
// each header type should be start with HEADER, all of justices should based on HEADER
export const HEADER1 = `${HEADER}1`;
export const HEADER2 = `${HEADER}2`;
export const HEADER3 = `${HEADER}3`;
export const HEADER4 = `${HEADER}4`;
export const HEADER5 = `${HEADER}5`;
export const HEADER6 = `${HEADER}6`;
export const ORDERED_LIST = 'ordered_list'; // <ol>
export const UNORDERED_LIST = 'unordered_list'; // <ul> // unordered_list can not work
export const LIST_ITEM = 'list_item'; // <li>
export const CHECK_LIST_ITEM = 'check_list_item';
export const PARAGRAPH = 'paragraph';
export const CODE_BLOCK = 'code_block';
export const CODE_LINE = 'code_line';
export const TABLE = 'table';
export const TABLE_ROW = 'table_row';
export const TABLE_CELL = 'table_cell';
export const IMAGE = 'image';
export const LINK = 'link';
export const FORMULA = 'formula';

export const TOP_LEVEL_TYPES = [
  BLOCKQUOTE,
  HEADER1,
  HEADER2,
  HEADER3,
  HEADER4,
  HEADER5,
  HEADER6,
  ORDERED_LIST,
  UNORDERED_LIST,
  CHECK_LIST_ITEM,
  PARAGRAPH,
  CODE_BLOCK,
  TABLE,
];

export const INLINE_LEVEL_TYPES = [
  IMAGE,
  LINK,
];

export const HEADER_LIST = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
export const HEADER_TYPE_MAP = {
  H1: HEADER1,
  H2: HEADER2,
  H3: HEADER3,
  H4: HEADER4,
  H5: HEADER5,
  H6: HEADER6,
};
