export const SDOC_LINK_TYPE = {
  TEXT_LINK: 'text_link',
  ICON_LINK: 'icon_link',
  CARD_LINK: 'card_link'
};

export const SDOC_LINK_TYPE_CONFIG = {
  [SDOC_LINK_TYPE.TEXT_LINK]: {
    icon: 'sdocfont sdoc-text-link',
    text: 'Text_Link',
  },
  [SDOC_LINK_TYPE.ICON_LINK]: {
    icon: 'sdocfont sdoc-inline-link',
    text: 'Icon_and_text_Link',
  },
  [SDOC_LINK_TYPE.CARD_LINK]: {
    icon: 'sdocfont sdoc-card-link',
    text: 'Card',
  },
};

export const SDOC_LINK_TYPES = [
  SDOC_LINK_TYPE.TEXT_LINK,
  SDOC_LINK_TYPE.ICON_LINK,
  SDOC_LINK_TYPE.CARD_LINK,
];
