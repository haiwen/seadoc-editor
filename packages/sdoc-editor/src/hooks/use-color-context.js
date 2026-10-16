import React, { useContext, useState } from 'react';
import context from '../context';
import { DEFAULT_LAST_USED_FONT_COLOR, DEFAULT_LAST_USED_HIGHLIGHT_COLOR, DEFAULT_LAST_USED_TABLE_CELL_BACKGROUND_COLOR, LAST_USED_TEXT_COLORS_KEY } from '../extension/constants';
import LocalStorage from '../utils/local-storage-utils';

const ColorContext = React.createContext(null);

const getLastUsedTextColors = (storageKey) => {
  if (typeof window === 'undefined' || !storageKey) return {};
  try {
    return LocalStorage.getItem(storageKey, {});
  } catch {
    return {};
  }
};

export const ColorProvider = (props) => {
  const username = context.getSetting('username');
  const storageKey = username ? `${LAST_USED_TEXT_COLORS_KEY}:${username}` : '';
  const [lastUsedFontColor, setLastUsedFontColor] = useState(() => getLastUsedTextColors(storageKey).fontColor ?? DEFAULT_LAST_USED_FONT_COLOR);
  const [lastUsedHighlightColor, setLastUsedHighlightColor] = useState(() => getLastUsedTextColors(storageKey).highlightColor ?? DEFAULT_LAST_USED_HIGHLIGHT_COLOR);
  const [lastUsedTableCellBackgroundColor, updateLastUsedTableCellBackgroundColor] = useState(DEFAULT_LAST_USED_TABLE_CELL_BACKGROUND_COLOR);

  const updateLastUsedFontColor = (color) => {
    setLastUsedFontColor(color);
    if (!storageKey) return;
    try {
      LocalStorage.setItem(storageKey, { ...getLastUsedTextColors(storageKey), fontColor: color });
    } catch {
      return;
    }
  };

  const updateLastUsedHighlightColor = (color) => {
    setLastUsedHighlightColor(color);
    if (!storageKey) return;
    try {
      LocalStorage.setItem(storageKey, { ...getLastUsedTextColors(storageKey), highlightColor: color });
    } catch {
      return;
    }
  };

  return (
    <ColorContext.Provider value={{
      lastUsedFontColor,
      updateLastUsedFontColor,
      lastUsedHighlightColor,
      updateLastUsedHighlightColor,
      lastUsedTableCellBackgroundColor,
      updateLastUsedTableCellBackgroundColor
    }}>
      {props.children}
    </ColorContext.Provider>
  );
};

export const useColorContext = () => {
  const context = useContext(ColorContext);
  if (!context) {
    throw new Error('\'ColorContext\' is null');
  }
  const { lastUsedFontColor, lastUsedHighlightColor, lastUsedTableCellBackgroundColor,
    updateLastUsedFontColor, updateLastUsedHighlightColor, updateLastUsedTableCellBackgroundColor } = context;
  return {
    lastUsedFontColor,
    updateLastUsedFontColor,
    lastUsedHighlightColor,
    updateLastUsedHighlightColor,
    lastUsedTableCellBackgroundColor,
    updateLastUsedTableCellBackgroundColor
  };
};
