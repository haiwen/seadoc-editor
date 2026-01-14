import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { UncontrolledPopover } from 'reactstrap';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import Tooltip from '../../../../../components/tooltip';
import { FONT_SIZE } from '../../../../constants';
import { isMenuDisabled, getFontSize, setFontSize } from '../../helpers';

import './index.css';

const FontSize = ({
  isRichEditor = true,
  className = 'menu-group-item',
  editor,
  readonly
}) => {
  const [isShowMenu, setMenuShow] = useState(false);
  const { t } = useTranslation('sdoc-editor');
  const popoverRef = useRef(null);
  const disabled = isMenuDisabled(editor, readonly);
  const fontSizeButtonId = 'sdoc-button-font-size';
  let selectedFontSize = getFontSize(editor);

  const fontSizeRef = useRef(null);

  const toggle = useCallback((event) => {
    popoverRef.current.toggle();
    setMenuShow(!isShowMenu);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShowMenu]);

  const updateFontSize = useCallback((item) => {
    const fontSize = item.value;
    toggle();
    setFontSize(editor, fontSize);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, selectedFontSize, isShowMenu]);

  const validClassName = classnames(className, 'sdoc-menu-with-dropdown sdoc-font-size-menu', {
    'menu-show': isShowMenu,
    'disabled': disabled,
    'rich-icon-btn d-flex': isRichEditor,
    'rich-icon-btn-disabled': isRichEditor && disabled,
    'rich-icon-btn-hover': isRichEditor && !disabled,
    'btn btn-icon btn-secondary btn-active d-flex': !isRichEditor,
  });

  const caretIconClass = `sdoc-menu-with-dropdown-triangle-icon sdocfont sdoc-${isShowMenu ? 'arrow-up' : 'arrow-down'}`;
  const { bottom } = fontSizeRef.current ? fontSizeRef.current.getBoundingClientRect() : { bottom: 92.5 };

  return (
    <>
      <button type="button" className={validClassName} id={fontSizeButtonId} disabled={disabled} ref={fontSizeRef}>
        <div className="sdoc-menu-with-dropdown-icon">
          <div className="text-truncate">{selectedFontSize}</div>
        </div>
        {!disabled && (
          <div className="sdoc-menu-with-dropdown-triangle">
            <span className={caretIconClass}></span>
          </div>
        )}
      </button>
      <Tooltip target={fontSizeButtonId}>
        {t('Font_size')}
      </Tooltip>
      {!disabled && (
        <UncontrolledPopover
          target={fontSizeButtonId}
          className="sdoc-menu-popover sdoc-dropdown-menu sdoc-font-size-menu-popover"
          trigger="legacy"
          placement="bottom-start"
          hideArrow={true}
          toggle={toggle}
          fade={false}
          ref={popoverRef}
        >
          <div className="sdoc-font-size-menu-container" style={{ maxHeight: window.innerHeight - bottom - 100 }}>
            {FONT_SIZE.map((item, index) => {
              const isSelected = selectedFontSize + '' === item.name;
              return (
                <div
                  key={index}
                  className={classnames('sdoc-dropdown-menu-item', { 'position-relative': isSelected } )}
                  onClick={() => updateFontSize(item)}
                >
                  {isSelected && (<i className="sdocfont sdoc-check-mark"></i>)}
                  {item.name}
                </div>
              );
            })}
          </div>
        </UncontrolledPopover>
      )}
    </>
  );

};

FontSize.propTypes = {
  readonly: PropTypes.bool,
  isRichEditor: PropTypes.bool,
  className: PropTypes.string,
  editor: PropTypes.object,
};

export default FontSize;
