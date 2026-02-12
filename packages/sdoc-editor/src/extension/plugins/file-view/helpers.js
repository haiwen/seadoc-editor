import { Editor, Path, Transforms } from '@seafile/slate';
import { ReactEditor } from '@seafile/slate-react';
import slugid from 'slugid';
import context from '../../../context';
import { FILE_VIEW, INSERT_POSITION } from '../../constants';
import { focusEditor, generateDefaultParagraph, getNode } from '../../core';

export const getFileUrl = (element) => {
  const serviceUrl = context.getSetting('serviceUrl');
  const { data } = element;
  const { wiki_id, view_id } = data;
  return `${serviceUrl}/wiki/${wiki_id}/repo-views/${view_id}/`;
};

export const genFileViewNode = (data) => {
  return {
    id: slugid.nice(),
    type: FILE_VIEW,
    data: data,
    children: [
      { id: slugid.nice(), text: '' }
    ]
  };
};

export const insertFileView = (data, editor, position, slateNode) => {
  if (!data) return;
  if (!data.wiki_id || !data.file_repo_id) return;

  const fileViewNode = genFileViewNode(data);

  if (position === INSERT_POSITION.AFTER) {
    const path = Editor.path(editor, editor.selection);
    Transforms.insertNodes(editor, fileViewNode, { at: [path[0] + 1] });
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

  Transforms.insertNodes(editor, fileViewNode);
  return;
};

export const updateFileView = (newData, editor, element) => {
  const nodePath = ReactEditor.findPath(editor, element);
  Transforms.setNodes(editor, { data: newData }, { at: nodePath });
};

export const calculateSize = (e, position) => {
  const { clientX, clientY } = e;
  const { left, top } = position;
  const rightWidth = clientX - left;
  const bottomHeight = clientY - top;
  return {
    width: rightWidth < 300 ? 300 : rightWidth,
    height: bottomHeight < 200 ? 200 : bottomHeight,
  };
};
