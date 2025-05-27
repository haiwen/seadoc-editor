import { Editor, Transforms } from '@seafile/slate';
import { ELEMENT_TYPE, IMAGE, ORDERED_LIST, PARAGRAPH, UNORDERED_LIST } from '../../constants';
import { getNodeType, isLastNode, generateEmptyElement, getSelectedNodeEntryByType, findPath } from '../../core';
import { unwrapList } from '../list/transforms/unwrap-list';
import { hasImageInColumn, updateColumnWidthOnDeletion } from './helper';

const withMultiColumn = (editor) => {
  const { normalizeNode, deleteBackward, deleteForward } = editor;
  const newEditor = editor;

  newEditor.normalizeNode = ([node, path]) => {
    const type = getNodeType(node);

    if (node.type === ELEMENT_TYPE.COLUMN) {
      const parentEntry = Editor.parent(newEditor, path);
      if (parentEntry && parentEntry[0].type !== ELEMENT_TYPE.MULTI_COLUMN) {
        Transforms.unwrapNodes(newEditor, {
          at: path,
        });
        return;
      }
    }

    if (type !== ELEMENT_TYPE.MULTI_COLUMN) {
      return normalizeNode([node, path]);
    }

    // Insert empty node，continue newEditor
    const isLast = isLastNode(newEditor, node);
    if (isLast) {
      const p = generateEmptyElement(ELEMENT_TYPE.PARAGRAPH);
      Transforms.insertNodes(newEditor, p, { at: [path[0] + 1] });
    }

  };

  newEditor.deleteBackward = (unit) => {
    const { selection } = editor;
    if (!selection) return;

    const currentMultiColumnEntry = getSelectedNodeEntryByType(editor, ELEMENT_TYPE.MULTI_COLUMN);
    if (!currentMultiColumnEntry) return deleteBackward(unit);
    const { column, children: childColumn } = currentMultiColumnEntry[0];

    const currentColumnEntry = getSelectedNodeEntryByType(editor, ELEMENT_TYPE.COLUMN);
    const isOnlyOneChild = currentColumnEntry[0].children.length === 1;
    const isAtStart = Editor.isStart(editor, selection.focus, selection.anchor.path.slice(0, 2));

    const currentNodeInColumn = currentColumnEntry[0].children[0];
    const currentNodePathInColumn = findPath(editor, currentNodeInColumn);
    // Only one child inline-image in current column
    // Return if cursor is at the start of only one child image
    if (isOnlyOneChild && currentNodeInColumn.children.length === 3) {
      const isImageType = currentNodeInColumn.children[1].type === IMAGE;
      if (isImageType && selection.anchor.path[3] === 0 && selection.anchor.offset === 0) {
        return;
      }
    }

    // When selection is at start of the only one existed child nodes in current column node, delete column node
    if (isOnlyOneChild && isAtStart) {
      // Transform non-paragraph elements without callout element to paragraph elements
      if (currentNodeInColumn.type !== PARAGRAPH) {
        // Unwrap list if list-item exists in the current column node
        if ([UNORDERED_LIST, ORDERED_LIST].includes(currentNodeInColumn.type)) {
          unwrapList(editor);
          return;
        }
        if ([UNORDERED_LIST, ORDERED_LIST].includes(currentNodeInColumn?.children[0]?.type)) {
          Transforms.unwrapNodes(editor, { at: currentNodePathInColumn });
        } else {
          Transforms.setNodes(editor, { type: PARAGRAPH }, { at: currentNodePathInColumn });
        }
        return;
      }

      // Delete multi_column and column wrap when only one child column node exists
      if (childColumn.length <= 2) {
        deleteBackward();
        Transforms.unwrapNodes(editor, { at: [selection.anchor.path[0]] });
        return;
      }
      // Delete current child column node every time when number of child column node is more than 2
      if (childColumn.length > 2) {
        deleteBackward();
        updateColumnWidthOnDeletion(newEditor, selection, column, 'deleteBackward');
        return;
      }
    }

    deleteBackward(unit);
  };

  newEditor.deleteForward = (unit) => {
    const { selection } = editor;
    if (!selection) return;

    const nextNode = Editor.next(newEditor);
    const nextColumnIndex = nextNode[1][1];

    const currentMultiColumnEntry = getSelectedNodeEntryByType(editor, ELEMENT_TYPE.MULTI_COLUMN);
    if (!currentMultiColumnEntry) return deleteForward(unit);
    const { column, children: childColumn } = currentMultiColumnEntry[0];

    const isOnlyOneChild = childColumn[nextColumnIndex].children.length === 1;
    const isAtEnd = Editor.isEnd(editor, selection.focus, selection.anchor.path.slice(0, 2));

    // When deleteForwarding only one child including image or image-block in next column, return
    const hasImageInOnlyOneChild = isOnlyOneChild && hasImageInColumn(editor, nextNode[1].slice(0, 2));
    if (isOnlyOneChild && isAtEnd && hasImageInOnlyOneChild) {
      return;
    }

    // When selection is at end and the only one existed child nodes in next column node, delete column node
    if (isOnlyOneChild && isAtEnd) {
      // Delete multi_column and column wrap when only one child column node exists and selection is on the first column node
      if (childColumn.length === 2 && selection.anchor.path.slice(0, 2)[1] === 0) {
        deleteForward();
        Transforms.unwrapNodes(editor, { at: [selection.anchor.path[0]] });
        return;
      }
      // Delete next child column node every time when number of child column node is more than 2
      if (childColumn.length > 2) {
        deleteForward();
        updateColumnWidthOnDeletion(newEditor, selection, column, 'deleteForward');
        return;
      }
    }

    deleteForward(unit);
  };

  return newEditor;
};

export default withMultiColumn;
