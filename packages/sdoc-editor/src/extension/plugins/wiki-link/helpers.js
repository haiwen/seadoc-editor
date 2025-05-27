import { Editor, Transforms, Range } from '@seafile/slate';
import slugid from 'slugid';
import context from '../../../context';
import { INSERT_FILE_DISPLAY_TYPE } from '../../constants';
import { WIKI_LINK } from '../../constants/element-type';
import { isMenuDisabled, removeShortCutSymbol } from '../sdoc-link/helpers';

export const insertWikiPageLink = (editor, text, wikiRepoId, pageId, icon, isDir) => {
  if (isMenuDisabled(editor)) return;
  // Selection folded or not
  const { selection } = editor;
  if (selection == null) return;
  const isCollapsed = Range.isCollapsed(selection);

  // Remove shortcut symbol,if trigger by shortcut
  removeShortCutSymbol(editor);

  const wikiLinkNode = generateWikiFileNode(wikiRepoId, pageId, text, icon, isDir);

  if (isCollapsed) {
    Transforms.insertNodes(editor, wikiLinkNode);
  } else {
    const selectedText = Editor.string(editor, selection); // Selected text
    if (selectedText !== text) {
      // If the selected text is different from the typed text, delete the text and insert the link
      editor.deleteFragment();
      Transforms.insertNodes(editor, wikiLinkNode);
    } else {
      // If the selected text is the same as the entered text, only the link can be wrapped
      Transforms.wrapNodes(editor, wikiLinkNode, { split: true });
      Transforms.collapse(editor, { edge: 'end' });
    }
  }
};

export const generateWikiFileNode = (wikiRepoId, pageId, title = '', icon, isDir) => {
  const wikiPageLinkNode = {
    id: slugid.nice(),
    type: WIKI_LINK,
    wiki_repo_id: wikiRepoId,
    page_id: pageId,
    title: title,
    icon,
    isDir,
    display_type: INSERT_FILE_DISPLAY_TYPE[1],
    children: [{
      id: slugid.nice(),
      text: title
    }],
  };
  return wikiPageLinkNode;
};

export const getWikiUrl = (wikiRepoId, pageId, readOnly) => {
  if (readOnly) {
    const siteRoot = context.getSetting('siteRoot');
    const publishUrl = context.getSetting('publishUrl');
    const DEFAULT_URL = 'wiki/publish';
    return `${siteRoot}${DEFAULT_URL}/${publishUrl}/${pageId}/`;
  }

  const siteRoot = context.getSetting('siteRoot');
  return `${siteRoot}wikis/${wikiRepoId}/${pageId}/`;
};
