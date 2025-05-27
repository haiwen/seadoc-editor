import React, { useCallback } from 'react';
import { Transforms } from '@seafile/slate';
import { findPath } from '../../../../core';
import { CALLOUT_COLOR_MAP } from '../../constant';
import { changeFillBackgroundColor } from '../../helper';

import './style.css';

const ColorSelector = ({ editor, element, onCloseSelector }) => {

  const onColorClick = useCallback((event) => {
    event.stopPropagation();
    let target = event.target;
    while (!target.dataset || !target.dataset.backgroundColor) {
      target = target.parentNode;
    }
    const { backgroundColor } = target.dataset;
    const currentPath = findPath(editor, element);
    Transforms.select(editor, currentPath);
    changeFillBackgroundColor(editor, backgroundColor);
    onCloseSelector();
  }, [editor, element, onCloseSelector]);

  const isShowCheckedIcon = useCallback((currentBackgroundColor) => {
    const { background_color } = element.style || {};
    return background_color && background_color === currentBackgroundColor;
  }, [element.style]);

  return (
    <div
      className='sdoc-callout-color-selector-container'
      contentEditable={false}
    >
      <ul className='sdoc-color-selector-list'>
        {Object
          .values(CALLOUT_COLOR_MAP)
          .map(({ border_color, background_color }, index) =>
            <li
              key={`sdoc-callout-color-selector-${index}`}
              className='sdoc-callout-color-item'
              data-border-color={border_color}
              data-background-color={background_color}
              style={{
                borderColor: border_color,
                backgroundColor: background_color
              }}
              onClick={onColorClick}
            >
              {isShowCheckedIcon(background_color) && <i className='sdoc-callout-color-checked-icon sdocfont sdoc-check-mark'></i>}
            </li>
          )}
      </ul>
    </div>
  );
};

export default ColorSelector;
