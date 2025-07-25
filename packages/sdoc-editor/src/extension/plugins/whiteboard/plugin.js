import React from 'react';
import { Editor, Path, Transforms } from '@seafile/slate';
import isHotkey from 'is-hotkey';
import { PARAGRAPH, WHITEBOARD } from '../../constants';
import { focusEditor, generateEmptyElement, getSelectedNodeEntryByType } from '../../core';
import { onCopyNode } from '../../toolbar/side-toolbar/helpers';

const withWhiteboard = (editor) => {
  const { isVoid, onHotKeyDown } = editor;
  const newEditor = editor;

  // Make whiteboard as void node
  newEditor.isVoid = elem => {
    const { type } = elem;
    if (type === WHITEBOARD) {
      return true;
    }

    return isVoid(elem);
  };

  newEditor.onHotKeyDown = (event) => {
    const [whiteboardNode, path] = getSelectedNodeEntryByType(editor, WHITEBOARD) || [];
    if (path) {
      // Insert empty paragraph node after whiteboard when clicking 'enter' on selected whiteboard
      if (isHotkey('enter', event)) {
        event.preventDefault();
        const emptyParagraph = generateEmptyElement(PARAGRAPH);
        Transforms.insertNodes(editor, emptyParagraph, { at: Path.next(path) });
        const focusPoint = Editor.end(editor, Path.next(path));
        focusEditor(newEditor, focusPoint);
      }

      if (isHotkey('mod+c', event)) {
        onCopyNode(editor, whiteboardNode);
      }

      return true;
    }

    return onHotKeyDown && onHotKeyDown(event);
  };

  return newEditor;
};

export default withWhiteboard;
