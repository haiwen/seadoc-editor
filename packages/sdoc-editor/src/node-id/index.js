import { Editor, Range, Text } from '@seafile/slate';
import slugid from 'slugid';
import { CLIPBOARD_CUT_COMMENT_KEY, CLIPBOARD_FORMAT_KEY, RECENT_COPY_CONTENT } from '../extension/constants';
import { getSlateFragmentAttribute, normalizeCopyNodes } from '../utils/document-utils';
import LocalStorage from '../utils/local-storage-utils';
import { consumePastedCommentKeys, decorateOperation, getFullyCutCommentKeys, getPastedCommentKeys, removeCommentMarks, removeEmptyCommentMarks, replacePastedDataId } from './helpers';


const withNodeId = (editor) => {
  const { apply, insertText, setFragmentData, deleteFragment } = editor;
  const newEditor = editor;

  newEditor.apply = (op) => {
    const newOp = decorateOperation(newEditor, op);
    apply(newOp);
  };

  newEditor.insertText = (text) => {
    const { selection } = editor;
    // Remove context comment marks when inserting position has comment before selection and no comment after selection
    if (selection && Range.isCollapsed(selection)) {
      const beforePoint = Editor.before(editor, selection.focus, { unit: 'character' });
      const afterPoint = Editor.after(editor, selection.focus, { unit: 'character' });

      const beforeText = beforePoint && Editor.node(editor, beforePoint);
      const afterText = afterPoint && Editor.node(editor, afterPoint);

      const hasCommentBefore =
        beforeText &&
        Text.isText(beforeText[0]) &&
        Object.keys(beforeText[0]).some((k) => k.includes('sdoc_comment'));

      const hasCommentAfter =
        afterText &&
        Text.isText(afterText[0]) &&
        Object.keys(afterText[0]).some((k) => k.includes('sdoc_comment'));

      const hasTrueCommentAfter =
        afterText &&
        Text.isText(afterText[0]) &&
        Object.keys(afterText[0]).filter((k) => k.includes('sdoc_comment')).some(k => afterText[0][k]);

      if (hasCommentBefore && (!hasCommentAfter || !hasTrueCommentAfter)) {
        const marks = Editor.marks(editor);
        if (marks) {
          for (const key of Object.keys(marks)) {
            if (key.includes('sdoc_comment')) {
              Editor.removeMark(editor, key);
            }
          }
        }
      }
    }

    insertText(text);
  };

  newEditor.setFragmentData = (data, originEvent) => {
    const commentKeys = originEvent === 'cut' ? getFullyCutCommentKeys(editor) : null;
    setFragmentData(data, originEvent);
    if (commentKeys) {
      data.setData(`application/${CLIPBOARD_CUT_COMMENT_KEY}`, JSON.stringify({ id: slugid.nice(), commentKeys }));
    }
  };

  newEditor.deleteFragment = (direction) => {
    const result = deleteFragment(direction);
    removeEmptyCommentMarks(newEditor);
    return result;
  };

  // rewrite insert fragment data
  newEditor.insertFragmentData = (data) => {
    const fragment = data.getData(`application/${CLIPBOARD_FORMAT_KEY}`) || getSlateFragmentAttribute(data);

    if (fragment) {
      const decoded = decodeURIComponent(window.atob(fragment));
      const parsed = JSON.parse(decoded);

      // Clean context comment style when pasting commented context
      const cleaned = removeCommentMarks(parsed, getPastedCommentKeys(data));

      const newData = replacePastedDataId(cleaned);
      const normalizeNewData = normalizeCopyNodes(newEditor, newData);

      LocalStorage.setItem(RECENT_COPY_CONTENT, normalizeNewData);

      const previousChildren = newEditor.children;
      newEditor.insertFragment(normalizeNewData);
      consumePastedCommentKeys(data, newEditor, previousChildren);
      return newEditor;
    }
  };

  return newEditor;

};

export default withNodeId;
