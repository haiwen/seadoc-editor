import {
  RECENT_USED_HIGHLIGHT_COLORS_KEY,
  DEFAULT_LAST_USED_HIGHLIGHT_COLOR,
  RECENT_USED_FONT_COLORS_KEY,
  DEFAULT_FONT_COLOR,
  DEFAULT_LAST_USED_FONT_COLOR,
} from './color';
import {
  BLOCKQUOTE,
  HEADER,
  HEADER1,
  HEADER2,
  HEADER3,
  HEADER4,
  HEADER5,
  HEADER6,
  MULTI_COLUMN,
  COLUMN,
  TWO_COLUMN,
  THREE_COLUMN,
  FOUR_COLUMN,
  ORDERED_LIST,
  UNORDERED_LIST,
  CHECK_LIST_ITEM,
  CODE_BLOCK,
  LINK,
  IMAGE,
  VIDEO,
  TABLE,
  SDOC_LINK,
  FILE_LINK,
  PARAGRAPH,
  CALL_OUT,
  WHITEBOARD,
  FILE_VIEW,
  FORMULA
} from './element-type';

export const UNDO = 'undo';
export const REDO = 'redo';
export const CLEAR_FORMAT = 'clear_format';
export const REMOVE_TABLE = 'remove_table';
export const COMBINE_CELL = 'combine_cell';
export const SEARCH_REPLACE = 'search_replace';

// text style
export const TEXT_STYLE = 'text_style';
export const ITALIC = 'italic';
export const BOLD = 'bold';
const UNDERLINE = 'underline';
const INLINE_CODE = 'inline_code';
const TEXT_LINK = 'text_link';
const HIGHLIGHT_COLOR = 'highlight_color';
const COLOR = 'color';

// text-align
export const TEXT_ALIGN = 'text_align';
const ALIGN_LEFT = 'align_left';
const ALIGN_RIGHT = 'align_right';
const ALIGN_CENTER = 'align_center';

export const TEXT_STYLE_MORE = 'text_style_more';
const STRIKETHROUGH = 'strikethrough';
const SUPERSCRIPT = 'superscript';
const SUBSCRIPT = 'subscript';
// const FONT_SIZE_INCREASE = 'font-size-increase';
// const FONT_SIZE_REDUCE = 'font-size-reduce';

export const TEXT_STYLE_MAP = {
  COLOR: COLOR,
  HIGHLIGHT_COLOR: HIGHLIGHT_COLOR,
  FONT_SIZE: 'font_size',
  FONT: 'font',
  BOLD: BOLD,
  ITALIC: ITALIC,
  BOLD_ITALIC: `${BOLD}_${ITALIC}`,
  UNDERLINE: UNDERLINE,
  STRIKETHROUGH: STRIKETHROUGH,
  SUPERSCRIPT: SUPERSCRIPT,
  SUBSCRIPT: SUBSCRIPT,
  CODE: 'code',
  DELETE: 'delete',
  ADD: 'add',
  LINK: 'link',
};

// header menu config
export const MENUS_CONFIG_MAP = {
  [BLOCKQUOTE]: {
    id: `sdoc_${BLOCKQUOTE}`,
    iconClass: 'sdocfont sdoc-quote-left',
    text: 'Quote'
  },
  [ORDERED_LIST]: {
    id: ORDERED_LIST,
    iconClass: 'sdocfont sdoc-list-ol',
    text: 'Ordered_list'
  },
  [UNORDERED_LIST]: {
    id: UNORDERED_LIST,
    iconClass: 'sdocfont sdoc-list-ul',
    text: 'Unordered_list'
  },
  [CHECK_LIST_ITEM]: {
    id: CHECK_LIST_ITEM,
    iconClass: 'sdocfont sdoc-check-square',
    text: 'Check_list'
  },
  [CODE_BLOCK]: {
    id: CODE_BLOCK,
    iconClass: 'sdocfont sdoc-code-block',
    text: 'Code_block'
  },
  [LINK]: {
    id: `sdoc_${LINK}`,
    iconClass: 'sdocfont sdoc-link',
    text: 'Link'
  },
  [IMAGE]: {
    id: `sdoc_${IMAGE}`,
    iconClass: 'sdocfont sdoc-image',
    text: 'Image'
  },
  [VIDEO]: {
    id: `sdoc_${VIDEO}`,
    iconClass: 'sdocfont sdoc-video',
    text: 'Video'
  },
  [WHITEBOARD]: {
    id: `sdoc_${WHITEBOARD}`,
    iconClass: 'sdocfont sdoc-whiteboard',
    text: 'Whiteboard'
  },
  [TABLE]: {
    id: `sdoc_${TABLE}`,
    iconClass: 'sdocfont sdoc-table',
    text: 'Table'
  },
  [FORMULA]: {
    id: `seafile_${FORMULA}`,
    iconClass: 'mdfont md-formula',
    text: 'Insert_formula'
  },
  [TEXT_STYLE]: [
    {
      id: ITALIC,
      iconClass: 'sdocfont sdoc-italic',
      text: 'Italic',
      ariaLabel: 'italic',
      type: TEXT_STYLE_MAP.ITALIC
    },
    {
      id: BOLD,
      iconClass: 'sdocfont sdoc-bold',
      text: 'Bold',
      ariaLabel: 'bold',
      type: TEXT_STYLE_MAP.BOLD
    },
    {
      id: UNDERLINE,
      iconClass: 'sdocfont sdoc-underline',
      text: 'Underline',
      ariaLabel: 'underline',
      type: TEXT_STYLE_MAP.UNDERLINE
    },
    {
      id: INLINE_CODE,
      iconClass: 'sdocfont sdoc-inline-code',
      text: 'Inline_code',
      ariaLabel: 'code',
      type: TEXT_STYLE_MAP.CODE
    },
    {
      id: TEXT_LINK,
      iconClass: 'sdocfont sdoc-link',
      text: 'Insert_link',
      ariaLabel: 'link',
      type: TEXT_STYLE_MAP.LINK
    },
    {
      id: `sdoc-${HIGHLIGHT_COLOR}`,
      iconClass: 'sdocfont sdoc-highlight-color',
      text: 'Highlight_color',
      ariaLabel: 'background color',
      type: TEXT_STYLE_MAP.HIGHLIGHT_COLOR,
      isColor: true,
      recentUsedColorsKey: RECENT_USED_HIGHLIGHT_COLORS_KEY,
      defaultLastUsedColor: DEFAULT_LAST_USED_HIGHLIGHT_COLOR,
    },
    {
      id: `sdoc-font-${COLOR}`,
      iconClass: 'sdocfont sdoc-font-color',
      text: 'Font_color',
      ariaLabel: 'font color',
      type: TEXT_STYLE_MAP.COLOR,
      defaultColor: DEFAULT_FONT_COLOR,
      isColor: true,
      recentUsedColorsKey: RECENT_USED_FONT_COLORS_KEY,
      defaultLastUsedColor: DEFAULT_LAST_USED_FONT_COLOR,
    }
  ],
  [TEXT_STYLE_MORE]: [ //
    {
      id: STRIKETHROUGH,
      iconClass: 'sdocfont sdoc-strikethrough',
      text: 'Strikethrough',
      type: TEXT_STYLE_MAP.STRIKETHROUGH
    },
    {
      id: SUPERSCRIPT,
      iconClass: 'sdocfont sdoc-superscripts',
      text: 'Superscript',
      type: TEXT_STYLE_MAP.SUPERSCRIPT
    },
    {
      id: SUBSCRIPT,
      iconClass: 'sdocfont sdoc-subscripts',
      text: 'Subscript',
      type: TEXT_STYLE_MAP.SUBSCRIPT
    }
  ],
  [TEXT_ALIGN]: [
    {
      id: ALIGN_LEFT,
      iconClass: 'sdocfont sdoc-align-left',
      type: 'left'
    },
    {
      id: ALIGN_CENTER,
      iconClass: 'sdocfont sdoc-align-center',
      type: 'center'
    },
    {
      id: ALIGN_RIGHT,
      iconClass: 'sdocfont sdoc-align-right',
      type: 'right'
    }
  ],
  [UNDO]: {
    id: UNDO,
    iconClass: 'sdocfont sdoc-revoke',
    text: 'Undo',
    type: 'undo',
  },
  [REDO]: {
    id: REDO,
    iconClass: 'sdocfont sdoc-redo',
    text: 'Redo',
    type: 'redo',
  },
  // 'background_color': {  // used for table cell menu
  //   id: 'sdoc_background_color',
  //   iconClass: 'sdocfont sdoc-bg-color',
  //   text: 'Background_color'
  // },
  [CLEAR_FORMAT]: {
    id: `sdoc_${CLEAR_FORMAT}`,
    iconClass: 'sdocfont sdoc-format-clear',
    text: 'Clear_format'
  },
  [SDOC_LINK]: {
    id: `sdoc_${SDOC_LINK}`,
    iconClass: 'sdocfont sdoc-document-link',
    text: 'Link_sdoc'
  },
  [FILE_LINK]: {
    id: `sdoc_${FILE_LINK}`,
    iconClass: 'sdocfont sdoc-link-file',
    text: 'Link_file'
  },
  [CALL_OUT]: {
    id: `sdoc_${CALL_OUT}`,
    iconClass: 'sdocfont sdoc-callout',
    text: 'Callout'
  },
  [SEARCH_REPLACE]: {
    id: `sdoc_${SEARCH_REPLACE}`,
    iconClass: 'sdocfont sdoc-find-replace',
    text: 'Search_and_replace'
  },
};

// Side transform menu config
export const SIDE_TRANSFORM_MENUS_CONFIG = [
  {
    id: PARAGRAPH,
    iconClass: 'sdocfont sdoc-text',
    type: PARAGRAPH,
    text: 'Paragraph'
  },
  {
    id: HEADER1,
    iconClass: 'sdocfont sdoc-header1',
    type: HEADER1,
    text: 'Header_one'
  },
  {
    id: HEADER2,
    iconClass: 'sdocfont sdoc-header2',
    type: HEADER2,
    text: 'Header_two'
  },
  {
    id: HEADER3,
    iconClass: 'sdocfont sdoc-header3',
    type: HEADER3,
    text: 'Header_three'
  },
  {
    id: HEADER4,
    iconClass: 'sdocfont sdoc-header4',
    type: HEADER4,
    text: 'Header_four'
  },
  {
    id: HEADER5,
    iconClass: 'sdocfont sdoc-header5',
    type: HEADER5,
    text: 'Header_five'
  },
  {
    id: HEADER6,
    iconClass: 'sdocfont sdoc-header6',
    type: HEADER6,
    text: 'Header_six'
  },
  {
    id: UNORDERED_LIST,
    iconClass: 'sdocfont sdoc-list-ul',
    type: UNORDERED_LIST,
    text: 'Unordered_list'
  },
  {
    id: ORDERED_LIST,
    iconClass: 'sdocfont sdoc-list-ol',
    type: ORDERED_LIST,
    text: 'Ordered_list'
  },
  {
    id: CHECK_LIST_ITEM,
    iconClass: 'sdocfont sdoc-check-square',
    type: CHECK_LIST_ITEM,
    text: 'Check_list'
  },
  {
    id: BLOCKQUOTE,
    iconClass: 'sdocfont sdoc-quote-left',
    type: BLOCKQUOTE,
    text: 'Quote'
  },
  {
    id: CALL_OUT,
    iconClass: 'sdocfont sdoc-callout',
    type: CALL_OUT,
    text: 'Callout'
  },
  {
    id: TWO_COLUMN,
    iconClass: 'sdocfont sdoc-multi-column',
    type: TWO_COLUMN,
    text: 'Two_column'
  },
  {
    id: THREE_COLUMN,
    iconClass: 'sdocfont sdoc-multi-column',
    type: THREE_COLUMN,
    text: 'Three_column'
  },
  {
    id: FOUR_COLUMN,
    iconClass: 'sdocfont sdoc-multi-column',
    type: FOUR_COLUMN,
    text: 'Four_column'
  }
];

export const SIDE_TRANSFORM_MENUS_SEARCH_MAP = {
  [PARAGRAPH]: 'Paragraph',
  [HEADER1]: 'Header_one',
  [HEADER2]: 'Header_two',
  [HEADER3]: 'Header_three',
  [HEADER4]: 'Header_four',
  [HEADER5]: 'Header_five',
  [HEADER6]: 'Header_six',
  [UNORDERED_LIST]: 'Unordered_list',
  [ORDERED_LIST]: 'Ordered_list',
  [CHECK_LIST_ITEM]: 'Check_list',
  [BLOCKQUOTE]: 'Quote',
  [CALL_OUT]: 'Callout',
};

// Side insert menu config
export const SIDE_INSERT_MENUS_CONFIG = {
  [IMAGE]: {
    id: '',
    iconClass: 'sdocfont sdoc-image',
    type: IMAGE,
    text: 'Image'
  },
  [VIDEO]: {
    id: 'sdoc-side-menu-item-video',
    iconClass: 'sdocfont sdoc-video',
    type: VIDEO,
    text: 'Video'
  },
  [TABLE]: {
    id: 'sdoc-side-menu-item-table',
    iconClass: 'sdocfont sdoc-table',
    type: TABLE,
    text: 'Table'
  },
  [LINK]: {
    id: '',
    iconClass: 'sdocfont sdoc-link',
    type: LINK,
    text: 'Link'
  },
  [CODE_BLOCK]: {
    id: '',
    iconClass: 'sdocfont sdoc-code-block',
    type: CODE_BLOCK,
    text: 'Code_block'
  },
  [CALL_OUT]: {
    id: '',
    iconClass: 'sdocfont sdoc-callout',
    text: 'Callout'
  },
  [ORDERED_LIST]: {
    id: '',
    iconClass: 'sdocfont sdoc-list-ol',
    type: ORDERED_LIST,
    text: 'Ordered_list'
  },
  [UNORDERED_LIST]: {
    id: '',
    iconClass: 'sdocfont sdoc-list-ul',
    type: UNORDERED_LIST,
    text: 'Unordered_list'
  },
  [CHECK_LIST_ITEM]: {
    id: '',
    iconClass: 'sdocfont sdoc-check-square',
    type: CHECK_LIST_ITEM,
    text: 'Check_list'
  },
  [PARAGRAPH]: {
    id: PARAGRAPH,
    iconClass: 'sdocfont sdoc-text',
    type: PARAGRAPH,
    text: 'Paragraph'
  },
  [HEADER]: [
    {
      id: HEADER1,
      iconClass: 'sdocfont sdoc-header1',
      type: HEADER1,
      text: 'Header_one'
    },
    {
      id: HEADER2,
      iconClass: 'sdocfont sdoc-header2',
      type: HEADER2,
      text: 'Header_two'
    },
    {
      id: HEADER3,
      iconClass: 'sdocfont sdoc-header3',
      type: HEADER3,
      text: 'Header_three'
    }
  ],
  [MULTI_COLUMN]: [
    {
      id: TWO_COLUMN,
      iconClass: 'sdocfont sdoc-multi-column',
      type: TWO_COLUMN,
      text: 'Two_column'
    },
    {
      id: THREE_COLUMN,
      iconClass: 'sdocfont sdoc-multi-column',
      type: THREE_COLUMN,
      text: 'Three_column'
    },
    {
      id: FOUR_COLUMN,
      iconClass: 'sdocfont sdoc-multi-column',
      type: FOUR_COLUMN,
      text: 'Four_column'
    }
  ],
  [BLOCKQUOTE]: {
    id: BLOCKQUOTE,
    iconClass: 'sdocfont sdoc-quote-left',
    type: BLOCKQUOTE,
    text: 'Quote'
  },
  [FILE_VIEW]: {
    id: 'sdoc-side-menu-item-file-view',
    iconClass: 'sdocfont sdoc-file-view',
    type: FILE_VIEW,
    text: 'File_view'
  },
};

export const SIDE_INSERT_MENUS_SEARCH_MAP = {
  [IMAGE]: 'Image',
  [VIDEO]: 'Video',
  [TABLE]: 'Table',
  [COLUMN]: 'Column',
  [TWO_COLUMN]: 'Two_column',
  [THREE_COLUMN]: 'Three_column',
  [FOUR_COLUMN]: 'Four_column',
  [LINK]: 'Link',
  [CODE_BLOCK]: 'Code_block',
  [CALL_OUT]: 'Callout',
  [UNORDERED_LIST]: 'Unordered_list',
  [ORDERED_LIST]: 'Ordered_list',
  [CHECK_LIST_ITEM]: 'Check_list',
  [PARAGRAPH]: 'Paragraph',
  [HEADER1]: 'Header_one',
  [HEADER2]: 'Header_two',
  [HEADER3]: 'Header_three',
  [HEADER4]: 'Header_four',
  [FILE_VIEW]: 'File_view',
};

export const SIDE_QUICK_INSERT_MENUS_SEARCH_MAP = {
  [IMAGE]: 'Image',
  [VIDEO]: 'Video',
  [TABLE]: 'Table',
  [COLUMN]: 'Column',
  [TWO_COLUMN]: 'Two_column',
  [THREE_COLUMN]: 'Three_column',
  [FOUR_COLUMN]: 'Four_column',
  [LINK]: 'Link',
  [CODE_BLOCK]: 'Code_block',
  [CALL_OUT]: 'Callout',
  [UNORDERED_LIST]: 'Unordered_list',
  [ORDERED_LIST]: 'Ordered_list',
  [CHECK_LIST_ITEM]: 'Check_list',
  [PARAGRAPH]: 'Paragraph',
  [HEADER1]: 'Header_one',
  [HEADER2]: 'Header_two',
  [HEADER3]: 'Header_three',
  [HEADER4]: 'Header_four',
  [FILE_VIEW]: 'File_view',
};

// Other operations menu config
export const SIDE_OTHER_OPERATIONS_MENUS_SEARCH_MAP = {
  'COPY_LINK_OF_SECTION': 'Copy_link_of_section',
  'COPY': 'Copy',
  'CUT': 'Cut',
  'DELETE': 'Delete',
};
