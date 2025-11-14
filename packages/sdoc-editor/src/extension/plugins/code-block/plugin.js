import { Transforms, Node, Range, Editor } from '@seafile/slate';
import { ReactEditor } from '@seafile/slate-react';
import isHotkey from 'is-hotkey';
import slugid from 'slugid';
import { CODE_BLOCK, PARAGRAPH, CODE_LINE, BLOCKQUOTE } from '../../constants';
import { getNodeType, isLastNode, getSelectedNodeByType, generateEmptyElement, isSelectionAtBlockStart, getSelectedElems,
  isCursorAtBlockStart,
} from '../../core';
import { deleteBackwardByLength } from './helpers';

const withCodeBlock = (editor) => {
  const { normalizeNode, insertFragment, insertText, insertBreak, insertData, deleteBackward } = editor;
  const newEditor = editor;

  // If you enter two Spaces in quick succession, a period and a space appear （Default Settings for mac）
  newEditor.insertText = (data) => {
    if (data === '. ') {
      return insertText('  ');
    }
    return insertText(data);
  };

  newEditor.deleteBackward = (unit) => {
    const node = getSelectedNodeByType(editor, CODE_BLOCK);
    if (node) {
      if (isSelectionAtBlockStart(editor)) return;
    }
    deleteBackward(unit);
  };

  newEditor.insertData = (data) => {
    // Paste a single code block element somewhere other than a code block
    if (data.types.includes('text/code-block') && !getSelectedNodeByType(editor, CODE_BLOCK)) {
      const options = {};
      // Paste into quote block
      if (getSelectedNodeByType(newEditor, BLOCKQUOTE)) {
        const path = Editor.path(newEditor, newEditor.selection);
        options['at'] = [path[0]];
      }
      const codeBlockNode = JSON.parse(data.getData('text/code-block'));
      return Transforms.insertNodes(newEditor, codeBlockNode, { ...options });
    }
    insertData(data);
  };

  newEditor.insertFragment = (data) => {
    // Only selected code block content
    if (data.length === 1 && data[0].type === CODE_BLOCK && !getSelectedNodeByType(editor, CODE_BLOCK)) {
      data.forEach((node, index) => {
        if (node.type === CODE_BLOCK) {
          const newBlock = node.children.map(line => {
            const text = Node.string(line);
            const p = generateEmptyElement(PARAGRAPH);
            p.children[0].text = text;
            return p;
          });
          data.splice(index, 1, ...newBlock);
        }
      });
      return insertFragment(data);
    }

    // Paste into code block
    if (getSelectedNodeByType(editor, CODE_BLOCK)) {

      // Pasted data is code block split with code-line
      data.forEach((node, index) => {
        if (node.type === CODE_BLOCK) {
          const codeLineArr = node.children.map(line => line);
          data.splice(index, 1, ...codeLineArr);
        }
      });
      const newData = data.map(node => {
        const text = Node.string(node);
        const codeLine = {
          id: slugid.nice(),
          type: CODE_LINE,
          children: [{ text: text, id: slugid.nice() }],
        };
        return codeLine;
      });

      // current focus code-line string not empty
      const string = Editor.string(newEditor, newEditor.selection.focus.path);
      if (string.length !== 0 && Range.isCollapsed(newEditor.selection)) {
        const [node, ...restNode] = newData;
        const text = Node.string(node);
        insertText(text);
        if (restNode.length !== 0) {
          insertBreak();
          insertFragment(restNode);
        }
        return;
      }
      return insertFragment(newData);
    }

    // Paste into not a code block
    return insertFragment(data);
  };

  // Rewrite normalizeNode
  newEditor.normalizeNode = ([node, path]) => {
    const type = getNodeType(node);

    if (type === CODE_LINE && path.length <= 1) {
      Transforms.setNodes(newEditor, { type: PARAGRAPH }, { at: path });
      return;
    }

    if (type === CODE_BLOCK) {
      if (node.children.length === 0) {
        Transforms.delete(newEditor, { at: path });
        return;
      }

      // code-block is the last node in the editor and needs to be followed by a p node
      const isLast = isLastNode(newEditor, node);
      if (isLast) {
        const paragraph = generateEmptyElement(PARAGRAPH);
        Transforms.insertNodes(newEditor, paragraph, { at: [path[0] + 1] });
      }

      // There must be a code node below code-block
      if (getNodeType(node.children[0]) !== CODE_LINE) {
        Transforms.unwrapNodes(newEditor);
        Transforms.setNodes(newEditor, { type: PARAGRAPH }, { mode: 'highest' });
      }

      if (node.children.length > 1) {
        node.children.forEach((child, index) => {
          if (child.type !== CODE_LINE) {
            Transforms.setNodes(newEditor, { type: CODE_LINE }, { at: [...path, index] });
          }
        });
      }
    }

    // Perform default behavior
    return normalizeNode([node, path]);
  };

  newEditor.codeBlockOnKeyDown = (event) => {
    if (isHotkey(['command+enter', 'ctrl+enter'], event)) {
      if (newEditor.selection && !Range.isExpanded(newEditor.selection)) {
        const path = Editor.path(newEditor, newEditor.selection);
        const p = generateEmptyElement(PARAGRAPH);
        Transforms.insertNodes(newEditor, p, { at: [path[0] + 1] });
        Transforms.select(newEditor, [path[0] + 1]);
      }
    }

    if (isHotkey('enter', event)) {
      event.preventDefault();
      const selectedNode = getSelectedNodeByType(newEditor, CODE_LINE);
      const line = generateEmptyElement(CODE_LINE);
      Transforms.insertNodes(editor, line, { at: selectedNode[1] });
      return;
    }

    if (isHotkey('tab', event)) {
      const { selection } = newEditor;
      event.preventDefault();
      // By default, tab key will insert 4 spaces
      const indent = ' '.repeat(4);

      if (Range.isCollapsed(selection)) {
        newEditor.insertText(indent);
      } else {
        const selectedElements = getSelectedElems(newEditor);
        selectedElements.forEach(elem => {
          if (elem.type !== CODE_LINE) return;
          const text = indent + Node.string(elem);
          const insertPoint = ReactEditor.findPath(newEditor, elem);
          Transforms.insertText(editor, text, { at: insertPoint });
        });
      }
    }

    if (isHotkey('shift+tab', event)){
      const range = {
        anchor: {
          offset: 0,
          path: newEditor.selection.focus.path
        },
        focus: { ...newEditor.selection.focus }
      };
      const str = Editor.string(newEditor, range);
      if (str.trim() === '') {
        deleteBackwardByLength(newEditor, str.length);
      }
    }
  };

  newEditor.insertBreak = () => {
    const selectedNode = getSelectedNodeByType(newEditor, CODE_LINE);
    if (selectedNode != null && isCursorAtBlockStart(newEditor)) {
      const line = generateEmptyElement(CODE_LINE);
      Transforms.insertNodes(editor, line, { at: selectedNode[1] });
      return;
    }
    insertBreak();
  };

  return newEditor;
};

export default withCodeBlock;
