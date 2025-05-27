import React, { useContext, useState } from 'react';
import { DEFAULT_LAST_USED_FONT_COLOR, DEFAULT_LAST_USED_HIGHLIGHT_COLOR, DEFAULT_LAST_USED_TABLE_CELL_BACKGROUND_COLOR } from '../extension/constants';

const ColorContext = React.createContext(null);

export const ColorProvider = (props) => {
  const [lastUsedFontColor, updateLastUsedFontColor] = useState(DEFAULT_LAST_USED_FONT_COLOR);
  const [lastUsedHighlightColor, updateLastUsedHighlightColor] = useState(DEFAULT_LAST_USED_HIGHLIGHT_COLOR);
  const [lastUsedTableCellBackgroundColor, updateLastUsedTableCellBackgroundColor] = useState(DEFAULT_LAST_USED_TABLE_CELL_BACKGROUND_COLOR);

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
