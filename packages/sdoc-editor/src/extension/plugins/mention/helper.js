import { Editor, Range, Transforms } from '@seafile/slate';
import slugid from 'slugid';
import context from '../../../context';
import { MENTION, MENTION_TEMP } from '../../constants/element-type';
import { focusEditor, generateDefaultText } from '../../core';

const generateMentionTempInput = () => {
  const id = slugid.nice();
  const type = MENTION_TEMP;
  const children = [generateDefaultText()];

  return { id, type, children, };
};

export const insertTemporaryMentionInput = (editor) => {
  const { selection } = editor;
  if (!selection) return;
  if (!Range.isCollapsed(selection)) return;
  const tempMentionInput = generateMentionTempInput();
  Editor.insertNode(editor, tempMentionInput);
};

export const getMentionTempIptEntry = (editor) => {
  const { selection } = editor;
  if (!selection) return false;
  if (!Range.isCollapsed(selection)) return false;
  const [match] = Editor.nodes(editor, {
    match: n => n.type === MENTION_TEMP,
    mode: 'lowest',
  });
  return match;
};

export const getMentionEntry = (editor) => {
  const { selection } = editor;
  if (!selection) return false;
  if (!Range.isCollapsed(selection)) return false;
  const [match] = Editor.nodes(editor, {
    match: n => n.type === MENTION,
    mode: 'lowest',
  });
  return match;
};

const generateMention = ({ name, username }) => {
  const id = slugid.nice();
  const type = MENTION;
  const children = [generateDefaultText()];
  children[0].text = '@' + name;
  return { id, type, children, username };
};

export const insertMention = (editor, collaborator) => {
  const { selection } = editor;
  if (!selection) return;
  if (!Range.isCollapsed(selection)) return;
  const mentionTempIptEntry = getMentionTempIptEntry(editor);
  if (!mentionTempIptEntry) return;
  const [, path] = mentionTempIptEntry;
  const [, focusPath] = Editor.next(editor, { at: path });
  const { name, username } = collaborator;
  const mention = generateMention({ name, username });
  Transforms.insertNodes(editor, mention, { at: focusPath, select: true });
};

// Sort collaborators by participants, move mentioned members to the top
export const sortCollaborators = (collaborators, participants = []) => {
  const loginEmail = context.getUserInfo().email;
  const lastModifyUser = context.getSetting('last_modify_user');
  let stickyCollaborator = null;
  const participantsMap = {};

  participants.forEach(item => {
    if (item.email === loginEmail) return;
    participantsMap[item.email] = item;
  });

  const newCollaborators = collaborators.filter(item => {
    const isValidCollaborator = !participantsMap[item.email] && item.email !== loginEmail;
    if (isValidCollaborator && lastModifyUser === item.email) {
      stickyCollaborator = item;
      return false;
    }
    return isValidCollaborator;
  });
  const newParticipants = Object.values(participantsMap);

  const resCollaborators = stickyCollaborator
    ? [stickyCollaborator, ...newParticipants, ...newCollaborators]
    : [...newParticipants, ...newCollaborators];

  return resCollaborators;
};

export const transformToText = (editor, isFocusEnd = true) => {
  const { selection } = editor;
  if (!selection) return;
  if (!Range.isCollapsed(selection)) return;
  const mentionTempIptEntry = getMentionTempIptEntry(editor);
  if (!mentionTempIptEntry) return;
  const [node, path] = mentionTempIptEntry;
  const [, insertPath] = Editor.next(editor, { at: path });
  const insertPoint = Editor.start(editor, insertPath);
  const { text } = node.children[0];
  const insertText = '@' + text;
  const pointRef = Editor.pointRef(editor, insertPoint);
  Transforms.insertText(editor, insertText, { at: insertPoint });
  Transforms.removeNodes(editor, { at: path });
  const focusPoint = pointRef.unref();
  isFocusEnd && focusEditor(editor, focusPoint);
};

export const getPrevMentionIptEntry = (editor) => {
  const prevNodeEntry = Editor.previous(editor);
  if (prevNodeEntry) {
    const aboveNodeEntry = Editor.above(editor, { match: n => n.type === MENTION_TEMP, at: prevNodeEntry[1] });
    return aboveNodeEntry;
  }
  return;
};

export const getPreCharacters = (editor) => {
  const { selection } = editor;
  const { anchor, focus } = selection;
  const path = Editor.path(editor, anchor);
  const startPoint = Editor.start(editor, path);
  const beforeStr = Editor.string(editor, { anchor: startPoint, focus, });
  return beforeStr;
};

export const getSelectionCoords = () => {
  let doc = window.document;
  let sel = doc.selection;
  let range;
  let rects;
  let rect;
  let x = 0;
  let y = 0;
  if (sel) {
    if (sel.type !== 'Control') {
      range = sel.createRange();
      range.collapse(true);
      x = range.boundingLeft;
      y = range.boundingTop;
    }
  } else if (window.getSelection) {
    sel = window.getSelection();
    if (sel.rangeCount) {
      range = sel.getRangeAt(0).cloneRange();
      if (range.getClientRects) {
        range.collapse(true);
        rects = range.getClientRects();
        if (rects.length > 0) {
          rect = rects[0];
        }
        // When the cursor is at the beginning of the line, rect is undefined
        if (rect) {
          x = rect.left;
          y = rect.top;
        }
      }
      // Fall back to inserting a temporary element
      if ((x === 0 && y === 0) || rect === undefined) {
        let span = doc.createElement('span');
        if (span.getClientRects) {
          // Ensure span has dimensions and position by
          // adding a zero-width space character
          span.appendChild(doc.createTextNode('\u200b'));
          range.insertNode(span);
          rect = span.getClientRects()[0];
          x = rect.left;
          y = rect.top;
          let spanParent = span.parentNode;
          spanParent.removeChild(span);
          // Glue any broken text nodes back together
          spanParent.normalize();
        }
      }
    }
  }
  return { x: x, y: y };
};
