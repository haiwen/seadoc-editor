import React from 'react';
import { INTERNAL_EVENT } from '../../../../constants';
import EventBus from '../../../../utils/event-bus';
import DropdownMenuItem from '../../../commons/dropdown-menu-item';
import { ELEMENT_TYPE, MENUS_CONFIG_MAP } from '../../../constants';
import { isInsertFormulaMenuDisabled } from '../helper';

const FormulaMenu = ({ editor, readonly, toggle }) => {
  const menuConfig = MENUS_CONFIG_MAP[ELEMENT_TYPE.FORMULA];
  const disabled = isInsertFormulaMenuDisabled(editor, readonly);

  const OpenFormulaModal = () => {
    toggle && toggle();
    const eventBus = EventBus.getInstance();
    eventBus.dispatch(INTERNAL_EVENT.INSERT_ELEMENT, { type: ELEMENT_TYPE.FORMULA, editor });
  };

  return (
    <DropdownMenuItem disabled={disabled} menuConfig={menuConfig} onClick={OpenFormulaModal} />
  );
};

export default FormulaMenu;
