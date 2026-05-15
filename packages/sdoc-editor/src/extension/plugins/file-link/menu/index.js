import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { INTERNAL_EVENT, WIKI_EDITOR } from '../../../../constants';
import context from '../../../../context';
import DropdownMenuItem from '../../../commons/dropdown-menu-item';
import { FILE_LINK, MENUS_CONFIG_MAP, ELEMENT_TYPE } from '../../../constants';
import { isMenuDisabled, insertFileLink } from '../helpers';

const FileLinkMenu = ({ editor, readonly, toggle, eventBus }) => {

  const disabled = isMenuDisabled(editor, readonly);
  const menuConfig = MENUS_CONFIG_MAP[FILE_LINK];
  const shouldShow = editor?.editorType === WIKI_EDITOR && context.hasLinkedRepos();

  const openSelectFileDialog = useCallback(() => {
    eventBus.dispatch(INTERNAL_EVENT.INSERT_ELEMENT, { type: ELEMENT_TYPE.FILE_LINK, insertFileLinkCallback: insertFileLink });
    toggle && toggle();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggle, eventBus]);

  if (!shouldShow) return null;

  return (
    <DropdownMenuItem disabled={disabled} menuConfig={menuConfig} onClick={openSelectFileDialog} />
  );
};

FileLinkMenu.propTypes = {
  readonly: PropTypes.bool,
  editor: PropTypes.object,
  eventBus: PropTypes.object,
  toggle: PropTypes.func,
};

export default FileLinkMenu;
