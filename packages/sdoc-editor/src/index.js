
import FileLoading from './components/file-loading';
import Loading from './components/loading';
import toaster from './components/toast';
import Tooltip from './components/tooltip';
import { INTERNAL_EVENT, FULL_WIDTH_MODE, PLUGIN_BTN_POSITION, WIKI_EDITOR, WIKI_EDITOR_EDIT_AREA_WIDTH } from './constants';
import context from './context';
import RevisionEditor from './editor/revision-editor';
import SDocEditor from './editor/sdoc-editor';
import WikiEditor from './editor/wiki-editor';
import { createWikiEditor } from './extension';
import DropdownMenuItem from './extension/commons/dropdown-menu-item';
import MenuShortcutPrompt from './extension/commons/menu-shortcut-indicator';
import { CollaboratorsProvider, useCollaborators } from './hooks/use-collaborators';
import { PluginsProvider, usePlugins } from './hooks/use-plugins';
import withNodeId from './node-id';
import SDocOutline from './outline';
import { mdStringToSlate, slateToMdString, deserializeHtml, processor } from './slate-convert';
import { withSocketIO } from './socket';
import { isMac, isMobile } from './utils/common-utils';
import { getTopLevelChanges, getMergedChanges } from './utils/diff';
import EventBus from './utils/event-bus';
import LocalStorage from './utils/local-storage-utils';
import { getRebase, hasConflict } from './utils/rebase';
import { DiffViewer, SDocViewer, PublishedRevisionDiffViewer, SDocWikiViewer } from './views';


export {
  Loading,
  toaster,
  Tooltip,
  FileLoading,
  SDocEditor,
  RevisionEditor,
  SDocViewer,
  SDocOutline,
  EventBus,
  DiffViewer,
  PublishedRevisionDiffViewer,
  SDocWikiViewer,
  mdStringToSlate,
  slateToMdString,
  processor, // md string to html
  deserializeHtml, // html -> slate notes
  isMac,
  isMobile,
  CollaboratorsProvider,
  useCollaborators,
  PluginsProvider,
  usePlugins,
  context,

  // diff
  getTopLevelChanges,
  getMergedChanges,
  getRebase,
  hasConflict,
  LocalStorage,
  INTERNAL_EVENT,
  FULL_WIDTH_MODE,
  PLUGIN_BTN_POSITION,
  MenuShortcutPrompt,
  DropdownMenuItem,
  WIKI_EDITOR, WIKI_EDITOR_EDIT_AREA_WIDTH,
  WikiEditor,
  createWikiEditor,
  withNodeId,
  withSocketIO,
};
