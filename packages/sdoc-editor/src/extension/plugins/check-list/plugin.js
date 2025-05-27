import { Editor, Node, Range, Transforms } from '@seafile/slate';
import isHotkey from 'is-hotkey';
import { CHECK_LIST_ITEM, PARAGRAPH } from '../../constants';
import { focusEditor, generateDefaultText, getSelectedNodeByType, isCursorAtBlockStart, findPath, generateEmptyElement } from '../../core';

const withCheckList = (editor) => {
  const { insertBreak, deleteBackward, onHotKeyDown } = editor;
  const newEditor = editor;

  newEditor.insertBreak = () => {
    const { selection } = newEditor;

    if (!selection) {
      insertBreak();
      return;
    }

    const node = getSelectedNodeByType(editor, CHECK_LIST_ITEM);

    if (!node) {
      insertBreak();
      return;
    }

    if (Node.string(node).length === 0) {
      Transforms.setNodes(editor, { type: PARAGRAPH, children: [generateDefaultText()] }, {
        at: node[1]
      });
      return;
    }

    // If it is check-list-item, handle your own business logic
    if (isCursorAtBlockStart(editor)) {
      const path = findPath(editor, node);
      const newNode = generateEmptyElement(CHECK_LIST_ITEM);
      Transforms.insertNodes(editor, newNode, { at: path });
      return;
    }

    Transforms.splitNodes(editor, { always: true });
    Transforms.setNodes(editor, { checked: false }, { at: node[1] });
  };

  newEditor.deleteBackward = (unit) => {
    const { selection } = newEditor;

    if (selection && Range.isCollapsed(selection)) {
      const selectedTodo = getSelectedNodeByType(editor, CHECK_LIST_ITEM);
      if (selectedTodo) {
        // If the current todo has no text, it will be converted to a paragraph
        if (Node.string(selectedTodo).length === 0) {
          Transforms.setNodes(editor, { type: PARAGRAPH, children: [generateDefaultText()] }, {
            at: selectedTodo[1]
          });
          return;
        }
      }
    }

    deleteBackward(unit);
  };

  newEditor.onHotKeyDown = (event) => {
    const selectedTodo = getSelectedNodeByType(editor, CHECK_LIST_ITEM);

    if (selectedTodo) {
      if (isHotkey('shift+enter', event)) {
        event.preventDefault();
        const { selection } = newEditor;
        const insertPoint = Editor.start(editor, selection);
        Transforms.insertText(editor, '\n', { at: insertPoint });
        focusEditor(editor, {
          anchor: {
            path: insertPoint.path,
            offset: insertPoint.offset + 1
          },
          focus: {
            path: insertPoint.path,
            offset: insertPoint.offset + 1
          }
        });
      }
      return true;
    }

    return onHotKeyDown && onHotKeyDown(event);
  };

  return newEditor;
};

export default withCheckList;
