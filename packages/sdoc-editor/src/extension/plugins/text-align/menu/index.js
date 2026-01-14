import React, { useRef, useState, useCallback } from 'react';
import { useTranslation, withTranslation } from 'react-i18next';
import { UncontrolledPopover } from 'reactstrap';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import Tooltip from '../../../../components/tooltip';
import { TEXT_ALIGN, MENUS_CONFIG_MAP } from '../../../constants';
import { getAlignType, isMenuDisabled, setAlignType } from '../helpers';

import './index.css';

const TextAlignMenu = ({
  isRichEditor = true,
  className = 'menu-group-item',
  editor,
  readonly
}) => {
  const [isShowMenu, setMenuShow] = useState(false);
  const popoverRef = useRef(null);
  const disabled = isMenuDisabled(editor, readonly);
  const buttonId = 'sdoc-button-text-align';
  const { t } = useTranslation('sdoc-editor');

  const toggle = useCallback((event) => {
    popoverRef.current.toggle();
    setMenuShow(!isShowMenu);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShowMenu]);

  const getCurrentType = useCallback(() => {
    return getAlignType(editor);
  }, [editor]);

  const setType = useCallback((type) => {
    setAlignType(editor, type);
    toggle();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, isShowMenu]);

  const validClassName = classnames(className, 'sdoc-menu-with-dropdown', {
    'menu-show': isShowMenu,
    'disabled': disabled,
    'rich-icon-btn d-flex': isRichEditor,
    'rich-icon-btn-disabled': isRichEditor && disabled,
    'rich-icon-btn-hover': isRichEditor && !disabled,
    'btn btn-icon btn-secondary btn-active d-flex': !isRichEditor,
  });

  let curType = getCurrentType();
  const curIcon = MENUS_CONFIG_MAP[TEXT_ALIGN].filter(item => item.type === curType)[0].iconClass;
  const caretIconClass = `sdoc-menu-with-dropdown-triangle-icon sdocfont sdoc-${isShowMenu ? 'arrow-up' : 'arrow-down'}`;
  curType = 'align_' + curType;

  return (
    <>
      <button type="button" aria-label='text align' className={validClassName} id={buttonId} disabled={disabled}>
        <div className="sdoc-menu-with-dropdown-icon">
          <span className={curIcon}></span>
        </div>
        {!disabled && (
          <div className="sdoc-menu-with-dropdown-triangle">
            <span className={caretIconClass}></span>
          </div>
        )}
      </button>
      <Tooltip target={buttonId} >{ t('Alignment_type')}</Tooltip>
      {!disabled && (
        <UncontrolledPopover
          target={buttonId}
          className="sdoc-menu-popover sdoc-dropdown-menu sdoc-text-align-dropdown"
          trigger="legacy"
          placement="bottom-start"
          hideArrow={true}
          toggle={toggle}
          fade={false}
          ref={popoverRef}
        >
          <div className="pt-2 pb-2" >
            {MENUS_CONFIG_MAP[TEXT_ALIGN].map((item, index) => {
              const isSelected = curType === item.id;
              return (
                <div key={index} className="sdoc-dropdown-menu-item" onClick={() => setType(item.type)}>
                  {isSelected && (<i className="sdocfont sdoc-check-mark"></i>)}
                  <i className={item.iconClass}></i>
                </div>);
            })}
          </div>
        </UncontrolledPopover>
      )}
    </>
  );

};

TextAlignMenu.propTypes = {
  readonly: PropTypes.bool,
  isRichEditor: PropTypes.bool,
  className: PropTypes.string,
  editor: PropTypes.object,
  t: PropTypes.func
};

export default withTranslation('sdoc-editor')(TextAlignMenu);
