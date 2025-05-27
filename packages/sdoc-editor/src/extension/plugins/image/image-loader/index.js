import React from 'react';
import './index.css';

export default function ImageLoader({ copyright, isError }) {
  return (
    <div className='sdoc-image-process-container'>
      <div className='loading-spinner'>
        <div className='spinner'></div>
      </div>
      {copyright && <div className={`copyright ${isError && 'error'}`}>{copyright}</div>}
    </div>
  );
}
