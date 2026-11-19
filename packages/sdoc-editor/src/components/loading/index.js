import React from 'react';
import './style.css';

class Loading extends React.Component {
  render() {
    return (
      <div className="sdoc-empty-loading-page">
        <div className="sdoc-lds-ripple sdoc-page-centered"><div></div><div></div></div>
      </div>
    );
  }
}

export default Loading;
