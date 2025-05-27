import { ARTICLE_FULL_WIDTH, WIKI_EDITOR, ARTICLE_FULL_MIN_WIDTH, FULL_WIDTH_MODE, LEFT_OUTLINE_WIDTH, SDOC_STORAGE } from '../constants';
import LocalStorage from './local-storage-utils';

export const getStyleByFullWidthMode = (scrollRef, editor) => {
  const sdocStorage = LocalStorage.getItem(SDOC_STORAGE) || {};
  const { outlineOpen: isShowOutline } = sdocStorage;
  let containerStyle = {};
  containerStyle['width'] = ARTICLE_FULL_WIDTH;
  containerStyle['minWidth'] = ARTICLE_FULL_MIN_WIDTH;

  // Has outline
  if (isShowOutline && editor?.editorType !== WIKI_EDITOR) {
    containerStyle['marginLeft'] = `${LEFT_OUTLINE_WIDTH}px`;
    const adjustWidth = ` - ${LEFT_OUTLINE_WIDTH - 50}px`; // One side is 50
    containerStyle['width'] = containerStyle['width'].slice(0, -1) + adjustWidth;
  }
  return containerStyle;
};

export const getContentStyleByFullModeStyle = () => {
  if (LocalStorage.getItem(FULL_WIDTH_MODE)) {
    return { 'minWidth': `${Number(ARTICLE_FULL_MIN_WIDTH.slice(0, -2))}px` };
  }
  return {};
};
