import BlockquotePlugin from './blockquote';
import CalloutPlugin from './callout';
import CheckListPlugin from './check-list';
import CodeBlockPlugin from './code-block';
import FileLinkPlugin from './file-link';
import FileViewPlugin from './file-view';
import FontPlugin from './font';
import FormulaPlugin from './formula';
import GroupPlugin from './group';
import HeaderPlugin from './header';
import HtmlPlugin from './html';
import ImagePlugin from './image';
import LinkPlugin from './link';
import ListPlugin from './list';
import MarkDownPlugin from './markdown';
import MentionPlugin from './mention';
import MultiColumnPlugin from './multi-column';
import ParagraphPlugin from './paragraph';
import QuickInsertPlugin from './quick-insert';
import SdocLinkPlugin from './sdoc-link';
import SearchReplacePlugin from './search-replace';
import TablePlugin from './table';
import TextAlignPlugin from './text-align';
import TextPlugin from './text-style';
import VideoPlugin from './video';
import WhiteboardPlugin from './whiteboard';
import WikiLinkPlugin from './wiki-link';

const Plugins = [
  MarkDownPlugin,
  HtmlPlugin,
  HeaderPlugin,
  LinkPlugin,
  BlockquotePlugin,
  ListPlugin,
  CheckListPlugin,
  CodeBlockPlugin,
  ImagePlugin,
  VideoPlugin,
  TablePlugin,
  MultiColumnPlugin,
  TextPlugin,
  TextAlignPlugin,
  FontPlugin,
  SdocLinkPlugin,
  ParagraphPlugin,
  FileLinkPlugin,
  CalloutPlugin,
  SearchReplacePlugin,
  QuickInsertPlugin,
  GroupPlugin,
  WhiteboardPlugin,
  FileViewPlugin,
  FormulaPlugin
];

const WikiPlugins = [
  ...Plugins,
  WikiLinkPlugin,
  FileViewPlugin,
];

const CommentPlugins = [
  MarkDownPlugin,
  HtmlPlugin,
  ParagraphPlugin,
  TextPlugin,
  ListPlugin,
  ImagePlugin,
  LinkPlugin,
  MentionPlugin,
  BlockquotePlugin,
];

export default Plugins;
export {
  MarkDownPlugin,
  HeaderPlugin,
  LinkPlugin,
  BlockquotePlugin,
  ListPlugin,
  CheckListPlugin,
  CodeBlockPlugin,
  ImagePlugin,
  VideoPlugin,
  TablePlugin,
  MultiColumnPlugin,
  TextPlugin,
  HtmlPlugin,
  TextAlignPlugin,
  FontPlugin,
  SdocLinkPlugin,
  ParagraphPlugin,
  FileLinkPlugin,
  CalloutPlugin,
  SearchReplacePlugin,
  MentionPlugin,
  QuickInsertPlugin,
  CommentPlugins,
  WikiPlugins,
  WikiLinkPlugin,
  GroupPlugin,
  WhiteboardPlugin,
  FileViewPlugin,
  FormulaPlugin,
};
