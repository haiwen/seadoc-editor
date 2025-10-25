import { Editor, Node, Range, Transforms } from '@seafile/slate';
import { KeyCodes } from '../../../../constants';
import { CODE_BLOCK, TABLE, QUICK_INSERT, MULTI_COLUMN } from '../../../constants';
import { focusEditor, getTopLevelBlockNode } from '../../../core';
import { getBeforeText } from '../../list/helpers';
import { genQuickInsert, getQuickInsertEntity, transformToText } from '../helper';

const withQuickInsert = (editor) => {
  const { insertText, onHotKeyDown, isInline, deleteBackward, deleteForward, onCompositionStart } = editor;
  const newEditor = editor;
  newEditor.isSlashKey = false;

  newEditor.insertText = (text) => {
    if (!editor.selection) return insertText(text);
    // select multiple top block, top block entry is null
    const topBlockEntry = getTopLevelBlockNode(editor);
    if (!topBlockEntry) return insertText(text);

    const blockNode = topBlockEntry[0];

    // Disable quick insert for code block and table
    if ([CODE_BLOCK, TABLE].includes(blockNode.type)) {
      return insertText(text);
    }

    // Disable quick insert for non-empty nodes if not multi_column node
    if (Node.string(blockNode) !== '' && blockNode.type !== MULTI_COLUMN) {
      return insertText(text);
    }

    // Disable quick insert for non-empty column node in multi_column node
    if (blockNode.type === MULTI_COLUMN) {
      const [node] = Editor.node(editor, editor.selection.anchor.path);
      if (Node.string(node) !== '') {
        return insertText(text);
      }
    }

    // Set isSlashKey to compatible with ’Sou gou‘ Chinese Input Method
    if (text === '/' || (text === '、' && newEditor.isSlashKey)) {
      newEditor.isSlashKey = false;
      // Avoid triggering quick insert when the cursor is in the quick insert
      const isInQuickInsert = getQuickInsertEntity(editor);
      if (isInQuickInsert) return insertText(text);
      const { beforeText } = getBeforeText(editor);
      // If the previous text ends with a number, do not trigger the quick insert
      const isEndWithNumber = beforeText.match(/\d+$/);
      if (isEndWithNumber) return insertText(text);
      const quickInsert = genQuickInsert();
      return Transforms.insertNodes(editor, quickInsert);
    }

    return insertText(text);
  };

  newEditor.deleteBackward = (unit) => {
    const quickInsertEntry = getQuickInsertEntity(editor);
    if (quickInsertEntry) {
      const { selection } = editor;

      if (selection && Range.isCollapsed(selection)) {
        const [node, path] = quickInsertEntry;
        const contentString = Node.string(node);
        if (!contentString) {
          return Transforms.delete(editor, { at: path });
        }

        // Transform to text when delete shortcut prefix
        const isAtStart = Editor.isStart(editor, selection.focus, quickInsertEntry[1]);
        if (isAtStart) {
          const [, insertPath] = Editor.next(editor, { at: path });
          const insertPoint = Editor.start(editor, insertPath);
          const insertText = Node.string(quickInsertEntry[0]);
          Transforms.insertText(editor, insertText, { at: insertPoint });
          Transforms.removeNodes(editor, { at: path });
          return;
        }
      }
    }
    return deleteBackward(unit);
  };

  newEditor.deleteForward = (unit) => {
    const quickInsertEntry = getQuickInsertEntity(editor);
    if (quickInsertEntry) {
      const { selection } = editor;
      const isAtEnd = Editor.isEnd(editor, selection.focus, quickInsertEntry[1]);
      if (isAtEnd) {
        deleteForward(unit);
        focusEditor(editor, Editor.end(newEditor, quickInsertEntry[1]));
        return;
      }
    }
    return deleteForward(unit);
  };

  newEditor.onHotKeyDown = (event) => {
    newEditor.isSlashKey = event.code === 'Slash';

    const quickInsertEntry = getQuickInsertEntity(editor);
    if (quickInsertEntry) {
      const [quickInsertNode, quickInsertPath] = quickInsertEntry;
      const { Esc, RightArrow, LeftArrow } = KeyCodes;
      const { keyCode } = event;

      if ([RightArrow, LeftArrow].includes(keyCode)) {
        const { selection } = editor;
        const focusPoint = selection.focus;
        if (!selection) return;
        if (!Range.isCollapsed(selection)) return;
        if (keyCode === RightArrow) {
          if (Editor.isEnd(editor, focusPoint, quickInsertPath)) {
            const insertPoint = transformToText(newEditor, quickInsertNode);
            focusEditor(newEditor, insertPoint);
            return;
          }
        }
        if (keyCode === LeftArrow) {
          if (Editor.isStart(editor, focusPoint, quickInsertPath)) {
            event.preventDefault();
            transformToText(newEditor, quickInsertNode);
            return;
          }
        }
      }

      if (keyCode === Esc) {
        // Choose the next point to focus
        // Here need offset + 1 as text not include the prefix '/'
        event.preventDefault();
        const insertPoint = transformToText(newEditor, quickInsertNode);
        return focusEditor(newEditor, insertPoint);
      }
    }

    return onHotKeyDown && onHotKeyDown(event);
  };

  newEditor.onCompositionStart = (event) => {
    const quickInsertEntry = getQuickInsertEntity(editor);
    if (quickInsertEntry) {
      event.preventDefault();
      return true;
    }
    return onCompositionStart && onCompositionStart(event);
  };

  newEditor.isInline = (element) => {
    if ([QUICK_INSERT].includes(element.type)) {
      return true;
    }
    return isInline(element);
  };

  return newEditor;
};

export default withQuickInsert;
