import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { ElementPopover } from '../../../../commons';
import { setCalloutIcon } from '../../helper';
import ColorSelector from '../callout-color-selector';
import IconSelector from '../callout-icon';

import './style.css';

export default function CalloutHoverMenu({ editor, element, popoverPosition }) {
  const [isShowColorSelector, setIsShowColorSelector] = useState(false);
  const [isShowIcon, setIsShowIcon] = useState(false);
  const { t } = useTranslation('sdoc-editor');

  const onColorSelectorToggle = useCallback((event) => {
    event.stopPropagation();
    if (!isShowColorSelector) {
      setIsShowIcon(false);
    }
    setIsShowColorSelector(!isShowColorSelector);
  }, [isShowColorSelector, setIsShowColorSelector]);

  const onIconToggle = useCallback((event) => {
    event.stopPropagation();
    if (!isShowIcon) {
      setIsShowColorSelector(false);
    }
    setIsShowIcon(!isShowIcon);
  }, [isShowIcon, setIsShowIcon]);

  const onCloseSelector = useCallback(() => {
    setIsShowColorSelector(false);
    setIsShowIcon(false);
  }, []);

  const firstItemClass = classNames({
    'callout-menu-item': true,
    'color-active': isShowColorSelector,
  });

  const secondItemClass = classNames({
    'callout-menu-item': true,
    'icon-active': isShowIcon,
  });

  const handleRemoveIcon = () => {
    setCalloutIcon(editor, '');
  };

  return (
    <ElementPopover>
      <div className="sdoc-callout-hover-menu" style={popoverPosition}>
        <div className={firstItemClass} onClick={onColorSelectorToggle}>
          <span className='sdocfont sdoc-callout-color mr-1'></span>
          <span className='sdocfont sdoc-drop-down'></span>
        </div>
        <div className='callout-menu-divider'></div>
        <div className={secondItemClass} onClick={onIconToggle}>
          <span className='sdocfont sdoc-callout-icon mr-1'></span>
          <span className='sdocfont sdoc-drop-down'></span>
        </div>
        {isShowColorSelector && (
          <ColorSelector editor={editor} element={element} onCloseSelector={onCloseSelector} />
        )}
        {isShowIcon && (
          <IconSelector editor={editor} element={element} onCloseSelector={onCloseSelector} />
        )}
        <div className='callout-menu-divider'></div>
        <div className='callout-menu-item' onClick={handleRemoveIcon}>{t('Remove_icon')}</div>
      </div>
    </ElementPopover>
  );
}
