import { Editor, Path, Transforms } from '@seafile/slate';
import slugid from 'slugid';
import context from '../../../context';
import { FILE_VIEW, INSERT_POSITION } from '../../constants';
import { focusEditor, generateDefaultParagraph, getNode } from '../../core';

export const getFileUrl = (element) => {
  const serviceUrl = context.getSetting('serviceUrl');
  const { data } = element;
  const wikiId = context.getSetting('wikiId');
  const { view_id } = data;
  return `${serviceUrl}/wiki/${wikiId}/repo-views/${view_id}/`;
};

export const getWikiSettings = () => {
  const wikiId = context.getSetting('wikiId');
  const WIKI_SETTING_INTO_KEY = `seafile_wiki_${wikiId}_settings_info`;
  const settings = window.localStorage.getItem(WIKI_SETTING_INTO_KEY);
  return JSON.parse(settings);
};

export const getAccessibleRepos = () => {
  const wikiId = context.getSetting('wikiId');
  const WIKI_REPO_INFO_KEY = `seafile_wiki_${wikiId}_repos_info`;
  const repos = window.localStorage.getItem(WIKI_REPO_INFO_KEY);
  return JSON.parse(repos);
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
  if (!data.view_name || !data.view_type || !data.link_repo_id) return;

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
