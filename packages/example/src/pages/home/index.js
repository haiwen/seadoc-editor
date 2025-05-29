import { NavLink as Link } from 'react-router-dom';
import React from 'react';

import './style.css';

class Home extends React.Component {

  render() {
    return (
      <div className="app">
        <div className='header'>Sdoc Editor 测试页面</div>
        <div className='nav-container'>
          <Link to='/sdoc-editor'>Sdoc Editor</Link>
          <Link to='/sdoc-viewer'>Sdoc Viewer</Link>
          <Link to='/sdoc-diff-viewer'>Sdoc Diff Viewer</Link>
          <Link to='/sdoc-wiki-viewer'>Sdoc Wiki Viewer</Link>
          <Link to='/sdoc-wiki-viewer-2'>Sdoc wiki Viewer 2</Link>
          <Link to='/sdoc-wiki-editor'>Sdoc wiki editor</Link>
        </div>
        <div className='tip-message'>请点击上面链接，测试不同的编辑器功能</div>
      </div>
    );
  }
}

export default Home;
