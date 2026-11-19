import React from 'react';
import './index.css';

export default function ImageLoader({ copyright, isError }) {
  return (
    <div className='sdoc-image-process-container'>
      <div className='sdoc-loading-spinner'>
        <div className='spinner'></div>
      </div>
      {copyright && <div className={`sdoc-copyright ${isError && 'error'}`}>{copyright}</div>}
    </div>
  );
}
