import { Editor, Path, Transforms } from '@seafile/slate';
import isHotkey from 'is-hotkey';
import { PARAGRAPH, FILE_VIEW, ELEMENT_TYPE } from '../../constants';
import { focusEditor, generateEmptyElement, getNodeType, getSelectedNodeEntryByType, isLastNode } from '../../core';
import { onCopyNode } from '../../toolbar/side-toolbar/helpers';

const withFileView = (editor) => {
  const { isVoid, onHotKeyDown, normalizeNode } = editor;
  const newEditor = editor;

  // Make video as void node
  newEditor.isVoid = elem => {
    const { type } = elem;

    if (type === FILE_VIEW) {
      return true;
    }

    return isVoid(elem);
  };

  newEditor.onHotKeyDown = (event) => {
    const [fileNode, path] = getSelectedNodeEntryByType(editor, FILE_VIEW) || [];

    if (path) {
      // Insert empty paragraph node after video when clicking 'enter' on selected video
      if (isHotkey('enter', event)) {
        event.preventDefault();
        const emptyParagraph = generateEmptyElement(PARAGRAPH);
        Transforms.insertNodes(editor, emptyParagraph, { at: Path.next(path) });
        const focusPoint = Editor.end(editor, Path.next(path));
        focusEditor(newEditor, focusPoint);
      }

      if (isHotkey('mod+c', event)) {
        onCopyNode(editor, fileNode);
      }

      return true;
    }

    return onHotKeyDown && onHotKeyDown(event);
  };

  newEditor.normalizeNode = ([node, path]) => {
    const type = getNodeType(node);

    if (type !== ELEMENT_TYPE.FILE_VIEW) {
      return normalizeNode([node, path]);
    }

    // insert empty node，continue editor
    const isLast = isLastNode(newEditor, node);
    if (isLast) {
      const p = generateEmptyElement(PARAGRAPH);
      Transforms.insertNodes(newEditor, p, { at: [path[0] + 1] });
    }
  };

  return newEditor;
};

export default withFileView;
