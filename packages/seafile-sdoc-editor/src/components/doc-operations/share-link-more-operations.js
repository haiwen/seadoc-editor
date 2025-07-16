import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import printJS from '@seafile/print-js';
import { EventBus, Tooltip, isMac, isMobile, context, LocalStorage, INTERNAL_EVENT, FULL_WIDTH_MODE, MenuShortcutPrompt } from '@seafile/sdoc-editor';
import PropTypes from 'prop-types';
import Switch from '../switch';

const ShareLinkMoreOperations = ({ t }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFullWidthMode, setIsFullWidthMode] = useState(LocalStorage.getItem(FULL_WIDTH_MODE));
  const mobileLogin = context.getSetting('mobileLogin');
  const cssUrls = context.getPrintCss();
  const id = 'sdoc_more_operation';

  useEffect(() => {
    const eventBus = EventBus.getInstance();
    const unSubscribe = eventBus.subscribe(INTERNAL_EVENT.ON_PRINT, handlePrint);
    return () => {
      unSubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleDropdown = useCallback((event, isDropdownOpen) => {
    if (isDropdownOpen) {
      // Clicking the fullscreen menu does not close the collapsed menu
      const el = document.getElementById('sdoc-full-width-mode-wrapper');
      if (el && el.contains(event.target)) return;
    }
    setIsDropdownOpen(!isDropdownOpen);
  }, []);

  const handlePrint = useCallback(() => {
    printJS({
      printable: 'sdoc-editor-print-wrapper',
      type: 'html',
      scanStyles: true,
      targetStyles: ['*'],
      style: '@page { size: auto A4 landscape;margin:20px auto; padding: 0;} .d-print-none{display:none !important;} .article {border: none !important; box-shadow: none !important; } html, body {margin: 0; padding: 0}',
      css: cssUrls,
    });
  }
  , [cssUrls]);


  const printShortcutTexts = useMemo(() => {
    const printTexts = isMac() ? ['⌘', 'P'] : ['Ctrl', 'P'];
    return printTexts;
  }, []);

  const onSwitchMode = useCallback(() => {
    const newMode = !isFullWidthMode;
    LocalStorage.setItem(FULL_WIDTH_MODE, newMode);
    const eventBus = EventBus.getInstance();
    eventBus.dispatch(INTERNAL_EVENT.RESIZE_ARTICLE);
    setIsFullWidthMode(newMode);
  }, [isFullWidthMode]);


  return (
    <Dropdown
      className={`sdoc-operator-folder ${mobileLogin ? 'mobile-login' : ''}`}
      isOpen={isDropdownOpen}
      toggle={(event) => toggleDropdown(event, isDropdownOpen)}
    >
      <DropdownToggle id={id} className="op-item" tag="span">
        <i className='sdocfont sdoc-more'></i>
      </DropdownToggle>
      <Tooltip target={id}>
        {t('More_operation')}
      </Tooltip>
      <DropdownMenu className="sdoc-dropdown-menu" end>
        <DropdownItem className='sdoc-dropdown-menu-item' onClick={handlePrint}>
          <div className='sdoc-dropdown-print-container'>
            <div>{t('Print')}</div>
            <MenuShortcutPrompt shortcuts={printShortcutTexts} />
          </div>
        </DropdownItem>
        {!isMobile && (
          <DropdownItem id='sdoc-full-width-mode-wrapper' className='sdoc-dropdown-menu-item'>
            <Switch
              checked={isFullWidthMode}
              placeholder={t('Full_width_mode')}
              className="sdoc-full-width-mode-wrapper w-100"
              onChange={onSwitchMode}
            />
          </DropdownItem>
        )}
      </DropdownMenu>
    </Dropdown>
  );
};

ShareLinkMoreOperations.propTypes = {
  isStarred: PropTypes.bool,
  t: PropTypes.func,
};

export default withTranslation('sdoc-editor')(ShareLinkMoreOperations);
