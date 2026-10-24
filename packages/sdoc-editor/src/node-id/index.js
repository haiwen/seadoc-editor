import { Editor, Range, Text, Transforms } from '@seafile/slate';
import { CLIPBOARD_FORMAT_KEY, RECENT_COPY_CONTENT } from '../extension/constants';
import { getSlateFragmentAttribute, normalizeCopyNodes } from '../utils/document-utils';
import LocalStorage from '../utils/local-storage-utils';
import { decorateOperation, removeCommentMarks, replacePastedDataId } from './helpers';


const withNodeId = (editor) => {
  const { apply, insertText, insertBreak, insertSoftBreak } = editor;
  const newEditor = editor;

  newEditor.apply = (op) => {
    const newOp = decorateOperation(newEditor, op);
    apply(newOp);
  };

  newEditor.insertText = (text) => {
    const { selection } = editor;
    // Remove context comment marks at comment boundaries.
    if (selection) {
      const [start, end] = Range.edges(selection);
      if (Range.isExpanded(selection) && Editor.void(editor, { at: end })) {
        return insertText(text);
      }
      const [, startBlockPath] = Editor.above(editor, { at: start, match: n => Editor.isBlock(editor, n) });
      const [, endBlockPath] = Editor.above(editor, { at: end, match: n => Editor.isBlock(editor, n) });
      const beforePoint = !Editor.isStart(editor, start, startBlockPath) && Editor.before(editor, start, { unit: 'character' });
      const afterPoint = !Editor.isEnd(editor, end, endBlockPath) && Editor.after(editor, end, { unit: 'character' });

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

      const marks = Editor.marks(editor);
      if (marks) {
        const [currentText] = Editor.leaf(editor, start);
        if (hasCommentBefore || hasCommentAfter ||
          Object.keys(currentText).some((k) => k.includes('sdoc_comment')) ||
          Object.keys(marks).some((k) => k.includes('sdoc_comment'))) {
          const inputMarks = { ...marks };
          for (const key of Object.keys(marks)) {
            if (key === 'id' || (key.includes('sdoc_comment') &&
              (!hasCommentBefore || !hasCommentAfter || !(key in beforeText[0]) || !(key in afterText[0])))) {
              delete inputMarks[key];
            }
          }
          if (Object.keys(marks).some(key => key.includes('sdoc_comment') && !(key in inputMarks)) ||
            Object.keys(currentText).some(key => key.includes('sdoc_comment') && !(key in inputMarks)) ||
            Object.keys(inputMarks).some(key => key.includes('sdoc_comment') && !(key in currentText))) {
            editor.marks = inputMarks;
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

      LocalStorage.setItem(RECENT_COPY_CONTENT, normalizeNewData);

      newEditor.insertFragment(normalizeNewData);
      return newEditor;
    }
  };

  const insertWithCommentCleanup = (insertMethod) => {
    const start = editor.selection && Range.start(editor.selection);
    const atStart = start && Editor.isStart(editor, start, start.path.slice(0, -1));
    insertMethod();
    Editor.withoutNormalizing(editor, () => {
      const { selection } = editor;
      if (!selection || !Range.isCollapsed(selection)) return;

      const currentText = Editor.leaf(editor, selection.focus);
      const previousText = atStart && Editor.previous(editor, {
        at: selection.focus.path,
        match: Text.isText,
      });
      // A split at the start can leave the new empty leaf before the cursor.
      for (const entry of [previousText, currentText]) {
        if (!entry) continue;
        const [node, path] = entry;
        if (node.text === '') {
          const commentKeys = Object.keys(node).filter(key => key.startsWith('sdoc_comment_'));
          if (commentKeys.length) {
            Transforms.unsetNodes(editor, commentKeys, { at: path });
          }
        }
      }
    });
  };

  newEditor.insertBreak = () => {
    insertWithCommentCleanup(insertBreak);
  };

  newEditor.insertSoftBreak = () => {
    insertWithCommentCleanup(insertSoftBreak);
  };

  return newEditor;

};

export default withNodeId;
