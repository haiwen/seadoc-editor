import { Editor, Path, Range, Transforms } from '@seafile/slate';
import slugid from 'slugid';
import { INTERNAL_EVENT } from '../../../constants';
import context from '../../../context';
import EventBus from '../../../utils/event-bus';
import { CODE_BLOCK, INSERT_POSITION, SUBTITLE, TITLE, LIST_ITEM, CHECK_LIST_ITEM, MULTI_COLUMN, BLOCKQUOTE, CALL_OUT, WHITEBOARD } from '../../constants';
import { focusEditor, generateDefaultParagraph, getNode, getNodeType, getParentNode, isTextNode } from '../../core';

export const isInsertWhiteboardMenuDisabled = (editor, readonly) => {
  if (readonly) return true;
  const { selection } = editor;
  if (selection === null) return true;
  if (!Range.isCollapsed(selection)) return true;

  const [match] = Editor.nodes(editor, {
    match: n => {
      let type = getNodeType(n);
      if (!type && isTextNode(n) && n.id) {
        const parentNode = getParentNode(editor.children, n.id);
        type = getNodeType(parentNode);
      }

      if (type === CODE_BLOCK) return true;
      if (type.startsWith('header')) return true;
      if (type === TITLE) return true;
      if (type === SUBTITLE) return true;
      if (type === LIST_ITEM) return true;
      if (type === CHECK_LIST_ITEM) return true;
      if (type === MULTI_COLUMN) return true;
      if (type === BLOCKQUOTE) return true;
      if (type === CALL_OUT) return true;
      if (Editor.isVoid(editor, n)) return true;

      return false;
    },
    universal: true,
  });

  if (match) return true;

  return false;
};

export const generateWhiteboardNode = (repoID, filename = '', filePath, exdrawReadOnlyLink) => {
  const whiteboardNode = {
    id: slugid.nice(),
    type: WHITEBOARD,
    repo_id: repoID,
    title: filename,
    file_path: filePath,
    link: exdrawReadOnlyLink,
    children: [{
      id: slugid.nice(),
      text: '',
    }],
  };

  return whiteboardNode;
};

export const insertWhiteboard = async (editor, filename, filePath, repoId) => {
  if (isInsertWhiteboardMenuDisabled(editor)) return;
  if (editor.selection == null) return;

  let repoID = repoId;
  if (!repoId) {
    repoID = context.getSetting('repoID');
  }

  const eventBus = EventBus.getInstance();
  const exdrawReadOnlyLink = await new Promise((resolve) => {
    eventBus.dispatch(INTERNAL_EVENT.GENERATE_EXDRAW_READ_ONLY_LINK, {
      repoID,
      filePath,
      onSuccess: (link) => {
        resolve(link);
      },
    });
  });

  const whiteboardNode = generateWhiteboardNode(repoID, filename, filePath, exdrawReadOnlyLink);

  let path = editor.selection?.anchor.path;
  const position = 'after';
  if (position === INSERT_POSITION.AFTER) {
    Transforms.insertNodes(editor, whiteboardNode, { at: [path[0] + 1] });
    const nextPath = Path.next([path[0] + 1]);
    if (!getNode(editor, nextPath)) {
      Transforms.insertNodes(editor, generateDefaultParagraph(), { at: nextPath });
    }
    const endOfFirstNode = Editor.start(editor, nextPath);
    const range = {
      anchor: endOfFirstNode,
      focus: endOfFirstNode,
    };
    focusEditor(editor, range);
    return;
  }
};

export const onCreateWhiteboardFile = (editor) => {
  const eventBus = EventBus.getInstance();
  const external_props = {
    insertWhiteboard,
    fileType: 'exdraw',
    editor,
  };

  eventBus.dispatch(INTERNAL_EVENT.CREATE_WHITEBOARD_FILE, { ...external_props });
};
