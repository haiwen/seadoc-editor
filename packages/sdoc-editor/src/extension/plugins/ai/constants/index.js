export const OPERATION_TYPES = {
  DEFAULT: 'default',
  CONTINUATION: 'continuation',
  MORE_FLUENT: 'more_fluent',
  MORE_DETAILS: 'more_details',
  MORE_CONCISE: 'more_concise',
  MORE_VIVID: 'more_vivid',
  TRANSLATE: 'translate',
};

export const OPERATION_MENUS_CONFIG = {
  CONTINUATION: {
    id: 'CONTINUATION',
    text: 'Continuation',
    iconClass: 'sdocfont sdoc-continue-writing',
    type: 'continuation'
  },
  MORE_FLUENT: {
    id: 'MORE_FLUENT',
    text: 'More_fluent',
    iconClass: 'sdocfont sdoc-adjust',
    type: 'more_fluent',
  },
  MORE_DETAILS: {
    id: 'MORE_DETAILS',
    text: 'More_details',
    iconClass: 'sdocfont sdoc-adjust',
    type: 'more_details',
  },
  MORE_CONCISE: {
    id: 'MORE_CONCISE',
    text: 'More_concise',
    iconClass: 'sdocfont sdoc-adjust',
    type: 'more_concise',
  },
  MORE_VIVID: {
    id: 'MORE_VIVID',
    text: 'More_vivid',
    iconClass: 'sdocfont sdoc-adjust',
    type: 'more_vivid',
  },
  TRANSLATE: {
    id: 'TRANSLATE',
    text: 'Translate',
    iconClass: 'sdocfont sdoc-ai-translate',
    type: 'translate',
  },
  ADJUSTMENT: {
    id: 'ADJUSTMENT',
    text: 'Adjustment',
    iconClass: 'sdocfont sdoc-adjust',
    type: 'adjustment',
  },
  INSERT_BELOW: {
    id: 'INSERT_BELOW',
    text: 'Insert_below',
    iconClass: 'sdocfont sdoc-insert-below',
    type: 'insert_below',
  },
  REPLACE: {
    id: 'REPLACE',
    text: 'Replace',
    iconClass: 'sdocfont sdoc-replace',
    type: 'replace',
  },
  TRY_AGAIN: {
    id: 'TRY_AGAIN',
    text: 'Try_again',
    iconClass: 'sdocfont sdoc-try-again',
    type: 'try_again',
  },
  COPY: {
    id: 'COPY',
    text: 'Copy',
    iconClass: 'sdocfont sdoc-copy',
    type: 'copy',
  },
  DEPRECATION: {
    id: 'DEPRECATION',
    text: 'Deprecation',
    iconClass: 'sdocfont sdoc-delete',
    type: 'deprecation',
  },
};

export const AI_RESULT_TYPES = {
  continuation: true,
  mode_details: true,
  more_concise: true,
  MORE_VIVID: true,
  TRANSLATE: true,
};

export const LANG_MENU_CONFIG = {
  EN: {
    id: 'en',
    type: 'en',
    text: 'English',
    iconClass: 'sdocfont sdoc-ai-translate',
  },
  ZH_CN: {
    id: 'zh-cn',
    type: 'zh-cn',
    text: 'Chinese',
    iconClass: 'sdocfont sdoc-ai-translate',
  },
  'ZH-CN': {
    id: 'zh-cn',
    type: 'en',
    text: 'Chinese',
    iconClass: 'sdocfont sdoc-ai-translate',
  },
  DE: {
    id: 'de',
    type: 'de',
    text: 'German',
    iconClass: 'sdocfont sdoc-ai-translate',
  },
  FR: {
    id: 'fr',
    type: 'fr',
    text: 'French',
    iconClass: 'sdocfont sdoc-ai-translate',
  },
  RU: {
    id: 'ru',
    type: 'ru',
    text: 'Russian',
    iconClass: 'sdocfont sdoc-ai-translate',
  },
};

// 358 is default height of ai menu and 300 is max-height of shown result
export const AI_MIN_HEIGHT = 358 + 300;
