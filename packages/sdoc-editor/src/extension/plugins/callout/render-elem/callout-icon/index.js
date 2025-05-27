import React, { useCallback } from 'react';
import { Transforms } from '@seafile/slate';
import { findPath } from '../../../../core';
import { CALLOUT_ICON_MAP } from '../../constant';
import { setCalloutIcon } from '../../helper';

import './style.css';

const IconSelector = ({ editor, element, onCloseSelector }) => {

  const onImageClick = useCallback((event) => {
    event.stopPropagation();
    const { image } = event.target.dataset;
    if (!image) return;
    const currentPath = findPath(editor, element);
    Transforms.select(editor, currentPath);
    setCalloutIcon(editor, image);
    onCloseSelector();
  }, [editor, element, onCloseSelector]);

  return (
    <div className='sdoc-callout-icon-selector-container' onClick={onImageClick}>
      {Object.keys(CALLOUT_ICON_MAP).map(key => {
        const content = CALLOUT_ICON_MAP[key];
        return (
          <div key={key} className='icon-item'>
            <span className={'sdoc-emoji ' + key} data-image={key}>{content}</span>
          </div>
        );
      })}
    </div>
  );
};

export default IconSelector;
