import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { COMMENT_EDITOR, INTERNAL_EVENT } from '../../../../constants';
import { isMac } from '../../../../utils/common-utils';
import { MenuItem } from '../../../commons';
import DropdownMenuItem from '../../../commons/dropdown-menu-item';
import { MENUS_CONFIG_MAP, ELEMENT_TYPE } from '../../../constants';
import { isMenuDisabled } from '../helpers';

const LinkMenu = ({ editor, readonly, toggle, eventBus, isRichEditor, className }) => {

  const disabled = isMenuDisabled(editor, readonly);
  const menuConfig = MENUS_CONFIG_MAP[ELEMENT_TYPE.LINK];

  const openLinkDialog = useCallback(() => {
    eventBus.dispatch(INTERNAL_EVENT.INSERT_ELEMENT, { type: ELEMENT_TYPE.LINK, editor });
    toggle && toggle();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggle, eventBus]);

  // Apply for comment Editor
  if (editor.editorType === COMMENT_EDITOR) {
    const menuProps = {
      isRichEditor,
      className,
      ...menuConfig,
      disabled: disabled,
      isActive: false,
      onMouseDown: openLinkDialog,
    };
    menuProps.id = 'sdoc-comment-editor' + menuConfig.id;
    return (
      <MenuItem {...menuProps} />
    );
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const linkShortCutTexts = useMemo(() => {
    const printTexts = isMac() ? ['⌘', 'k'] : ['Ctrl', 'k'];
    return printTexts;
  }, []);

  return (
    <DropdownMenuItem disabled={disabled} menuConfig={menuConfig} onClick={openLinkDialog} shortcut={linkShortCutTexts} />
  );
};

LinkMenu.propTypes = {
  readonly: PropTypes.bool,
  editor: PropTypes.object,
  eventBus: PropTypes.object,
  toggle: PropTypes.func,
};

export default LinkMenu;
