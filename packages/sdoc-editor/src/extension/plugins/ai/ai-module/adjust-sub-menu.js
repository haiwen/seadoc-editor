import React from 'react';
import { UncontrolledPopover } from 'reactstrap';
import PropTypes from 'prop-types';
import DropdownMenuItem from '../../../commons/dropdown-menu-item';
import { OPERATION_MENUS_CONFIG } from '../constants';


const AdjustSubMenu = ({ target, onMoreFluentClick, onMoreDetailsClick, onMoreConciseClick, onMoreVividClick }) => {

  return (
    <UncontrolledPopover
      boundariesElement='viewport'
      target={target}
      className="ai-adjust-sub-menu sdoc-sub-dropdown-menu"
      popperClassName='sdoc-popover-box-shadow'
      trigger='hover'
      placement='right-start'
      hideArrow={true}
      fade={false}
      offset={[0, 8]}
    >
      <div className="sdoc-dropdown-menu">
        <DropdownMenuItem menuConfig={OPERATION_MENUS_CONFIG.MORE_FLUENT} onClick={onMoreFluentClick} />
        <DropdownMenuItem menuConfig={OPERATION_MENUS_CONFIG.MORE_DETAILS} onClick={onMoreDetailsClick} />
        <DropdownMenuItem menuConfig={OPERATION_MENUS_CONFIG.MORE_CONCISE} onClick={onMoreConciseClick} />
        <DropdownMenuItem menuConfig={OPERATION_MENUS_CONFIG.MORE_VIVID} onClick={onMoreVividClick} />
      </div>
    </UncontrolledPopover>
  );
};

AdjustSubMenu.propTypes = {
  target: PropTypes.string.isRequired,
  onMoreFluentClick: PropTypes.func.isRequired,
  onMoreDetailsClick: PropTypes.func.isRequired,
  onMoreConciseClick: PropTypes.func.isRequired,
  onMoreVividClick: PropTypes.func.isRequired,
};

export default AdjustSubMenu;
