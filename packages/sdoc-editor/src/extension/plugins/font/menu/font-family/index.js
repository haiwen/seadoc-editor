import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UncontrolledPopover } from 'reactstrap';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import Tooltip from '../../../../../components/tooltip';
import context from '../../../../../context';
import LocalStorage from '../../../../../utils/local-storage-utils';
import ObjectUtils from '../../../../../utils/object-utils';
import { FONT, RECENT_USED_FONTS_KEY, DEFAULT_FONT } from '../../../../constants';
import { isMenuDisabled, getFont, setFont } from '../../helpers';
import FontItem from './font-item';

import './index.css';

const FontFamily = ({
  isRichEditor = true,
  className = 'menu-group-item',
  editor,
  readonly
}) => {
  const [recentUsedFonts, setRecentUsedFonts] = useState(LocalStorage.getItem(RECENT_USED_FONTS_KEY, []));
  const [isShowMenu, setMenuShow] = useState(false);
  const [fontList, setFontList] = useState(FONT);
  const { t } = useTranslation('sdoc-editor');
  const popoverRef = useRef(null);
  const disabled = isMenuDisabled(editor, readonly);
  const fontSizeButtonId = 'sdoc-button-font';
  let selectedFont = getFont(editor);
  const lang = context.getSetting('lang');

  useEffect(() => {
    if (lang === 'zh-cn') {
      const chineseFonts = FONT.filter(item => ObjectUtils.hasProperty(item, 'langOrder'));
      chineseFonts.sort((a, b) => b['langOrder'][lang] - a['langOrder'][lang]);
      const others = FONT.filter(item => !ObjectUtils.hasProperty(item, 'langOrder'));
      setFontList([...chineseFonts, ...others]);
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validClassName = classnames(className, 'sdoc-menu-with-dropdown sdoc-font-family-menu', {
    'menu-show': isShowMenu,
    'disabled': disabled,
    'rich-icon-btn d-flex': isRichEditor,
    'rich-icon-btn-disabled': isRichEditor && disabled,
    'rich-icon-btn-hover': isRichEditor && !disabled,
    'btn btn-icon btn-secondary btn-active d-flex': !isRichEditor,
  });

  const fontRef = useRef(null);

  const toggle = useCallback((event) => {
    popoverRef.current.toggle();
    setMenuShow(!isShowMenu);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShowMenu]);

  const caretIconClass = `sdoc-menu-with-dropdown-triangle-icon sdocfont sdoc-${isShowMenu ? 'arrow-up' : 'arrow-down'}`;
  const { bottom } = fontRef.current ? fontRef.current.getBoundingClientRect() : { bottom: 92.5 };

  const updateFont = useCallback((fontName) => {
    toggle();
    setFont(editor, fontName);
    if (recentUsedFonts[0] !== fontName) {
      const fontNameIndex = recentUsedFonts.findIndex(item => item === fontName);
      let newRecentUsedFonts;
      if (fontNameIndex === -1) {
        newRecentUsedFonts = recentUsedFonts.slice(0, 9);
      } else {
        newRecentUsedFonts = recentUsedFonts.slice(0);
        newRecentUsedFonts.splice(fontNameIndex, 1);
      }
      newRecentUsedFonts.unshift(fontName);
      LocalStorage.setItem(RECENT_USED_FONTS_KEY, newRecentUsedFonts);
      setRecentUsedFonts(newRecentUsedFonts);
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFont, editor, isShowMenu, recentUsedFonts]);

  return (
    <>
      <button type="button" className={validClassName} id={fontSizeButtonId} disabled={disabled} ref={fontRef}>
        <div className="sdoc-menu-with-dropdown-icon">
          <div>{selectedFont === DEFAULT_FONT ? t('Default_font') : selectedFont}</div>
        </div>
        {!disabled && (
          <div className="sdoc-menu-with-dropdown-triangle">
            <span className={caretIconClass}></span>
          </div>
        )}
      </button>
      {!isShowMenu && (
        <Tooltip target={fontSizeButtonId}>
          {t('Font')}
        </Tooltip>
      )}
      {!disabled && (
        <UncontrolledPopover
          target={fontSizeButtonId}
          className="sdoc-font-size-menu-popover sdoc-font-family-menu-popover"
          popperClassName="sdoc-popover-box-shadow"
          trigger="legacy"
          placement="bottom-start"
          hideArrow={true}
          toggle={toggle}
          fade={false}
          ref={popoverRef}
        >
          <div className="sdoc-dropdown-menu sdoc-font-size-menu-container" style={{ maxHeight: window.innerHeight - bottom - 100 }}>
            {Array.isArray(recentUsedFonts) && recentUsedFonts.length > 0 && (
              <>
                <div className="sdoc-dropdown-menu-title-name">{t('Recently_used')}</div>
                <div className="sdoc-dropdown-menu-divider my-1"></div>
                {recentUsedFonts.map((item, index) => {
                  const fontObject = FONT.find(font => font.name === item);
                  return (
                    <FontItem key={`${index}-recently-used`} fontObject={fontObject} selectedFont={selectedFont} setFont={updateFont} />
                  );
                })}
                <div className="h-3"></div>
              </>
            )}
            <div className="sdoc-dropdown-menu-title-name">{t('All_fonts')}</div>
            <div className="sdoc-dropdown-menu-divider my-1"></div>
            {fontList.map((item, index) => {
              return (
                <FontItem key={`${index}-all-font`} fontObject={item} selectedFont={selectedFont} setFont={updateFont} />
              );
            })}
          </div>
        </UncontrolledPopover>
      )}
    </>
  );
};

FontFamily.propTypes = {
  readonly: PropTypes.bool,
  editor: PropTypes.object.isRequired,
};

export default FontFamily;
