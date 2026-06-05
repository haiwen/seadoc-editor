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

  const onFrClick = useCallback(() => {
    onTranslateClick('fr');
  }, [onTranslateClick]);

  const onDeClick = useCallback(() => {
    onTranslateClick('de');
  }, [onTranslateClick]);

  const onItClick = useCallback(() => {
    onTranslateClick('it');
  }, [onTranslateClick]);

  return (
    <UncontrolledPopover
      boundariesElement='viewport'
      target={target}
      className="ai-lang-sub-menu sdoc-sub-dropdown-menu"
      popperClassName='sdoc-popover-box-shadow'
      trigger='hover'
      placement='right-start'
      hideArrow={true}
      fade={false}
      offset={[0, 8]}
    >
      <div className="sdoc-dropdown-menu">
        <DropdownMenuItem menuConfig={LANG_MENU_CONFIG.ZH_CN} onClick={onZhcnClick} />
        <DropdownMenuItem menuConfig={LANG_MENU_CONFIG.EN} onClick={onEnClick} />
        <DropdownMenuItem menuConfig={LANG_MENU_CONFIG.FR} onClick={onFrClick} />
        <DropdownMenuItem menuConfig={LANG_MENU_CONFIG.DE} onClick={onDeClick} />
        <DropdownMenuItem menuConfig={LANG_MENU_CONFIG.IT} onClick={onItClick} />
      </div>
    </UncontrolledPopover>
  );
};

LangSubMenu.propTypes = {
  slateNode: PropTypes.object,
  onTranslateClick: PropTypes.func.isRequired,
};

export default LangSubMenu;
