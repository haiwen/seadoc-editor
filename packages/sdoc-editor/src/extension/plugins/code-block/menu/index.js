import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import DropdownMenuItem from '../../../commons/dropdown-menu-item';
import { MENUS_CONFIG_MAP, ELEMENT_TYPE, INSERT_POSITION } from '../../../constants';
import { focusEditor } from '../../../core';
import { isMenuDisabled, changeToCodeBlock } from '../helpers';

const CodeBlockMenu = ({ editor, readonly, toggle }) => {
  const disabled = isMenuDisabled(editor, readonly);
  const menuConfig = MENUS_CONFIG_MAP[ELEMENT_TYPE.CODE_BLOCK];

  const insertCodeBlock = useCallback(() => {
    changeToCodeBlock(editor, 'plaintext', INSERT_POSITION.CURRENT);
    toggle && toggle();
    focusEditor(editor);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, toggle]);

  return (
    <DropdownMenuItem disabled={disabled} menuConfig={menuConfig} onClick={insertCodeBlock} />
  );
};

CodeBlockMenu.propTypes = {
  readonly: PropTypes.bool,
  editor: PropTypes.object,
  toggle: PropTypes.func,
};

export default CodeBlockMenu;
