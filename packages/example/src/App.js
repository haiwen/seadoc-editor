import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SimpleEditor, SimpleViewer, EXTERNAL_EVENT, EventBus, ShareLinkEditor } from '@seafile/seafile-sdoc-editor';
import Home from './pages/home';
import DiffViewer from './pages/diff-viewer';
import SdocWikiViewer from './pages/wiki-viewer';
import SdocWikiViewer2 from './pages/wiki-viewer-2';
import SdocWikiEditor from './pages/wiki-editor';
import Loading from './commons/loading';
import context from './context';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
    };
  }

  async componentDidMount() {
    await context.initApi();
    this.setState({ isLoading: false });
    const eventBus = EventBus.getInstance();
    eventBus.subscribe(EXTERNAL_EVENT.INTERNAL_LINK_CLICK, this.onInternalLinkClick);
  }

  onInternalLinkClick = () => {
    window.alert('Internal link click');
  };

  render() {
    const { isLoading } = this.state;
    if (isLoading) return <Loading />;

    const isSeaTable = context.getSetting('dtableUuid');

    let props = { showComment: true, showDocOperations: true };
    if (isSeaTable) {
      props = {
        showComment: false,
        showDocOperations: false
      };
    }

    return (
      <Routes primary={false} style={{ display: 'flex', width: '100%', height: '100%' }}>
        <Route path='/' element={<Home />}/>
        <Route path='/sdoc-editor' element={<SimpleEditor {...props} />}/>
        <Route path='/sdoc-viewer' element={<SimpleViewer />}/>
        <Route path='/sdoc-diff-viewer' element={<DiffViewer />}/>
        <Route path='/sdoc-wiki-viewer' element={<SdocWikiViewer />}/>
        <Route path='/sdoc-wiki-viewer-2' element={<SdocWikiViewer2 />}/>
        <Route path='/sdoc-wiki-editor' element={<SdocWikiEditor />}/>
        <Route path='/share-link-editor' element={<ShareLinkEditor showComment={false} collaborators={[]} />}/>
      </Routes>
    );
  }
}

export default App;
