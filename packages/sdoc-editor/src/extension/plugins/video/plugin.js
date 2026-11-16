import { Editor, Path, Range, Transforms } from '@seafile/slate';
import isHotkey from 'is-hotkey';
import { PARAGRAPH, VIDEO } from '../../constants';
import { focusEditor, generateEmptyElement, getNextNode, getPrevNode, getSelectedNodeEntryByType } from '../../core';
import { onCopyNode } from '../../toolbar/side-toolbar/helpers';

const withVideo = (editor) => {
  const { isVoid, deleteBackward, onHotKeyDown } = editor;
  const newEditor = editor;

  // Make video as void node
  newEditor.isVoid = elem => {
    const { type } = elem;

    if (type === VIDEO) {
      return true;
    }

    return isVoid(elem);
  };

  newEditor.deleteBackward = (unit) => {
    const { selection } = newEditor;

    if (selection && Range.isCollapsed(selection)) {
      const paragraphEntry = Editor.above(newEditor, {
        at: selection,
        match: node => node.type === PARAGRAPH,
        mode: 'lowest',
      });

      if (paragraphEntry) {
        const [paragraphNode, paragraphPath] = paragraphEntry;
        if (paragraphPath.at(-1) > 0 && Editor.isStart(newEditor, selection.anchor, paragraphPath)) {
          const previousPath = Path.previous(paragraphPath);
          if (Editor.hasPath(newEditor, previousPath)) {
            const [previousNode] = Editor.node(newEditor, previousPath);
            if (previousNode.type === VIDEO) {
              const isEmptyParagraph = paragraphNode.children.every(child => typeof child.text === 'string' && child.text.length === 0);
              if (isEmptyParagraph) {
                Transforms.removeNodes(newEditor, { at: paragraphPath });
              }
              focusEditor(newEditor, previousPath);
              return;
            }
          }
        }
      }
    }

    return deleteBackward(unit);
  };

  newEditor.onHotKeyDown = (event) => {
    const [videoNode, path] = getSelectedNodeEntryByType(editor, VIDEO) || [];

    if (isHotkey(['left', 'right'], event)) {
      const { selection } = editor;
      if (!Range.isCollapsed(selection)) return true;

      if (isHotkey('right', event)) {
        const nextEntry = getNextNode(editor);
        if (nextEntry && nextEntry[0]?.type === VIDEO) {
          Transforms.select(editor, nextEntry[1]);
          return true;
        }
      }
      if (isHotkey('left', event)) {
        const prevEntry = getPrevNode(editor);
        if (prevEntry && prevEntry[0]?.type === VIDEO) {
          Transforms.select(editor, prevEntry[1]);
          return true;
        }
      }
    }

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
