import * as ELEMENT_TYPE from './element-type';

// font family
const SERIF = 'serif';
const SANS_SERIF = 'sans-serif';
const CURSIVE = 'cursive';
const MONOSPACE = 'monospace';

// font weight
const FONT_WEIGHT = [100, 200, 300, 400, 500, 600, 700, 800, 900];

const FONT_WEIGHT_100_TO_700 = [100, 200, 300, 400, 500, 600, 700];
// const FONT_WEIGHT_100_TO_800 = [100, 200, 300, 400, 500, 600, 700, 800];

const FONT_WEIGHT_200_TO_700 = [200, 300, 400, 500, 600, 700];
const FONT_WEIGHT_200_TO_800 = [200, 300, 400, 500, 600, 700, 800];
const FONT_WEIGHT_200_TO_900 = [200, 300, 400, 500, 600, 700, 800, 900];

const FONT_WEIGHT_300_TO_700 = [300, 400, 500, 600, 700];
const FONT_WEIGHT_300_TO_800 = [300, 400, 500, 600, 700, 800];
const FONT_WEIGHT_300_TO_900 = [300, 400, 500, 600, 700, 800, 900];

const FONT_WEIGHT_400_TO_700 = [400, 500, 600, 700];
const FONT_WEIGHT_400_TO_800 = [400, 500, 600, 700, 800];
const FONT_WEIGHT_400_TO_900 = [400, 500, 600, 700, 800, 900];

// 400 and odd
const FONT_WEIGHT_400_AND_ODD = [100, 300, 400, 500, 700, 900];

// system font weight
const FONT_WEIGHT_400_700 = [400, 700];
const FONT_WEIGHT_100_400_700 = [100, 400, 700];
const FONT_WEIGHT_100_400_700_800 = [100, 400, 700, 800];

export const FONT_SIZE = [
  { name: '9', value: 9 },
  { name: '10', value: 10 },
  { name: '11', value: 11 },
  { name: '12', value: 12 },
  { name: '14', value: 14 },
  { name: '16', value: 16 },
  { name: '18', value: 18 },
  { name: '20', value: 20 },
  { name: '22', value: 22 },
  { name: '24', value: 24 },
  { name: '26', value: 26 },
  { name: '28', value: 28 },
  { name: '36', value: 36 },
  { name: '42', value: 42 },
  { name: '48', value: 48 },
  { name: '72', value: 72 },
];

export const GOOGLE_FONT_CLASS = 'sdoc-google-font';

export const DEFAULT_FONT = 'default_font';

export const RECENT_USED_FONTS_KEY = 'sdoc-recent-used-fonts';

export const FONT = [
  // { name: '\u5fae\u8f6f\u96c5\u9ed1', fontFamilyName: { mac: 'Microsoft YaHei', windows: '\u5fae\u8f6f\u96c5\u9ed1' }, supportFontWeight: FONT_WEIGHT_100_400_700, isSystemOwn: true, usuallyFontFamilyName: SANS_SERIF }, // 微软雅黑
  // { name: '\u5b8b\u4f53', fontFamilyName: { mac: 'SimSun', windows: '\u5b8b\u4f53' }, supportFontWeight: FONT_WEIGHT_100_400_700_800, isSystemOwn: true, usuallyFontFamilyName: SERIF }, // 宋体
  // { name: '\u9ed1\u4f53', fontFamilyName: { mac: 'SimHei', windows: '\u9ed1\u4f53' }, supportFontWeight: [300, 500], isSystemOwn: true, usuallyFontFamilyName: SANS_SERIF }, // 黑体
  // { name: '\u6977\u4f53', fontFamilyName: { mac: 'KaiTi', windows: '\u6977\u4f53' }, supportFontWeight: [400, 700, 800], isSystemOwn: true }, // 楷体
  // { name: 'Arial', supportFontWeight: FONT_WEIGHT_400_700, isSystemOwn: true, usuallyFontFamilyName: SANS_SERIF, isDuplicate: true },
  // { name: 'Helvetica', supportFontWeight: FONT_WEIGHT_400_700, isSystemOwn: true, usuallyFontFamilyName: SANS_SERIF, isDuplicate: true },
  // { name: 'Times New Roman', supportFontWeight: FONT_WEIGHT_400_700, isSystemOwn: true, usuallyFontFamilyName: SERIF, isDuplicate: true },
  // { disabled: true, type: 'divide' },
  { name: DEFAULT_FONT, supportFontWeight: FONT_WEIGHT_400_700, isSystemOwn: true, usuallyFontFamilyName: SANS_SERIF, isDefault: true, langOrder: { 'zh-cn': 2 } },
  { name: 'Arial', supportFontWeight: FONT_WEIGHT_400_700, isSystemOwn: true, usuallyFontFamilyName: SANS_SERIF },
  { name: 'Arimo', supportFontWeight: FONT_WEIGHT_400_TO_700, usuallyFontFamilyName: SANS_SERIF },
  { name: 'Assistant', supportFontWeight: FONT_WEIGHT_200_TO_800, usuallyFontFamilyName: SANS_SERIF },
  { name: 'Bitter', supportFontWeight: FONT_WEIGHT, usuallyFontFamilyName: SERIF },
  { name: 'Cabin', supportFontWeight: FONT_WEIGHT_400_TO_700, usuallyFontFamilyName: SANS_SERIF },
  { name: 'Catamaran', supportFontWeight: FONT_WEIGHT, usuallyFontFamilyName: SANS_SERIF },
  { name: 'Caveat', supportFontWeight: FONT_WEIGHT_400_TO_700, usuallyFontFamilyName: CURSIVE },
  { name: 'Cinzel', supportFontWeight: FONT_WEIGHT_400_TO_900, usuallyFontFamilyName: SERIF },
  { name: 'Changa', supportFontWeight: FONT_WEIGHT_200_TO_800, usuallyFontFamilyName: SANS_SERIF },
  { name: 'Comfortaa', supportFontWeight: FONT_WEIGHT_300_TO_700, usuallyFontFamilyName: CURSIVE },
  { name: 'Comic Sans MS', supportFontWeight: FONT_WEIGHT_400_700, isSystemOwn: true, usuallyFontFamilyName: SERIF },
  { name: 'Crimson Text', supportFontWeight: FONT_WEIGHT_300_TO_900, usuallyFontFamilyName: SERIF },
  { name: 'Cuprum', supportFontWeight: FONT_WEIGHT_400_TO_700, usuallyFontFamilyName: SANS_SERIF },
  { name: 'Dancing Script', supportFontWeight: FONT_WEIGHT_400_TO_700, usuallyFontFamilyName: CURSIVE },
  { name: 'Domine', supportFontWeight: FONT_WEIGHT_400_TO_700, usuallyFontFamilyName: SERIF },
  { name: 'Dosis', supportFontWeight: FONT_WEIGHT_200_TO_800, usuallyFontFamilyName: SANS_SERIF },
  { name: 'EB Garamond', supportFontWeight: FONT_WEIGHT_400_TO_800, usuallyFontFamilyName: SERIF },
  { name: 'Encode Sans', supportFontWeight: FONT_WEIGHT, usuallyFontFamilyName: SANS_SERIF },
  { name: 'Exo', supportFontWeight: FONT_WEIGHT, usuallyFontFamilyName: SANS_SERIF },
  { name: 'Exo 2', supportFontWeight: FONT_WEIGHT, usuallyFontFamilyName: SANS_SERIF },
  { name: 'Faustina', supportFontWeight: FONT_WEIGHT_400_TO_700, usuallyFontFamilyName: SERIF },
  { name: 'Garamond', supportFontWeight: FONT_WEIGHT_400_700, isSystemOwn: true, usuallyFontFamilyName: SERIF },
  { name: 'Georgia', supportFontWeight: FONT_WEIGHT_400_700, isSystemOwn: true, usuallyFontFamilyName: SERIF },
  { name: 'Heebo', supportFontWeight: FONT_WEIGHT, usuallyFontFamilyName: SANS_SERIF },
  { name: 'Helvetica', supportFontWeight: FONT_WEIGHT_400_700, isSystemOwn: true, usuallyFontFamilyName: SANS_SERIF },
  { name: 'Inconsolata', supportFontWeight: FONT_WEIGHT_200_TO_900, usuallyFontFamilyName: MONOSPACE },
  { name: 'Inter', supportFontWeight: FONT_WEIGHT, usuallyFontFamilyName: SANS_SERIF },
  { name: 'Karla', supportFontWeight: FONT_WEIGHT_200_TO_800, usuallyFontFamilyName: SANS_SERIF },
  { name: 'Kreon', supportFontWeight: FONT_WEIGHT_300_TO_700, usuallyFontFamilyName: SERIF },
  { name: 'Lemonada', supportFontWeight: FONT_WEIGHT_300_TO_700, usuallyFontFamilyName: CURSIVE },
  { name: 'Libre Franklin', supportFontWeight: FONT_WEIGHT, usuallyFontFamilyName: SANS_SERIF },
  { name: 'Liu Jian Mao Cao', supportFontWeight: [400], usuallyFontFamilyName: SANS_SERIF, langOrder: { 'zh-cn': 0 } }, // Simplified Chinese
  { name: 'Long Cang', supportFontWeight: [400], usuallyFontFamilyName: SANS_SERIF, langOrder: { 'zh-cn': 0 } }, // Simplified Chinese
  { name: 'Lora', supportFontWeight: FONT_WEIGHT_400_TO_700, usuallyFontFamilyName: SERIF },
  { name: 'Lucida Family', supportFontWeight: FONT_WEIGHT_400_700, isSystemOwn: true, usuallyFontFamilyName: SERIF },
  { name: 'Josefin Sans', supportFontWeight: FONT_WEIGHT_100_TO_700, usuallyFontFamilyName: SANS_SERIF },
  { name: 'Josefin Slab', supportFontWeight: FONT_WEIGHT_100_TO_700, usuallyFontFamilyName: SERIF },
  { name: 'Jura', supportFontWeight: FONT_WEIGHT_300_TO_700, usuallyFontFamilyName: SANS_SERIF },
  { name: 'Manuale', supportFontWeight: FONT_WEIGHT_400_TO_700, usuallyFontFamilyName: SERIF },
  { name: 'Markazi Text', supportFontWeight: FONT_WEIGHT_400_TO_700, usuallyFontFamilyName: SERIF },
  { name: 'Maven Pro', supportFontWeight: FONT_WEIGHT_400_TO_900, usuallyFontFamilyName: SANS_SERIF },
  { name: 'Ma Shan Zheng', supportFontWeight: [400], usuallyFontFamilyName: SANS_SERIF, langOrder: { 'zh-cn': 0 } }, // Simplified Chinese
  { name: 'Merriweather Sans', supportFontWeight: FONT_WEIGHT_300_TO_800, usuallyFontFamilyName: SANS_SERIF, langOrder: { 'zh-cn': 0 } },
  { name: 'Noto Sans HK', supportFontWeight: FONT_WEIGHT_400_AND_ODD, usuallyFontFamilyName: SANS_SERIF, langOrder: { 'zh-cn': 0 } }, // Chinese Hong Kong
  { name: 'Noto Sans SC', supportFontWeight: FONT_WEIGHT_400_AND_ODD, usuallyFontFamilyName: SANS_SERIF, langOrder: { 'zh-cn': 0 } }, // Simplified Chinese
  { name: 'Noto Sans TC', supportFontWeight: FONT_WEIGHT_400_AND_ODD, usuallyFontFamilyName: SANS_SERIF, langOrder: { 'zh-cn': 0 } }, // traditional Chinese
  { name: 'Noto Serif SC', supportFontWeight: [200, 300, 400, 500, 600, 700, 900], usuallyFontFamilyName: SERIF, langOrder: { 'zh-cn': 0 } }, // Simplified Chinese
  { name: 'Noto Serif TC', supportFontWeight: [200, 300, 400, 500, 600, 700, 900], usuallyFontFamilyName: SERIF, langOrder: { 'zh-cn': 0 } }, // traditional Chinese
  { name: 'Orbitron', supportFontWeight: FONT_WEIGHT_400_TO_900, usuallyFontFamilyName: SANS_SERIF },
  { name: 'Oswald', supportFontWeight: FONT_WEIGHT_200_TO_700, usuallyFontFamilyName: SANS_SERIF },
  { name: 'Petrona', supportFontWeight: FONT_WEIGHT, usuallyFontFamilyName: SERIF },
  { name: 'Playfair Display', supportFontWeight: FONT_WEIGHT_400_TO_900, usuallyFontFamilyName: SERIF },
  { name: 'Podkova', supportFontWeight: FONT_WEIGHT_400_TO_800, usuallyFontFamilyName: SERIF },
  { name: 'Quicksand', supportFontWeight: FONT_WEIGHT_300_TO_700, usuallyFontFamilyName: SANS_SERIF },
  { name: 'Raleway', supportFontWeight: FONT_WEIGHT, usuallyFontFamilyName: SANS_SERIF },
  { name: 'Roboto Mono', supportFontWeight: FONT_WEIGHT_400_TO_900, usuallyFontFamilyName: MONOSPACE },
  { name: 'Roboto Slab', supportFontWeight: FONT_WEIGHT, usuallyFontFamilyName: SERIF },
  { name: 'Rokkitt', supportFontWeight: FONT_WEIGHT, usuallyFontFamilyName: SERIF },
  { name: 'Rosario', supportFontWeight: FONT_WEIGHT_300_TO_700, usuallyFontFamilyName: SANS_SERIF },
  { name: 'Rubik', supportFontWeight: FONT_WEIGHT_300_TO_900, usuallyFontFamilyName: SANS_SERIF },
  { name: 'Ruda', supportFontWeight: FONT_WEIGHT_400_TO_900, usuallyFontFamilyName: SANS_SERIF },
  { name: 'Saira', supportFontWeight: FONT_WEIGHT, usuallyFontFamilyName: SANS_SERIF },
  { name: 'Signika', supportFontWeight: FONT_WEIGHT_300_TO_700, usuallyFontFamilyName: SANS_SERIF },
  { name: 'Tahoma', supportFontWeight: FONT_WEIGHT_400_700, isSystemOwn: true, usuallyFontFamilyName: SERIF },
  { name: 'Times New Roman', supportFontWeight: FONT_WEIGHT_400_700, isSystemOwn: true, usuallyFontFamilyName: SERIF },
  { name: 'Verdana', supportFontWeight: FONT_WEIGHT_400_700, isSystemOwn: true, usuallyFontFamilyName: SERIF },
  { name: 'Vollkorn', supportFontWeight: FONT_WEIGHT_400_TO_900, usuallyFontFamilyName: SERIF },
  { name: 'Work Sans', supportFontWeight: FONT_WEIGHT, usuallyFontFamilyName: SANS_SERIF },
  { name: 'Yanone Kaffeesatz', supportFontWeight: FONT_WEIGHT_200_TO_700, usuallyFontFamilyName: SANS_SERIF },
  { name: 'ZCOOL KuaiLe', supportFontWeight: [400], usuallyFontFamilyName: SANS_SERIF, langOrder: { 'zh-cn': 0 } }, // Simplified Chinese
  { name: 'ZCOOL QingKe HuangYou', supportFontWeight: [400], usuallyFontFamilyName: SANS_SERIF, langOrder: { 'zh-cn': 0 } }, // Simplified Chinese
  { name: 'ZCOOL XiaoWei', supportFontWeight: [400], usuallyFontFamilyName: SANS_SERIF, langOrder: { 'zh-cn': 0 } }, // Simplified Chinese
  { name: 'Zhi Mang Xing', supportFontWeight: [400], usuallyFontFamilyName: SANS_SERIF, langOrder: { 'zh-cn': 0 } }, // Simplified Chinese
  { name: '\u5fae\u8f6f\u96c5\u9ed1', fontFamilyName: { mac: 'Microsoft YaHei', windows: '\u5fae\u8f6f\u96c5\u9ed1' }, supportFontWeight: FONT_WEIGHT_100_400_700, isSystemOwn: true, usuallyFontFamilyName: SANS_SERIF, langOrder: { 'zh-cn': 1 } }, // 微软雅黑
  { name: '\u5b8b\u4f53', fontFamilyName: { mac: 'SimSun', windows: '\u5b8b\u4f53' }, supportFontWeight: FONT_WEIGHT_100_400_700_800, isSystemOwn: true, usuallyFontFamilyName: SERIF, langOrder: { 'zh-cn': 1 } }, // 宋体
  { name: '\u9ed1\u4f53', fontFamilyName: { mac: 'SimHei', windows: '\u9ed1\u4f53' }, supportFontWeight: [300, 500], isSystemOwn: true, usuallyFontFamilyName: SANS_SERIF, langOrder: { 'zh-cn': 1 } }, // 黑体
  { name: '\u6977\u4f53', fontFamilyName: { mac: 'KaiTi', windows: '\u6977\u4f53' }, supportFontWeight: [400, 700, 800], isSystemOwn: true, langOrder: { 'zh-cn': 1 } }, // 楷体
];

export const SDOC_FONT_SIZE = {
  DEFAULT: 11,
  [ELEMENT_TYPE.TITLE]: 26,
  [ELEMENT_TYPE.SUBTITLE]: 15,
  [ELEMENT_TYPE.HEADER1]: 20,
  [ELEMENT_TYPE.HEADER2]: 16,
  [ELEMENT_TYPE.HEADER3]: 14,
  [ELEMENT_TYPE.HEADER4]: 12,
  [ELEMENT_TYPE.HEADER5]: 11,
  [ELEMENT_TYPE.HEADER6]: 11,
  [ELEMENT_TYPE.CODE_LINE]: 10,
};
