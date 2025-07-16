import { SDocViewer, EventBus } from '@seafile/sdoc-editor';
import DocInfo from './components/doc-info';
import { EXTERNAL_EVENT } from './constants';
import DiffViewer from './pages/diff-viewer';
import PublishedRevisionViewer from './pages/published-revision-viewer';
import SdocWikiEditor from './pages/sdoc-wiki-editor';
import ShareLinkEditor from './pages/share-link-editor';
import SimpleEditor from './pages/simple-editor';
import SimpleViewer from './pages/simple-viewer';
import WikiViewer from './pages/wiki-viewer';

export {
  SDocViewer,
  SimpleEditor,
  SimpleViewer,
  EventBus,
  EXTERNAL_EVENT,
  DiffViewer,
  PublishedRevisionViewer,
  WikiViewer,
  DocInfo,
  SdocWikiEditor,
  ShareLinkEditor,
};
