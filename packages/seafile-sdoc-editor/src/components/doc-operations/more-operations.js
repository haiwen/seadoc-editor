import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import printJS from '@seafile/print-js';
import { EventBus, Tooltip, isMac, isMobile, context, LocalStorage, INTERNAL_EVENT, FULL_WIDTH_MODE, MenuShortcutPrompt } from '@seafile/sdoc-editor';
import PropTypes from 'prop-types';
import { EXTERNAL_EVENT } from '../../constants';
import Switch from '../switch';

const MoreOperations = ({ isStarred, t }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFullWidthMode, setIsFullWidthMode] = useState(LocalStorage.getItem(FULL_WIDTH_MODE));
  const parentFolderURL = context.getSetting('parentFolderURL');
  const isPro = context.getSetting('isPro');
  const isFreezed = context.getSetting('isFreezed');
  const docPerm = context.getSetting('docPerm');
  const historyURL = context.getSetting('historyURL');
  const isSdocRevision = context.getSetting('isSdocRevision');
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

  const onFreezeDocument = useCallback(() => {
    const eventBus = EventBus.getInstance();
    eventBus.dispatch(EXTERNAL_EVENT.FREEZE_DOCUMENT);
  }, []);

  const unFreeze = useCallback(() => {
    const eventBus = EventBus.getInstance();
    eventBus.dispatch(EXTERNAL_EVENT.UNFREEZE);
  }, []);

  const handleClickHistory = useCallback((event) => {
    if (docPerm !== 'rw' || !historyURL) return;
    if (isSdocRevision) return;
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    window.location.href = historyURL;
  }, [docPerm, historyURL, isSdocRevision]);

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

  const toggleStar = useCallback(() => {
    const eventBus = EventBus.getInstance();
    eventBus.dispatch(EXTERNAL_EVENT.TOGGLE_STAR);
  }, []);

  const onShareToggle = useCallback(() => {
    const eventBus = EventBus.getInstance();
    eventBus.dispatch(EXTERNAL_EVENT.SHARE_SDOC);
  }, []);

  const onInternalLinkClick = useCallback(() => {
    const eventBus = EventBus.getInstance();
    if (isSdocRevision) {
      eventBus.dispatch(EXTERNAL_EVENT.INTERNAL_LINK_CLICK, { internalLink: window.location.href });
      return;
    }
    eventBus.dispatch(EXTERNAL_EVENT.INTERNAL_LINK_CLICK);
  }, [isSdocRevision]);

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
        {mobileLogin && (
          <>
            <DropdownItem className='sdoc-dropdown-menu-item' onClick={toggleStar}>
              <div>{isStarred ? t('Collected') : t('Collect')}</div>
            </DropdownItem>
            <DropdownItem className='sdoc-dropdown-menu-item' onClick={onShareToggle}>
              {t('Share_1')}
            </DropdownItem>
            <DropdownItem className='sdoc-dropdown-menu-item' onClick={onInternalLinkClick}>
              {t('Internal_link')}
            </DropdownItem>
            <div className='sdoc-operator-folder-divider'></div>
          </>
        )}
        <DropdownItem className='sdoc-dropdown-menu-item' onClick={handlePrint}>
          <div className='sdoc-dropdown-print-container'>
            <div>{t('Print')}</div>
            <MenuShortcutPrompt shortcuts={printShortcutTexts} />
          </div>
        </DropdownItem>
        {isPro && isFreezed && (
          <DropdownItem className='sdoc-dropdown-menu-item' onClick={unFreeze}>
            {t('Unfreeze')}
          </DropdownItem>
        )}
        {isPro && !isFreezed && (
          <DropdownItem className='sdoc-dropdown-menu-item' onClick={onFreezeDocument}>
            {t('Freeze_document')}
          </DropdownItem>
        )}
        <DropdownItem className='sdoc-dropdown-menu-item' onClick={handleClickHistory}>
          {t('Document_history')}
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
        {parentFolderURL && (
          <>
            <div className='sdoc-operator-folder-divider'></div>
            <DropdownItem className='sdoc-dropdown-menu-item' tag="a" href={parentFolderURL}>
              {t('Open_parent_folder')}
            </DropdownItem>
          </>
        )}
      </DropdownMenu>
    </Dropdown>
  );
};

MoreOperations.propTypes = {
  isStarred: PropTypes.bool,
  t: PropTypes.func,
};

export default withTranslation('sdoc-editor')(MoreOperations);
