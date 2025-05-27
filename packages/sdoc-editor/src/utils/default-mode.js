import { WIKI_EDITOR, ARTICLE_DEFAULT_WIDTH, LEFT_OUTLINE_WIDTH, SDOC_STORAGE } from '../constants';
import LocalStorage from './local-storage-utils';

export const getStyleByDefaultMode = (scrollRef, editor) => {
  const sdocStorage = LocalStorage.getItem(SDOC_STORAGE) || {};
  const { outlineOpen: isShowOutline } = sdocStorage;
  const containerStyle = { width: ARTICLE_DEFAULT_WIDTH };

  // Has outline
  if (isShowOutline && editor.editorType !== WIKI_EDITOR) {
    const rect = scrollRef.current.getBoundingClientRect();

    if ((rect.width - Number(ARTICLE_DEFAULT_WIDTH.slice(0, 3))) / 2 < 280) {
      containerStyle['marginLeft'] = `${LEFT_OUTLINE_WIDTH}px`;
    }
  }
  return containerStyle;
};
