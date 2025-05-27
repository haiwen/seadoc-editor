import { Editor, Transforms, Range } from '@seafile/slate';
import { COMMENT_EDITOR } from '../../../constants';
import { HEADER1, HEADER2, HEADER3, HEADER4, HEADER5, HEADER6, UNORDERED_LIST, BLOCKQUOTE, TEXT_STYLE_MAP, PARAGRAPH } from '../../constants';
import { getSelectedNodeByType } from '../../core';
import { setBlockQuoteType } from '../blockquote/helpers';
import { toggleList } from '../list/transforms';

// Title shortcut
const TITLE_SHORT_CUT = {
  '#': HEADER1,
  '##': HEADER2,
  '###': HEADER3,
  '####': HEADER4,
  '#####': HEADER5,
  '######': HEADER6,
};

// List shortcut
const LIST_SHORT_CUT = {
  '*': UNORDERED_LIST,
  '-': UNORDERED_LIST,
};

// Reference shortcut key
const REFERENCE_SHORT_CUT = {
  '>': BLOCKQUOTE
};

const KEY_TO_TYPE_FOR_SPACE_DEFAULT_EDITOR = {
  ...TITLE_SHORT_CUT,
  ...LIST_SHORT_CUT,
  ...REFERENCE_SHORT_CUT
};

const KEY_TO_TYPE_FOR_SPACE_COMMENT_EDITOR = {
  ...LIST_SHORT_CUT,
};

const KEY_TO_INLINE_TYPE_FOR_SPACE = {
  // Inline shortcut keys
  '**': TEXT_STYLE_MAP.BOLD,
  '*': TEXT_STYLE_MAP.ITALIC,
  '***': TEXT_STYLE_MAP.BOLD_ITALIC,
};

const getBeforeText = (editor) => {
  const { selection } = editor;
  if (selection == null) return { beforeText: '', range: null };
  const { anchor, focus } = selection;
  const lastIndex = focus.path[focus.path.length - 1];
  if (lastIndex !== 0) return { beforeText: '', range: null };
  const range = {
    anchor,
    focus: {
      path: focus.path,
      offset: 0,
    }
  };
  const beforeText = Editor.string(editor, range) || '';
  return { beforeText, range };
};

const withMarkDown = (editor) => {
  const { insertText } = editor;
  const newEditor = editor;
  const KEY_TO_TYPE_FOR_SPACE = newEditor.editorType === COMMENT_EDITOR ? KEY_TO_TYPE_FOR_SPACE_COMMENT_EDITOR : KEY_TO_TYPE_FOR_SPACE_DEFAULT_EDITOR;

  // When entering a space, convert markdown
  newEditor.insertText = text => {
    const { selection } = editor;
    if (selection == null) return insertText(text);
    if (Range.isExpanded(selection)) return insertText(text);
    if (getSelectedNodeByType(editor, PARAGRAPH) == null) return insertText(text); // It must be in paragraph
    if (text !== ' ') return insertText(text); // The value must be an input space

    // Gets the text before the space
    const { beforeText, range } = getBeforeText(editor);
    if (!beforeText || !range) return insertText(text);

    // Based on the keyword, find the type of element you want to convert
    const type = KEY_TO_TYPE_FOR_SPACE[beforeText.trim()];
    const italicAndBoldType = KEY_TO_INLINE_TYPE_FOR_SPACE[beforeText.slice(-3)];
    const boldType = KEY_TO_INLINE_TYPE_FOR_SPACE[beforeText.slice(-2)];
    const italicType = KEY_TO_INLINE_TYPE_FOR_SPACE[beforeText.slice(-1)];
    if (!type && !boldType && !italicType && !italicAndBoldType) return insertText(text);

    if (italicAndBoldType === TEXT_STYLE_MAP.BOLD_ITALIC) {
      const restStr = beforeText?.slice(0, beforeText.length - 3);
      const startOffset = restStr?.lastIndexOf('***');
      const endOffset = beforeText?.lastIndexOf('***') + 3;

      if (startOffset !== -3) {
        Transforms.delete(editor, {
          at: {
            anchor: {
              path: range.focus.path,
              offset: startOffset
            },
            focus: { ...selection.focus }
          },
          voids: true
        });

        const newText = beforeText.slice(startOffset + 3, endOffset - 3);
        Editor.addMark(editor, TEXT_STYLE_MAP.BOLD, true);
        Editor.addMark(editor, TEXT_STYLE_MAP.ITALIC, true);
        return insertText(newText);
      }
    }

    if (boldType === TEXT_STYLE_MAP.BOLD) {
      const restStr = beforeText.slice(0, beforeText.length - 2);
      const startOffset = restStr.lastIndexOf('**');
      const endOffset = beforeText.lastIndexOf('**') + 2;

      if (startOffset === -1) {
        return insertText(text);
      }

      Transforms.delete(editor, {
        at: {
          anchor: {
            path: range.focus.path,
            offset: startOffset
          },
          focus: { ...selection.focus }
        },
        voids: true
      });

      const newType = boldType.toLowerCase();
      const newText = beforeText.slice(startOffset + 2, endOffset - 2);
      Editor.addMark(editor, newType, true);
      return insertText(newText);
    }

    // demos
    // 1 '*'
    // 2 'acd * add *'
    if (italicType === TEXT_STYLE_MAP.ITALIC) {
      const restStr = beforeText?.slice(0, beforeText.length - 1);
      const startOffset = restStr?.lastIndexOf('*');
      const endOffset = beforeText?.lastIndexOf('*') + 1;

      if (startOffset === -1 && restStr.length > 0) {
        return insertText(text);
      }

      if (startOffset !== -1) {
        Transforms.delete(editor, {
          at: {
            anchor: {
              path: range.focus.path,
              offset: startOffset
            },
            focus: { ...selection.focus }
          },
          voids: true
        });

        const newType = italicType.toLowerCase();
        const newText = beforeText.slice(startOffset + 1, endOffset - 1);
        Editor.addMark(editor, newType, true);
        return insertText(newText);
      }
    }

    // Delete element
    Transforms.select(editor, range);
    Transforms.delete(editor);

    if (type === UNORDERED_LIST) {
      toggleList(editor, type, null, false);
      return;
    }

    if (type === BLOCKQUOTE) {
      setBlockQuoteType(editor, false);
      return;
    }

    Transforms.setNodes(editor, { type });
  };

  return newEditor;
};

export default withMarkDown;
