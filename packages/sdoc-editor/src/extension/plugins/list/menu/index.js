import React from 'react';
import PropTypes from 'prop-types';
import { MenuItem } from '../../../commons';
import { MENUS_CONFIG_MAP, ORDERED_LIST, UNORDERED_LIST } from '../../../constants';
import { focusEditor } from '../../../core';
import { getListType, isMenuDisabled, setListType } from '../helpers';

const propTypes = {
  readonly: PropTypes.bool,
  type: PropTypes.oneOf([ORDERED_LIST, UNORDERED_LIST]),
  isRichEditor: PropTypes.bool,
  className: PropTypes.string,
  editor: PropTypes.object,
  ariaLabel: PropTypes.string,
};

class ListMenu extends React.Component {

  isActive = () => {
    const { editor, type = UNORDERED_LIST } = this.props;
    return getListType(editor, type) === type;
  };

  isDisabled = () => {
    const { editor, readonly } = this.props;
    return isMenuDisabled(editor, readonly);
  };

  onMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (this.isDisabled()) return;
    const { editor, type = UNORDERED_LIST } = this.props;

    // 执行命令
    setListType(editor, type);
    focusEditor(editor);
  };

  render() {
    const { isRichEditor, className, type = UNORDERED_LIST, ariaLabel } = this.props;
    const menuConfig = MENUS_CONFIG_MAP[type];
    const props = {
      isRichEditor,
      className,
      ariaLabel,
      ...menuConfig,
      disabled: this.isDisabled(),
      isActive: this.isActive(),
      onMouseDown: this.onMouseDown,
    };

    return <MenuItem { ...props } />;
  }
}

ListMenu.propTypes = propTypes;

export default ListMenu;
