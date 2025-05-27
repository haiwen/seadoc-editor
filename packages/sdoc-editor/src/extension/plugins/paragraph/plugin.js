import { Editor, Range, Transforms, Point, Node } from '@seafile/slate';
import isHotkey from 'is-hotkey';
import { LIST_ITEM, PARAGRAPH } from '../../constants';
import { getSelectedNodeByType, generateDefaultText, isCursorAtBlockStart, findPath, generateDefaultParagraph, getParentNode } from '../../core';
import { isSingleListItem } from '../list/helpers';

const withParagraph = (editor) => {
  const { handleTab, insertText, deleteBackward, onHotKeyDown, insertFragment, insertBreak } = editor;
  const newEditor = editor;

  newEditor.handleTab = (event) => {
    const { selection } = newEditor;
    if (!selection) return;
    if (!Range.isCollapsed(selection)) return;

    const selectedNode = Editor.node(newEditor, selection, { depth: 1 });
    if (selectedNode?.[0]?.type === PARAGRAPH) {
      event.preventDefault();
      const path = Editor.path(newEditor, selection);
      const point = Editor.point(newEditor, selection);
      const isStart = Editor.isStart(newEditor, point, [path[0]]);

      if (isStart) {
        let indent;
        if (isHotkey('shift+tab', event)) {
          indent = false;
        }
        if (isHotkey('tab', event)) {
          indent = true;
        }
        Transforms.setNodes(newEditor, { indent: indent }, { at: [path[0]] });
      } else {
        if (isHotkey('tab', event)) insertText('  ');
      }
      return;
    }
    return handleTab(event);
  };

  newEditor.deleteBackward = (unit) => {
    const { selection } = newEditor;
    if (!selection) return;

    const [selectedNode = {}] = Editor.node(newEditor, selection, { depth: 1 });
    const { type, indent } = selectedNode;
    if (Range.isCollapsed(selection) && type === PARAGRAPH && indent) {
      const path = Editor.path(newEditor, selection);
      const point = Editor.point(newEditor, selection);
      const isStart = Editor.isStart(newEditor, point, [path[0]]);
      if (isStart) {
        Transforms.setNodes(newEditor, { indent: false }, { at: [path[0]] });
        return;
      }
    }

    return deleteBackward(unit);
  };

  newEditor.onHotKeyDown = (event) => {
    const selectedParagraph = getSelectedNodeByType(editor, PARAGRAPH);

    if (selectedParagraph) {
      const { selection } = newEditor;
      if (Range.isCollapsed(selection)) {

        if (isHotkey('ArrowRight', event)) {
          const lastLeaf = selectedParagraph.children.slice(-1)[0];
          // When the last character of a paragraph is code text, right-click to move the cursor and insert a new text node
          // Avoid being unable to enter new text when the code text is at the end of the paragraph
          if (lastLeaf?.code) {
            const { focus } = selection;
            const [, lastPoint] = Editor.edges(newEditor, [focus.path[0]]);
            if (Point.equals(focus, lastPoint)) {
              event.preventDefault();
              Editor.insertFragment(newEditor, [generateDefaultText(' ')]);
              return;
            }
          }
        }

        if (isHotkey('Enter', event)) {
          const lastLeaf = selectedParagraph.children.slice(-1)[0];
          // The last text node style in a paragraph is code. When pressing Enter, insert an empty node first and then split the node.
          // Avoid empty inline nodes at the beginning of new lines
          if (lastLeaf?.code) {
            const { focus } = selection;
            const [, leafPath] = Editor.leaf(newEditor, selection);
            const [, lastPoint] = Editor.edges(newEditor, leafPath);
            if (Point.equals(focus, lastPoint)) {
              event.preventDefault();
              Editor.insertFragment(newEditor, [generateDefaultText(' ')]);
              Transforms.splitNodes(newEditor, { always: true });
              return;
            }
          }

          // when print enter clear text style
          if (lastLeaf?.bold || lastLeaf?.italic) {
            lastLeaf?.bold && Editor.removeMark(editor, 'bold');
            lastLeaf?.italic && Editor.removeMark(editor, 'italic');
            return;
          }
        }
      }
    }

    return onHotKeyDown && onHotKeyDown(event);
  };

  newEditor.insertBreak = () => {
    const selectedNode = getSelectedNodeByType(newEditor, PARAGRAPH);
    if (selectedNode != null && isCursorAtBlockStart(newEditor)) {
      const paragraph = generateDefaultParagraph();
      const targetPath = findPath(editor, selectedNode);
      const parentNode = getParentNode(newEditor.children, selectedNode.id);
      if (parentNode?.type !== LIST_ITEM) {
        Transforms.insertNodes(editor, paragraph, { at: targetPath });
        return;
      }
    }
    insertBreak();
  };

  newEditor.insertFragment = (data) => {
    const paragraphBlock = getSelectedNodeByType(editor, PARAGRAPH);
    const onlyOneListItem = data.length === 1 && isSingleListItem(data[0]);
    if (paragraphBlock && onlyOneListItem) {
      const text = Node.string(data[0]);
      editor.insertText(text);
      return;
    }
    insertFragment(data);
  };

  return newEditor;
};

export default withParagraph;
