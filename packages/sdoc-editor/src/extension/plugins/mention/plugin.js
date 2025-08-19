import { Editor, Node, Range, Text, Transforms } from '@seafile/slate';
import { INTERNAL_EVENT, KeyCodes } from '../../../constants';
import EventBus from '../../../utils/event-bus';
import { MENTION, MENTION_TEMP } from '../../constants/element-type';
import { focusEditor } from '../../core';
import { insertTemporaryMentionInput, getMentionTempIptEntry, transformToText, getMentionEntry, getPrevMentionIptEntry, getPreCharacters } from './helper';

const withMention = (editor) => {
  const { insertText, onHotKeyDown, isInline, deleteBackward, deleteForward, normalizeNode, onCompositionStart } = editor;
  const newEditor = editor;
  const eventBus = EventBus.getInstance();

  newEditor.insertText = (text) => {
    const { selection } = editor;
    if (text === '@') {
      const beforeStr = getPreCharacters(editor);
      const isEmptyStr = beforeStr.slice(-1).trim().length === 0;
      if (!getMentionTempIptEntry(editor) && isEmptyStr) {
        const { anchor } = selection;
        const path = Editor.path(editor, anchor);
        insertTemporaryMentionInput(newEditor);
        const abovePath = path.slice(0, path.length - 1);
        const focusPath = abovePath.concat(path.at(-1) + 1);
        focusEditor(editor, focusPath);
        return;
      }
    }

    const prevNodeEntry = Editor.previous(editor);
    if (prevNodeEntry) {
      const aboveNodeEntry = Editor.above(editor, { match: n => n.type === MENTION_TEMP, at: prevNodeEntry[1] });
      if (aboveNodeEntry) {
        const inputCnCharacter = text.match(/^[\u4e00-\u9fa5]+$/)?.input;
        if (inputCnCharacter) {
          const insertPoint = Editor.end(editor, aboveNodeEntry[1]);
          const nextNodeEntry = Editor.next(editor, { at: aboveNodeEntry[1] });
          Transforms.insertText(editor, text, { at: insertPoint });
          if (nextNodeEntry) {
            const [nextNode, nextPath] = nextNodeEntry;
            if (Text.isText(nextNode) && nextNode.text === '') {
              Transforms.removeNodes(editor, { at: nextPath });
            }
          }
          return focusEditor(editor, { ...insertPoint, offset: insertPoint.offset + text.length });
        }
      }
    }

    return insertText(text);
  };

  newEditor.deleteBackward = (unit) => {
    const mentionTempInputEntry = getMentionTempIptEntry(editor);
    if (mentionTempInputEntry) {
      const { selection } = editor;

      if (selection && Range.isCollapsed(selection)) {
        const [node, path] = mentionTempInputEntry;
        const contentString = Node.string(node);
        if (!contentString) {
          return Transforms.delete(editor, { at: path });
        }
      }
    }

    // Delete mention, when in mention
    const prevNodeEntry = Editor.previous(editor);
    if (prevNodeEntry) {
      const aboveNodeEntry = Editor.above(editor, { match: n => n.type === MENTION, at: prevNodeEntry[1] });
      const mentionEntry = getMentionEntry(editor);
      if (mentionEntry || aboveNodeEntry) {
        const { selection } = editor;
        if (selection && Range.isCollapsed(selection)) {
          const [, mentionPath] = mentionEntry || aboveNodeEntry;
          return Transforms.removeNodes(editor, { at: mentionPath });
        }
      }
    }

    return deleteBackward(unit);
  };

  newEditor.deleteForward = (unit) => {
    const mentionEntry = Editor.next(editor, { match: n => n.type === MENTION });
    if (mentionEntry) {
      const [, mentionPath] = mentionEntry;
      return Transforms.removeNodes(editor, { at: mentionPath });
    }

    return deleteForward(unit);
  };

  newEditor.onHotKeyDown = (event) => {
    const mentionTempIptEntry = getMentionTempIptEntry(editor);
    if (mentionTempIptEntry) {
      const [, mentionTempIptPath] = mentionTempIptEntry;
      const { DownArrow, UpArrow, Enter, Esc, RightArrow, LeftArrow } = KeyCodes;
      const { keyCode } = event;

      if (keyCode === RightArrow || keyCode === LeftArrow) {
        const { selection } = editor;
        if (!selection) return;
        if (!Range.isCollapsed(selection)) return;
        if (keyCode === RightArrow) {
          if (Editor.isEnd(editor, selection.focus, mentionTempIptPath)) return transformToText(newEditor);
        }
        if (keyCode === LeftArrow) {
          if (Editor.isStart(editor, selection.focus, mentionTempIptPath)) {
            event.preventDefault();
            return transformToText(newEditor, false);
          }
        }
      }

      // Handle by collaborators list
      const interceptorKeyCodes = [DownArrow, UpArrow, Enter, Esc];
      if (interceptorKeyCodes.includes(keyCode)) {
        event.preventDefault();
        eventBus.dispatch(INTERNAL_EVENT.HANDLE_MENTION_TEMP_CHOSEN, { event });
        return;
      }
    }

    const mentionEntry = getMentionEntry(editor);
    if (mentionEntry) {
      const [, mentionPath] = mentionEntry;
      const { RightArrow, LeftArrow } = KeyCodes;
      const { keyCode } = event;

      if (keyCode === RightArrow || keyCode === LeftArrow) {
        event.preventDefault();
        if (keyCode === LeftArrow) {
          const beginPoint = Editor.start(editor, mentionPath);
          const focusPoint = Editor.before(editor, beginPoint, { distance: 1 });
          focusEditor(newEditor, focusPoint);
        } else {
          const endPoint = Editor.end(editor, mentionPath);
          const focusPoint = Editor.after(editor, endPoint, { distance: 1 });
          focusEditor(newEditor, focusPoint);
        }
      }
    }

    return onHotKeyDown && onHotKeyDown(event);
  };

  newEditor.onCompositionUpdate = (event) => {
    const mentionTempIptEntry = getMentionTempIptEntry(newEditor);
    if (mentionTempIptEntry) {
      const { data } = event;
      const compositionText = data.replace(/\'/g, '');
      eventBus.dispatch(INTERNAL_EVENT.UPDATE_MENTION_TEMP_CONTENT, { compositionText });
      return true;
    }
  };

  newEditor.onCompositionStart = (event) => {
    const mentionTempIptEntry = getMentionTempIptEntry(editor);
    if (mentionTempIptEntry) {
      event.preventDefault();
      return true;
    }
    return onCompositionStart && onCompositionStart(event);
  };

  newEditor.onCompositionEnd = (event) => {
    const PrevMentionIptEntry = getPrevMentionIptEntry(newEditor);
    if (PrevMentionIptEntry) {
      const { data } = event;
      const insertPoint = Editor.end(editor, PrevMentionIptEntry[1]);
      const nextNodeEntry = Editor.next(editor, { at: PrevMentionIptEntry[1] });
      Transforms.insertText(editor, data, { at: insertPoint });
      event.preventDefault();
      focusEditor(editor, { ...insertPoint, offset: insertPoint.offset + data.length });
      if (nextNodeEntry) {
        const [nextNode, nextPath] = nextNodeEntry;
        if (Text.isText(nextNode) && nextNode.text === '') {
          Transforms.removeNodes(editor, { at: nextPath });
        }
      }
      return true;
    }
  };

  newEditor.isInline = (element) => {
    if ([MENTION, MENTION_TEMP].includes(element.type)) {
      return true;
    }
    return isInline(element);
  };

  newEditor.normalizeNode = ([node, path]) => {
    const mentionEntry = getMentionEntry(editor);
    if (mentionEntry) {
      const nextEntry = Editor.next(editor, { at: mentionEntry[1] });
      const focusPoint = Editor.start(editor, nextEntry[1]);
      focusEditor(editor, focusPoint);
    }
    return normalizeNode([node, path]);

  };


  return newEditor;
};

export default withMention;
