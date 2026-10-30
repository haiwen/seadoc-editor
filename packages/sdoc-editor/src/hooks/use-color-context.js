import React, { useContext, useEffect, useState } from 'react';
import context from '../context';
import { DEFAULT_LAST_USED_FONT_COLOR, DEFAULT_LAST_USED_HIGHLIGHT_COLOR, DEFAULT_LAST_USED_TABLE_CELL_BACKGROUND_COLOR, DEFAULT_RECENT_USED_LIST, LAST_USED_TEXT_COLORS_KEY, RECENT_USED_FONT_COLORS_KEY, RECENT_USED_HIGHLIGHT_COLORS_KEY } from '../extension/constants';
import LocalStorage from '../utils/local-storage-utils';

const ColorContext = React.createContext(null);

const getStoredColors = (storageKey, defaultValue = {}) => {
  if (typeof window === 'undefined' || !storageKey) return defaultValue;
  try {
    return LocalStorage.getItem(storageKey, defaultValue);
  } catch {
    return defaultValue;
  }
};

export const ColorProvider = (props) => {
  const username = context.getSetting('username');
  const storageKey = username ? `${LAST_USED_TEXT_COLORS_KEY}:${username}` : '';
  const [lastUsedFontColor, setLastUsedFontColor] = useState(() => getStoredColors(storageKey).fontColor ?? DEFAULT_LAST_USED_FONT_COLOR);
  const [lastUsedHighlightColor, setLastUsedHighlightColor] = useState(() => getStoredColors(storageKey).highlightColor ?? DEFAULT_LAST_USED_HIGHLIGHT_COLOR);
  const [lastUsedTableCellBackgroundColor, updateLastUsedTableCellBackgroundColor] = useState(DEFAULT_LAST_USED_TABLE_CELL_BACKGROUND_COLOR);
  const [recentUsedColors, setRecentUsedColors] = useState(() => ({
    [RECENT_USED_FONT_COLORS_KEY]: getStoredColors(RECENT_USED_FONT_COLORS_KEY, DEFAULT_RECENT_USED_LIST),
    [RECENT_USED_HIGHLIGHT_COLORS_KEY]: getStoredColors(RECENT_USED_HIGHLIGHT_COLORS_KEY, DEFAULT_RECENT_USED_LIST)
  }));
  const recentUsedFontColors = recentUsedColors[RECENT_USED_FONT_COLORS_KEY];
  const recentUsedHighlightColors = recentUsedColors[RECENT_USED_HIGHLIGHT_COLORS_KEY];

  useEffect(() => {
    LocalStorage.setItem(RECENT_USED_FONT_COLORS_KEY, recentUsedFontColors);
  }, [recentUsedFontColors]);

  useEffect(() => {
    LocalStorage.setItem(RECENT_USED_HIGHLIGHT_COLORS_KEY, recentUsedHighlightColors);
  }, [recentUsedHighlightColors]);

  const updateRecentUsedColors = (key, color) => {
    if (!color) return;
    setRecentUsedColors(previous => {
      const colors = previous[key];
      if (colors[0] === color) return previous;
      const newRecentUsedColors = colors.slice(0, 9);
      newRecentUsedColors.unshift(color);
      return { ...previous, [key]: newRecentUsedColors };
    });
  };

  const saveLastUsedTextColor = (colorKey, color) => {
    if (!storageKey) return;
    LocalStorage.setItem(storageKey, {
      ...getStoredColors(storageKey),
      [colorKey]: color
    });
  };

  const updateLastUsedFontColor = (color) => {
    setLastUsedFontColor(color);
    saveLastUsedTextColor('fontColor', color);
  };

  const updateLastUsedHighlightColor = (color) => {
    setLastUsedHighlightColor(color);
    saveLastUsedTextColor('highlightColor', color);
  };

  return (
    <ColorContext.Provider value={{
      lastUsedFontColor,
      updateLastUsedFontColor,
      lastUsedHighlightColor,
      updateLastUsedHighlightColor,
      lastUsedTableCellBackgroundColor,
      updateLastUsedTableCellBackgroundColor,
      recentUsedColors,
      updateRecentUsedColors
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
    updateLastUsedFontColor, updateLastUsedHighlightColor, updateLastUsedTableCellBackgroundColor,
    recentUsedColors, updateRecentUsedColors } = context;
  return {
    lastUsedFontColor,
    updateLastUsedFontColor,
    lastUsedHighlightColor,
    updateLastUsedHighlightColor,
    lastUsedTableCellBackgroundColor,
    updateLastUsedTableCellBackgroundColor,
    recentUsedColors,
    updateRecentUsedColors
  };
};
