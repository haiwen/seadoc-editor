import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import DropdownMenuItem from '../../../commons/dropdown-menu-item';
import { DIVIDER, MENUS_CONFIG_MAP, TABLE } from '../../../constants';
import { getSelectedNodeEntryByType } from '../../../core';
import { insertDivider } from '../helper';

const menuConfig = MENUS_CONFIG_MAP[DIVIDER];
const propTypes = {
  isRichEditor: PropTypes.bool,
  className: PropTypes.string,
  readonly: PropTypes.bool,
  editor: PropTypes.object,
};

const DividerMenu = ({ readonly, editor, toggle }) => {
  const disabled = readonly || Boolean(editor.selection && getSelectedNodeEntryByType(editor, TABLE));

  const onMousedown = useCallback((e) => {
    e.preventDefault();
    insertDivider(editor);
    toggle && toggle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DropdownMenuItem disabled={disabled} menuConfig={menuConfig} className="pr-2" onClick={onMousedown}>
    </DropdownMenuItem>
  );
};

DividerMenu.propTypes = propTypes;

export default DividerMenu;
