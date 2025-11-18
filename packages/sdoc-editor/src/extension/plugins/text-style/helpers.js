import { Editor, Range } from '@seafile/slate';
import { CODE_BLOCK, LINK } from '../../constants/element-type';
import { TEXT_STYLE_MAP } from '../../constants/menus-config';
import { getNodeType } from '../../core';
import { isLinkToolBarActive } from '../link/helpers';

export const isMenuDisabled = (editor, readonly) => {
  if (readonly) return true;
  if (editor.selection == null) return true;

  const [match] = Editor.nodes(editor, {
    match: n => {
      const type = getNodeType(n);

      if (type === CODE_BLOCK) return true; // Code block
      // TODO: seatable_column
      if (Editor.isVoid(editor, n) && n?.type !== 'seatable_column') return true; // void node

      return false;
    },
    universal: true,
  });

  // If yes, it is disabled
  if (match) return true;
  return false;
};

export const addMark = (editor, type) => {
  if (type === TEXT_STYLE_MAP.SUPERSCRIPT) {
    removeMark(editor, TEXT_STYLE_MAP.SUBSCRIPT);
  } else if (type === TEXT_STYLE_MAP.SUBSCRIPT) {
    removeMark(editor, TEXT_STYLE_MAP.SUPERSCRIPT);
  }
  Editor.addMark(editor, type, true);
};

export const removeMark = (editor, type) => {
  Editor.removeMark(editor, type);
};

// Whether mark is included
export const getValue = (editor, mark) => {
  if (mark === LINK && editor.selection && !Range.isCollapsed(editor.selection)) {
    return isLinkToolBarActive(editor);
  }
  const curMarks = Editor.marks(editor);

  // If curMarks exists, you need to set this parameter manually. curMarks prevails
  if (curMarks) {
    return curMarks[mark];
  } else {
    const [match] = Editor.nodes(editor, {
      match: n => n[mark] === true,
    });
    return !!match;
  }
};

export const isTextCommentExist = (commentClass, editor) => {
  if (!commentClass) return null;
  if (!editor.element_comments_map) return null;
  const commentId = commentClass.split('sdoc_comment_')[1];
  if (!commentId) return null;
  const { element_comments_map } = editor;
  const commentsArray = Object.values(element_comments_map);
  const comments = commentsArray.flat();
  const comment = comments.find(item => {
    const id = item.detail.text_comment_id || '';
    if (id === commentId) return true;
    return false;
  });
  return comment ? true : false;
};
