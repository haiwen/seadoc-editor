import { Editor, Range, Text } from '@seafile/slate';
import { CLIPBOARD_FORMAT_KEY } from '../extension/constants';
import { getSlateFragmentAttribute, normalizeCopyNodes } from '../utils/document-utils';
import { decorateOperation, removeCommentMarks, replacePastedDataId } from './helpers';


const withNodeId = (editor) => {
  const { apply, insertText } = editor;
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

  // rewrite insert fragment data
  newEditor.insertFragmentData = (data) => {
    const fragment = data.getData(`application/${CLIPBOARD_FORMAT_KEY}`) || getSlateFragmentAttribute(data);

    if (fragment) {
      const decoded = decodeURIComponent(window.atob(fragment));
      const parsed = JSON.parse(decoded);

      // Clean context comment style when pasting commented context
      const cleaned = removeCommentMarks(parsed);

      const newData = replacePastedDataId(cleaned);
      const normalizeNewData = normalizeCopyNodes(newEditor, newData);
      newEditor.insertFragment(normalizeNewData);
      return newEditor;
    }
  };

  return newEditor;

};

export default withNodeId;
