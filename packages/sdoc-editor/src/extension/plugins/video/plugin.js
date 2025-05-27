import { Editor, Path, Transforms } from '@seafile/slate';
import isHotkey from 'is-hotkey';
import { PARAGRAPH, VIDEO } from '../../constants';
import { focusEditor, generateEmptyElement, getSelectedNodeEntryByType } from '../../core';
import { onCopyNode } from '../../toolbar/side-toolbar/helpers';

const withVideo = (editor) => {
  const { isVoid, onHotKeyDown } = editor;
  const newEditor = editor;

  // Make video as void node
  newEditor.isVoid = elem => {
    const { type } = elem;

    if (type === VIDEO) {
      return true;
    }

    return isVoid(elem);
  };

  newEditor.onHotKeyDown = (event) => {
    const [videoNode, path] = getSelectedNodeEntryByType(editor, VIDEO) || [];

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
        onCopyNode(editor, videoNode);
      }

      return true;
    }

    return onHotKeyDown && onHotKeyDown(event);
  };

  return newEditor;
};

export default withVideo;
