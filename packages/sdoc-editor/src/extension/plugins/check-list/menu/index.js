import React from 'react';
import PropTypes from 'prop-types';
import { MenuItem } from '../../../commons';
import { CHECK_LIST_ITEM, MENUS_CONFIG_MAP, PARAGRAPH } from '../../../constants';
import { focusEditor } from '../../../core';
import { isMenuDisabled, setCheckListItemType, getCheckListItemType } from '../helpers';

const propTypes = {
  readonly: PropTypes.bool,
  isRichEditor: PropTypes.bool,
  className: PropTypes.string,
  editor: PropTypes.object,
};

class CheckListMenu extends React.Component {

  isActive = () => {
    const { editor } = this.props;
    return getCheckListItemType(editor) === CHECK_LIST_ITEM;
  };

  isDisabled = () => {
    const { editor, readonly } = this.props;
    return isMenuDisabled(editor, readonly);
  };

  onMouseDown = () => {
    const { editor } = this.props;

    const active = this.isActive(editor);
    const newType = active ? PARAGRAPH : CHECK_LIST_ITEM;
    setCheckListItemType(editor, newType);
    focusEditor(editor, editor.selection);
  };

  render() {
    const { isRichEditor, className } = this.props;
    const menuConfig = MENUS_CONFIG_MAP[CHECK_LIST_ITEM];
    const props = {
      isRichEditor,
      className,
      ariaLabel: 'check list',
      ...menuConfig,
      disabled: this.isDisabled(),
      isActive: this.isActive(),
      onMouseDown: this.onMouseDown,
    };

    return <MenuItem { ...props } />;
  }
}

CheckListMenu.propTypes = propTypes;

export default CheckListMenu;
