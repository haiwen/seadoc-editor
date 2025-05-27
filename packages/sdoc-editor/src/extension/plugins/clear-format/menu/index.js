import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { MenuItem } from '../../../commons';
import { CLEAR_FORMAT, MENUS_CONFIG_MAP } from '../../../constants';
import { isMenuDisabled, clearStyles } from '../helpers';

const propTypes = {
  readonly: PropTypes.bool,
  isRichEditor: PropTypes.bool,
  className: PropTypes.string,
  editor: PropTypes.object,
};

const menuConfig = MENUS_CONFIG_MAP[CLEAR_FORMAT];

const ClearFormatMenu = ({ isRichEditor, className, editor, readonly }) => {

  const onMouseDown = useCallback(() => {
    clearStyles(editor);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const props = {
    isRichEditor,
    className,
    ariaLabel: 'clear',
    ...menuConfig,
    disabled: isMenuDisabled(editor, readonly),
    isActive: false,
    'onMouseDown': onMouseDown,
  };

  return (
    <MenuItem { ...props } />
  );
};

ClearFormatMenu.propTypes = propTypes;

export default ClearFormatMenu;
