import { Editor, Element } from '@seafile/slate';
import context from '../../../context';
import { isMac } from '../../../utils/common-utils';
import { CODE_BLOCK, IMAGE, DEFAULT_FONT,
  GOOGLE_FONT_CLASS, FONT, SDOC_FONT_SIZE, HEADERS, TITLE, SUBTITLE, CODE_LINE, TEXT_STYLE_MAP } from '../../constants';
import { focusEditor, getParentNode, isRangeAcrossBlocks } from '../../core';

export const isMenuDisabled = (editor, readonly) => {
  if (readonly) return true;
  if (!editor.selection) return true;

  const [match] = Editor.nodes(editor, {
    match: node => {
      return !Editor.isEditor(node) && Element.isElement(node) && Editor.isBlock(editor, node);
    },
    universal: true,
    mode: 'highest'
  });

  if (!match) return false;

  const elementType = match[0].type;
  if (elementType === CODE_BLOCK || elementType === IMAGE) {
    return true;
  }
  return false;
};

// font size
export const getFontSize = (editor) => {
  const { selection } = editor;
  const marks = Editor.marks(editor);
  if (marks && marks[TEXT_STYLE_MAP.FONT_SIZE]) {
    return marks[TEXT_STYLE_MAP.FONT_SIZE];
  }

  if (!selection) return SDOC_FONT_SIZE.DEFAULT;

  if (isRangeAcrossBlocks(editor)) return SDOC_FONT_SIZE.DEFAULT;

  const [match] = Editor.nodes(editor, {
    at: Editor.unhangRange(editor, selection),
    match: n => {
      if (!Editor.isEditor(n) && !Element.isElement(n)) {
        if (n[TEXT_STYLE_MAP.FONT_SIZE]) return true;
        const parentNode = getParentNode(editor.children, n.id);
        if (!parentNode) return false;
        if ([TITLE, SUBTITLE, ...HEADERS, CODE_LINE].includes(parentNode.type)) {
          return true;
        }
        return false;
      }
      if (!Editor.isEditor(n) && Editor.isVoid(editor, n)) {
        const parentNode = getParentNode(editor.children, n.id);
        if (!parentNode) return false;
        if ([TITLE, SUBTITLE, ...HEADERS, CODE_LINE].includes(parentNode.type)) {
          return true;
        }
      }
      return false;
    }
  });

  if (!match) return SDOC_FONT_SIZE.DEFAULT;
  // has font-size attribute
  const matched = match[0];
  if (matched[TEXT_STYLE_MAP.FONT_SIZE]) {
    return matched[TEXT_STYLE_MAP.FONT_SIZE];
  }

  const parentNode = getParentNode(editor.children, matched.id);
  return SDOC_FONT_SIZE[parentNode.type];

};

export const setFontSize = (editor, value) => {
  Editor.addMark(editor, TEXT_STYLE_MAP.FONT_SIZE, value);
  focusEditor(editor);
};

export const scaleFontSize = (editor, type) => {
  const isDisabled = isMenuDisabled(editor);
  if (isDisabled) return;

  const fontSize = getFontSize(editor);
  let fontSizeValue = fontSize;
  if (type === 'increase') {
    fontSizeValue = fontSizeValue + 1;
  }

  if (type === 'reduce') {
    fontSizeValue = fontSizeValue - 1;
    if (fontSizeValue < 1) return;
  }

  setFontSize(editor, fontSizeValue);
};

// font
export const getFont = (editor) => {
  const { selection } = editor;
  const marks = Editor.marks(editor);
  if (marks && marks[TEXT_STYLE_MAP.FONT]) {
    return marks[TEXT_STYLE_MAP.FONT];
  }

  if (!selection) return DEFAULT_FONT;

  if (isRangeAcrossBlocks(editor, { at: selection })) return DEFAULT_FONT;

  const [match] = Editor.nodes(editor, {
    at: Editor.unhangRange(editor, selection),
    match: n => !Editor.isEditor(n) && !Element.isElement(n) && n['font']
  });

  if (!match) return DEFAULT_FONT;
  return match[0][TEXT_STYLE_MAP.FONT];
};

export const setFont = (editor, value) => {
  Editor.addMark(editor, TEXT_STYLE_MAP.FONT, value);
  focusEditor(editor);
};

export const hasFontLoaded = (fontObject = {}, fontWeight) => {
  const { name, isSystemOwn } = fontObject;
  if (isSystemOwn) return true;
  if (!name) return true;
  const nameString = name.split(' ').join('+');
  const fontLinkId = `sdoc-font-link-${nameString}-${fontWeight}`;
  return document.getElementById(fontLinkId);
};

export const loadFont = (fontObject = {}, fontWeight = 400) => {
  const { name, isSystemOwn, supportFontWeight = [] } = fontObject;
  if (isSystemOwn) return;
  if (!name) return;

  const validFontWeight = supportFontWeight.includes(fontWeight) ? fontWeight : supportFontWeight[0];
  const nameString = name.split(' ').join('+');
  const fontLinkId = `sdoc-font-link-${nameString}-${validFontWeight}`;
  if (document.getElementById(fontLinkId)) return;
  const href = `https://fonts.googleapis.com/css?family=${nameString}:${validFontWeight}`;
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = href;
  fontLink.id = fontLinkId;
  fontLink.className = GOOGLE_FONT_CLASS;
  document.body.appendChild(fontLink);
};

export const generatorFontFamily = (fontName, fontWeight) => {
  const lang = context.getSetting('lang') || 'zh-cn';
  if (fontName === DEFAULT_FONT) {
    return `'Arial', ${lang === 'zh-cn' ? '\u5b8b\u4f53' : 'Arial'}, 'sans-serif'`;
  }

  const fontObject = FONT.find(item => item.name === fontName) || {};
  const { usuallyFontFamilyName, fontFamilyName } = fontObject;
  loadFont(fontObject, fontWeight);
  const validFontName = fontFamilyName && isMac() ? fontFamilyName['mac'] : fontName;

  return `${validFontName}, ${lang === 'zh-cn' ? '\u5b8b\u4f53' : 'Arial'}, ${usuallyFontFamilyName || 'sans-serif'}`;
};
