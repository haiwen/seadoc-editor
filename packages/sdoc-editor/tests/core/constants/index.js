// extension plugin
export const BLOCKQUOTE = 'blockquote';
export const BOLD = 'bold';
export const HEADER = 'header';
export const HEADER1 = 'header1';
export const HEADER2 = 'header2';
export const HEADER3 = 'header3';
export const HEADER4 = 'header4';
export const HEADER5 = 'header5';
export const HEADER6 = 'header6';
export const ORDERED_LIST = 'ordered_list';
export const UNORDERED_LIST = 'unordered_list';
export const LIST_ITEM = 'list_item';
export const LIST_LIC = 'list_lic'; // placeholder
export const CHECK_LIST_ITEM = 'check_list_item';
export const PARAGRAPH = 'paragraph';
export const LINK = 'link';
export const HTML = 'html';
export const CODE_BLOCK = 'code_block';
export const CODE_LINE = 'code_line';
export const IMAGE = 'image';
export const TABLE = 'table';
export const TABLE_TH = 'table-th';
export const TABLE_TD = 'table-td';
export const TABLE_TR = 'table-tr';
export const TABLE_CELL = 'table_cell';
export const TABLE_ROW = 'table_row';
export const FORMULA = 'formula';
export const COLUMN = 'column';

export const voidChildren = [{ text: '' }];

export const ELEMENTS = {
  ha: { type: LINK },
  hblockquote: { type: BLOCKQUOTE },
  hcodeblock: { type: CODE_BLOCK },
  hcodeline: { type: CODE_LINE },
  hdefault: { type: PARAGRAPH },
  hh1: { type: HEADER1 },
  hh2: { type: HEADER2 },
  hh3: { type: HEADER3 },
  hh4: { type: HEADER4 },
  hh5: { type: HEADER5 },
  hh6: { type: HEADER6 },
  himg: { type: IMAGE, children: voidChildren },
  hli: { type: LIST_ITEM },
  hlic: { type: LIST_LIC },
  hol: { type: ORDERED_LIST },
  hp: { type: PARAGRAPH },
  htable: { type: TABLE },
  htd: { type: TABLE_TD },
  hth: { type: TABLE_TH },
  htcell: { type: TABLE_CELL },
  htrow: { type: TABLE_ROW },
  htodoli: { type: CHECK_LIST_ITEM },
  htr: { type: TABLE_TR },
  hul: { type: UNORDERED_LIST }
};
