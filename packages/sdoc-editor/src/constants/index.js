export { default as KeyCodes } from './key-codes';
export { PLUGIN_DISPLAY_TYPE, PLUGIN_BTN_POSITION } from './plugin';
export * as Z_INDEX from './z-index';

export const INTERNAL_EVENT = {
  CANCEL_TABLE_SELECT_RANGE: 'cancel_table_select_range',
  SET_TABLE_SELECT_RANGE: 'set_table_select_range',
  HIDDEN_CODE_BLOCK_HOVER_MENU: 'hidden_code_block_hover_menu',
  ON_MOUSE_ENTER_BLOCK: 'on_mouse_enter_block',
  ON_DRAG_OVER_BLOCK: 'on_drag_over_block',
  ON_DRAG_LEAVE_BLOCK: 'on_drag_leave_block',
  ON_DRAG_DROP_BLOCK: 'on_drag_drop_block',
  INSERT_ELEMENT: 'insert_element',
  OUTLINE_STATE_CHANGED: 'outline_state_changed',
  RELOAD_IMAGE: 'reload_image',
  ARTICLE_CLICK: 'hidden_comment',
  UNSEEN_NOTIFICATIONS_COUNT: 'unseen_notifications_count',
  CLOSE_CALLOUT_COLOR_PICKER: 'close_callout_color_picker',
  OPEN_SEARCH_REPLACE_MODAL: 'open_search_replace_modal',
  UPDATE_SEARCH_REPLACE_HIGHLIGHT: 'update_search_replace_highlight',
  TABLE_CELL_MOUSE_ENTER: 'table_cell_mouse_enter',
  HANDLE_MENTION_TEMP_CHOSEN: 'handle_mention_temp_chosen',
  UPDATE_MENTION_TEMP_CONTENT: 'update_mention_temp_content',
  TABLE_COLUMN_START_DRAG: 'table_column_start_drag',
  TABLE_SHOW_DRAG_HANDLER: 'table_show_drag_handler',
  TABLE_HIDE_DRAG_HANDLER: 'table_show_drag_handler',
  ON_PRINT: 'on_print',
  COMMENT_EDITOR_POST_COMMENT: 'comment_editor_post_comment',
  CLOSE_FILE_INSET_DIALOG: 'close_file_insert_dialog',
  RESIZE_ARTICLE: 'resize_article',
  ON_VIDEO_FILES_UPLOADED: 'on_video_files_uploaded',
  RELOAD_COMMENT: 'reload_comment',
  ASK_AI: 'ask_ai',
  ADD_CONTEXT_COMMENT: 'add_context_comment',
  REFRESH_DOCUMENT: 'refresh_document',
  PUBLISH_DOCUMENT: 'publish_document',
  PUBLISH_DOCUMENT_ERROR: 'publish_document_error',
  DOCUMENT_REPLACED: 'document_replaced',
  DOCUMENT_REPLACED_ERROR: 'document_replaced_error',
  REMOVE_DOCUMENT: 'remove_document',
  REMOVE_DOCUMENT_ERROR: 'remove_document_error',
  NEW_NOTIFICATION: 'new_notification',
  CLEAR_NOTIFICATION: 'clear_notification',
  PARTICIPANT_ADDED: 'participant-added',
  PARTICIPANT_REMOVED: 'participant-removed',
  TOGGLE_PRESENTATION_MODE: 'toggle_presentation_mode',
  CREATE_SDOC_FILE: 'create_sdoc_file',
  CREATE_WIKI_PAGE: 'create_wiki_page',
  IMAGE_COLUMN_TOGGLE: 'Image_column_toggle',
  CREATE_WHITEBOARD_FILE: 'create_whiteboard_file',
  GENERATE_EXDRAW_READ_ONLY_LINK: 'generate_exdraw_read_only_link',
  TRANSFER_PREVIEW_FILE_ID: 'transfer_preview_file_id'
};

export const PAGE_EDIT_AREA_WIDTH = 672; // 672 = 794 - 2[borderLeft + borderRight] - 120[paddingLeft + paddingRight]
export const COMMENT_EDITOR_EDIT_AREA_WIDTH = 364;
export const WIKI_EDITOR_EDIT_AREA_WIDTH = 714;

export const COMMENT_EDITOR = 'comment_editor';
export const WIKI_EDITOR = 'wiki_editor';
export const DOCUMENT_PLUGIN_EDITOR = 'document_plugin_editor';

export const WIKI_OUTLINE = 'wiki-outline';

export const HEADER_OUTLINE_WIDTH_MAPPING = {
  header1: '16px',
  header2: '12px',
  header3: '8px'
};

export const MODIFY_TYPE = {
  ADD: 'add',
  DELETE: 'delete',
  MODIFY: 'modify',
  CHILDREN_MODIFY: 'children_modify',
};

export const REBASE_TYPE = {
  MODIFY_MODIFY: 'modify_modify',
  DELETE_MODIFY: 'delete_modify',
  MODIFY_DELETE: 'modify_delete',
};

export const REBASE_TYPES = [
  REBASE_TYPE.MODIFY_DELETE,
  REBASE_TYPE.DELETE_MODIFY,
  REBASE_TYPE.MODIFY_MODIFY,
];

export const REBASE_MARK_KEY = {
  ORIGIN: 'origin',
  REBASE_TYPE: 'rebase_type',
  MODIFY_TYPE: 'modify_type',
  OLD_ELEMENT: 'old_element',
};

export const REBASE_ORIGIN = {
  OTHER: 'other',
  MY: 'my',
};

export const REBASE_MARKS = [
  REBASE_MARK_KEY.ORIGIN,
  REBASE_MARK_KEY.REBASE_TYPE,
  REBASE_MARK_KEY.MODIFY_TYPE,
  REBASE_MARK_KEY.OLD_ELEMENT,
];

export const DIFF_VIEWER = 'diff_viewer';

export const FULL_WIDTH_MODE = 'full-width-mode';
export const SDOC_STORAGE = 'sdoc';

// left outline
export const LEFT_OUTLINE_WIDTH = 280;

// Default mode width
export const ARTICLE_DEFAULT_WIDTH = '794px';
// Width in full width mode
export const ARTICLE_FULL_WIDTH = 'calc(100% - 50px - 50px)'; // The left and right sides are 50
export const ARTICLE_FULL_MIN_WIDTH = '400px';
