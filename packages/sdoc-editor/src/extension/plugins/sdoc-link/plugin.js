import { Transforms, Node, Editor } from '@seafile/slate';
import { ReactEditor } from '@seafile/slate-react';
import { FILE_LINK_INSET_INPUT_TEMP, SDOC_LINK } from '../../constants';
import { WIKI_LINK } from '../../constants/element-type';
import { getSelectedElems } from '../../core';
import { getFileSearchInputEntry, getSdocLinkEntry, insertTempInput, isTriggeredByShortcut } from './helpers';

const withSdocLink = (editor) => {
  const { isInline, deleteBackward, insertText, onCompositionStart, onHotKeyDown } = editor;
  const newEditor = editor;

  // Rewrite isInline
  newEditor.isInline = elem => {
    const { type } = elem;

    const isInlineElem = [WIKI_LINK, SDOC_LINK, FILE_LINK_INSET_INPUT_TEMP].includes(type);
    if (isInlineElem) return true;

    return isInline(elem);
  };

  newEditor.deleteBackward = (unit) => {
    const { selection } = newEditor;
    if (selection === null) {
      return deleteBackward(unit);
    }

    // Delete file link node when the input is empty
    const selectedElems = getSelectedElems(newEditor);
    const fileLinkSearchInputNode = selectedElems.find(elem => elem.type === FILE_LINK_INSET_INPUT_TEMP);
    if (fileLinkSearchInputNode) {
      const path = ReactEditor.findPath(editor, fileLinkSearchInputNode);
      if (Node.string(fileLinkSearchInputNode).length === 0) return Transforms.delete(newEditor, { at: path });
    }

    const nodeEntry = Editor.node(newEditor, newEditor.selection);
    if (nodeEntry && Node.string(nodeEntry[0]).length === 0) {
      const beforePath = nodeEntry[1];
      beforePath.splice(-1, 1, Math.max(nodeEntry[1].at(-1) - 1, 0));
      const beforeNodeEntry = Editor.node(newEditor, beforePath);
      if (beforeNodeEntry && [WIKI_LINK, SDOC_LINK, FILE_LINK_INSET_INPUT_TEMP].includes(beforeNodeEntry[0].type)) {
        Transforms.delete(newEditor, { at: beforeNodeEntry[1] });
        return;
      }
      return deleteBackward(unit);
    }


    return deleteBackward(unit);
  };

  newEditor.insertText = (text) => {
    if (text !== '[') return insertText(text);
    // If user press '[[', open file modal
    if (isTriggeredByShortcut(newEditor)) {
      insertText(text);
      insertTempInput(newEditor);
      return;
    }
    return insertText(text);
  };

  newEditor.onCompositionStart = (event) => {
    const fileSearchInputNodeEntry = getFileSearchInputEntry(newEditor);
    if (fileSearchInputNodeEntry) {
      event.preventDefault();
      return true;
    }
    return onCompositionStart && onCompositionStart(event);
  };

  newEditor.onHotKeyDown = (e) => {
    const sdocLinkEntry = getSdocLinkEntry(editor);
    if (sdocLinkEntry) {
      if (e.key === 'ArrowLeft') {
        const beforePointSdocLink = Editor.before(newEditor, sdocLinkEntry[1]);
        Transforms.select(newEditor, beforePointSdocLink);
        e.preventDefault();
        return;
      }
      if (e.key === 'ArrowRight') {
        const afterPointSdocLink = Editor.after(newEditor, sdocLinkEntry[1]);
        Transforms.select(newEditor, afterPointSdocLink);
        e.preventDefault();
        return;
      }
    }

    return onHotKeyDown && onHotKeyDown(e);
  };

  return newEditor;
};

export default withSdocLink;
