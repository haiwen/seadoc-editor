import { createEditor } from '@seafile/slate';
import { withHistory } from '@seafile/slate-history';
import { withReact } from '@seafile/slate-react';
import Plugins, { CommentPlugins, WikiPlugins } from './plugins';
import renderElement from './render/render-element';
import renderLeaf from './render/render-leaf';
import { HeaderToolbar, ContextToolbar, SideToolbar } from './toolbar';

const baseEditor = withHistory(withReact(createEditor()));

const defaultEditor = (Plugins || [])?.reduce((editor, pluginItem) => {
  if (!pluginItem) return editor;
  const withPlugin = pluginItem.editorPlugin;
  if (withPlugin) {
    return withPlugin(editor);
  }
  return editor;
}, baseEditor);

export const createDefaultEditor = () => {
  const defaultEditor = Plugins?.reduce((editor, pluginItem) => {
    const withPlugin = pluginItem.editorPlugin;
    if (withPlugin) {
      return withPlugin(editor);
    }
    return editor;
  }, withHistory(withReact(createEditor())));

  return defaultEditor;
};

export const createWikiEditor = () => {
  const defaultEditor = WikiPlugins?.reduce((editor, pluginItem) => {
    const withPlugin = pluginItem.editorPlugin;
    if (withPlugin) {
      return withPlugin(editor);
    }
    return editor;
  }, withHistory(withReact(createEditor())));

  return defaultEditor;
};

export const createCommentEditor = () => {
  const defaultEditor = CommentPlugins?.reduce((editor, pluginItem) => {
    const withPlugin = pluginItem.editorPlugin;
    if (withPlugin) {
      return withPlugin(editor);
    }
    return editor;
  }, withHistory(withReact(createEditor())));

  return defaultEditor;
};

export default defaultEditor;

export {
  renderLeaf,
  renderElement,
  HeaderToolbar,
  ContextToolbar,
  SideToolbar
};
