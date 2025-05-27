import React, { useCallback } from 'react';
import { UncontrolledPopover } from 'reactstrap';
import PropTypes from 'prop-types';
import DropdownMenuItem from '../../../commons/dropdown-menu-item';
import { LANG_MENU_CONFIG } from '../constants';


const LangSubMenu = ({ target, onTranslateClick }) => {

  const onEnClick = useCallback(() => {
    onTranslateClick('en');
  }, [onTranslateClick]);

  const onZhcnClick = useCallback(() => {
    onTranslateClick('zh-cn');
  }, [onTranslateClick]);

  // const onFrClick = useCallback(() => {
  //   onTranslateClick('fr');
  // }, [onTranslateClick]);

  // const onDeClick = useCallback(() => {
  //   onTranslateClick('de');
  // }, [onTranslateClick]);

  // const onRuClick = useCallback(() => {
  //   onTranslateClick('ru');
  // }, [onTranslateClick]);

  return (
    <UncontrolledPopover
      boundariesElement='viewport'
      target={target}
      className="ai-lang-sub-menu sdoc-sub-dropdown-menu sdoc-dropdown-menu"
      trigger='hover'
      placement='right-start'
      hideArrow={true}
      fade={false}
    >
      <div className="sdoc-dropdown-menu-container">
        <DropdownMenuItem menuConfig={LANG_MENU_CONFIG.EN} onClick={onEnClick} />
        <DropdownMenuItem menuConfig={LANG_MENU_CONFIG.ZH_CN} onClick={onZhcnClick} />
        {/* <DropdownMenuItem menuConfig={LANG_MENU_CONFIG.FR} onClick={onFrClick} /> */}
        {/* <DropdownMenuItem menuConfig={LANG_MENU_CONFIG.DE} onClick={onDeClick} /> */}
        {/* <DropdownMenuItem menuConfig={LANG_MENU_CONFIG.RU} onClick={onRuClick} /> */}
      </div>
    </UncontrolledPopover>
  );
};

LangSubMenu.propTypes = {
  slateNode: PropTypes.object,
  onTranslateClick: PropTypes.func.isRequired,
};

export default LangSubMenu;
