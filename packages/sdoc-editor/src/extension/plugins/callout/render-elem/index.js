/* eslint-disable react-hooks/rules-of-hooks */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Node } from '@seafile/slate';
import { useReadOnly, useSelected } from '@seafile/slate-react';
import { INTERNAL_EVENT } from '../../../../constants';
import { useScrollContext } from '../../../../hooks/use-scroll-context';
import EventBus from '../../../../utils/event-bus';
import { getMenuPosition } from '../../../utils';
import { CALLOUT_COLOR_MAP, CALLOUT_ICON_MAP } from '../constant';
import CalloutHoverMenu from './callout-hover-menu';

import './index.css';

const renderCallout = ({ attributes, children, element }, editor) => {
  const readOnly = useReadOnly();
  const scrollRef = useScrollContext();
  const isSelected = useSelected();
  const { t } = useTranslation('sdoc-editor');

  const calloutRef = useRef();
  const [isShowColorSelector, setIsShowColorSelector] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: '', left: '' });

  const containerStyle = useMemo(() => {
    const { background_color = 'transparent' } = element.style;
    let borderColor = 'transparent';
    if (isSelected) {
      borderColor = CALLOUT_COLOR_MAP[background_color]?.border_color;
    }

    return { backgroundColor: background_color, borderColor };
  }, [element.style, isSelected]);

  const calloutIcon = useMemo(() => {
    const { callout_icon = '' } = element;
    if (!callout_icon) return null;
    return CALLOUT_ICON_MAP[callout_icon];
  }, [element]);

  const isShowPlaceholder = useCallback(() => {
    if (readOnly || isSelected) return false;
    // If element contains more than one element or element is not paragraph, show placeholder
    const isContainUnitElement = element.children.length !== 1 || element.children.some(childElement => childElement.type !== 'paragraph');
    if (isContainUnitElement) return false;

    const elementContent = Node.string(element);
    return !elementContent.length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element, isSelected]);

  const handleCloseColorSelector = useCallback(() => {
    setIsShowColorSelector(false);
  }, []);

  const handleScroll = useCallback((e) => {
    if (readOnly) return;
    if (!isShowColorSelector) return;
    if (e.currentTarget.scrollTop) {
      const menuPosition = getMenuPosition(calloutRef.current, editor);
      setPopoverPosition(menuPosition);
    }
  }, [editor, isShowColorSelector, readOnly]);

  useEffect(() => {
    const eventBus = EventBus.getInstance();
    const unsubscribe = eventBus.subscribe(INTERNAL_EVENT.CLOSE_CALLOUT_COLOR_PICKER, handleCloseColorSelector);
    return unsubscribe;
  }, [handleCloseColorSelector]);

  useEffect(() => {
    if (readOnly) return;
    let observerRefValue = null;
    if (scrollRef.current) {
      scrollRef.current.addEventListener('scroll', handleScroll);
      observerRefValue = scrollRef.current;
    }

    return () => {
      observerRefValue.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, readOnly, scrollRef]);

  useEffect(() => {
    if (!isSelected) {
      setIsShowColorSelector(false);
    }
  }, [isSelected]);

  const handleDisplayColorSelector = useCallback(() => {
    if (readOnly) return;
    const menuPosition = getMenuPosition(calloutRef.current, editor);
    setPopoverPosition(menuPosition);
    setIsShowColorSelector(true);
  }, [editor, readOnly]);

  const handleClick = useCallback((e) => {
    handleDisplayColorSelector();
  }, [handleDisplayColorSelector]);

  return (
    <div
      {...attributes}
      data-id={element.id}
      className='sdoc-callout-white-wrapper'
    >
      <div
        onClick={handleClick}
        ref={calloutRef}
        className={`${attributes.className} sdoc-callout-container`}
        style={containerStyle}
      >
        {element.callout_icon && (
          <div className='callout-icon'>
            <span className={'sdoc-emoji ' + element.callout_icon}>{calloutIcon}</span>
          </div>
        )}
        <div className='callout-content'>
          {children}
          {isShowPlaceholder() && <div contentEditable={false} className='sdoc-callout-placeholder'>{t('Please_enter')}...</div>}
        </div>
        {isShowColorSelector && (
          <CalloutHoverMenu
            editor={editor}
            element={element}
            popoverPosition={popoverPosition}
          />
        )}
      </div>
    </div>
  );
};

export default renderCallout;
