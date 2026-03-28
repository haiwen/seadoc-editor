import React from 'react';
import { Editor, Path, Transforms } from '@seafile/slate';
import isHotkey from 'is-hotkey';
import { PARAGRAPH } from '../../constants';
import { EMBED_LINK } from '../../constants/element-type';
import { focusEditor, generateEmptyElement, getSelectedNodeEntryByType } from '../../core';
import { onCopyNode } from '../../toolbar/side-toolbar/helpers';

const withEmbedLink = (editor) => {
  const { isVoid, onHotKeyDown } = editor;
  const newEditor = editor;

  // Make embed link as void node
  newEditor.isVoid = elem => {
    const { type } = elem;
    if (type === EMBED_LINK) {
      return true;
    }

    return isVoid(elem);
  };

  newEditor.onHotKeyDown = (event) => {
    const [embedLinkNode, path] = getSelectedNodeEntryByType(editor, EMBED_LINK) || [];
    if (path) {
      // Insert empty paragraph node after embed link when clicking 'enter' on selected embed link
      if (isHotkey('enter', event)) {
        event.preventDefault();
        const emptyParagraph = generateEmptyElement(PARAGRAPH);
        Transforms.insertNodes(editor, emptyParagraph, { at: Path.next(path) });
        const focusPoint = Editor.end(editor, Path.next(path));
        focusEditor(newEditor, focusPoint);
      }

      if (isHotkey('mod+c', event)) {
        onCopyNode(editor, embedLinkNode);
      }

      return true;
    }

    return onHotKeyDown && onHotKeyDown(event);
  };

  return newEditor;
};

export default withEmbedLink;
