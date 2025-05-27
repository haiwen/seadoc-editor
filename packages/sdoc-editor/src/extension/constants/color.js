export const DEFAULT_COLORS = [
  { value: '#FFFFFF', name: 'White' },
  { value: '#000000', name: 'Black' },
  { value: '#485368', name: 'Blue_grey' },
  { value: '#2972F4', name: 'Blue' },
  { value: '#00A3F5', name: 'Sky_blue' },
  { value: '#319B62', name: 'Green' },
  { value: '#DE3C36', name: 'Red' },
  { value: '#F88825', name: 'Orange' },
  { value: '#F5C400', name: 'Yellow' },
  { value: '#9A38D7', name: 'Purple' },

  { value: '#F2F2F2', name: 'Light_grey_x', index: 1 },
  { value: '#7F7F7F', name: 'Dark_grey_x', index: 1 },
  { value: '#F3F5F7', name: 'Light_blue_grey_x', index: 1 },
  { value: '#E5EFFF', name: 'Light_blue_x', index: 1 },
  { value: '#E5F6FF', name: 'Light_sky_blue_x', index: 1 },
  { value: '#EAFAF1', name: 'Light_green_x', index: 1 },
  { value: '#FFE9E8', name: 'Light_red_x', index: 1 },
  { value: '#FFF3EB', name: 'Light_orange_x', index: 1 },
  { value: '#FFF9E3', name: 'Light_yellow_x', index: 1 },
  { value: '#FDEBFF', name: 'Light_purple_x', index: 1 },

  { value: '#D8D8D8', name: 'Light_grey_x', index: 2 },
  { value: '#595959', name: 'Dark_grey_x', index: 2 },
  { value: '#C5CAD3', name: 'Light_blue_grey_x', index: 2 },
  { value: '#C7DCFF', name: 'Light_blue_x', index: 2 },
  { value: '#C7ECFF', name: 'Light_sky_blue_x', index: 2 },
  { value: '#C3EAD5', name: 'Light_green_x', index: 2 },
  { value: '#FFC9C7', name: 'Light_red_x', index: 2 },
  { value: '#FFDCC4', name: 'Light_orange_x', index: 2 },
  { value: '#FFEEAD', name: 'Light_yellow_x', index: 2 },
  { value: '#F2C7FF', name: 'Light_purple_x', index: 2 },

  { value: '#BFBFBF', name: 'Light_grey_x', index: 3 },
  { value: '#3F3F3F', name: 'Dark_grey_x', index: 3 },
  { value: '#808B9E', name: 'Light_blue_grey_x', index: 3 },
  { value: '#99BEFF', name: 'Light_blue_x', index: 3 },
  { value: '#99DDFF', name: 'Light_sky_blue_x', index: 3 },
  { value: '#98D7B6', name: 'Light_green_x', index: 3 },
  { value: '#FF9C99', name: 'Light_red_x', index: 3 },
  { value: '#FFBA84', name: 'Light_orange_x', index: 3 },
  { value: '#FFE270', name: 'Light_yellow_x', index: 3 },
  { value: '#D58EFF', name: 'Light_purple_x', index: 3 },

  { value: '#A5A5A5', name: 'Light_grey_x', index: 4 },
  { value: '#262626', name: 'Dark_grey_x', index: 4 },
  { value: '#353B45', name: 'Dark_blue_grey_x', index: 1 },
  { value: '#1450B8', name: 'Dark_blue_x', index: 1 },
  { value: '#1274A5', name: 'Dark_sky_blue_x', index: 1 },
  { value: '#277C4F', name: 'Dark_green_x', index: 1 },
  { value: '#9E1E1A', name: 'Dark_red_x', index: 1 },
  { value: '#B86014', name: 'Dark_orange_x', index: 1 },
  { value: '#A38200', name: 'Dark_yellow_x', index: 1 },
  { value: '#5E2281', name: 'Dark_purple_x', index: 1 },

  { value: '#939393', name: 'Light_grey_x', index: 5 },
  { value: '#0D0D0D', name: 'Dark_grey_x', index: 5 },
  { value: '#24272E', name: 'Dark_blue_grey_x', index: 2 },
  { value: '#0C306E', name: 'Dark_blue_x', index: 2 },
  { value: '#0A415C', name: 'Dark_sky_blue_x', index: 2 },
  { value: '#184E32', name: 'Dark_green_x', index: 2 },
  { value: '#58110E', name: 'Dark_red_x', index: 2 },
  { value: '#5C300A', name: 'Dark_orange_x', index: 2 },
  { value: '#665200', name: 'Dark_yellow_x', index: 2 },
  { value: '#3b1551', name: 'Dark_purple_x', index: 2 },

];

export const STANDARD_COLORS = [
  { value: '#C00000', name: 'Standard_dark_red' },
  { value: '#FF0000', name: 'Standard_red' },
  { value: '#FFC000', name: 'Standard_orange' },
  { value: '#FFFF00', name: 'Standard_yellow' },
  { value: '#92D050', name: 'Standard_light_green' },
  { value: '#00B050', name: 'Standard_green' },
  { value: '#00B0F0', name: 'Standard_light_blue' },
  { value: '#0070C0', name: 'Standard_blue' },
  { value: '#002060', name: 'Standard_dark_blue' },
  { value: '#7030A0', name: 'Standard_purple' },
];

// Initialize the most recently used colors
export const DEFAULT_RECENT_USED_LIST = new Array(10).fill('');

export const DEFAULT_FONT_COLOR = '#333333';

// default last used color
export const DEFAULT_LAST_USED_FONT_COLOR = '#FFFF00';
export const DEFAULT_LAST_USED_HIGHLIGHT_COLOR = '#FF0000';
export const DEFAULT_LAST_USED_TABLE_CELL_BACKGROUND_COLOR = '#FF0000';

// recent used colors key
export const RECENT_USED_HIGHLIGHT_COLORS_KEY = 'sdoc-recent-used-highlight-colors';
export const RECENT_USED_FONT_COLORS_KEY = 'sdoc-recent-used-font-colors';
export const RECENT_USED_TABLE_CELL_BACKGROUND_COLORS_KEY = 'sdoc-recent-used-bg-colors';

