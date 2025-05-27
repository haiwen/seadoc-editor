import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { INTERNAL_EVENT } from '../../../../constants';
import DropdownMenuItem from '../../../commons/dropdown-menu-item';
import { SDOC_LINK, MENUS_CONFIG_MAP, ELEMENT_TYPE } from '../../../constants';
import { isMenuDisabled, insertSdocFileLink } from '../helpers';

const SdocLinkMenu = ({ editor, readonly, toggle, eventBus }) => {

  const disabled = isMenuDisabled(editor, readonly);
  const menuConfig = MENUS_CONFIG_MAP[SDOC_LINK];

  const openSelectSdocFileDialog = useCallback(() => {
    eventBus.dispatch(INTERNAL_EVENT.INSERT_ELEMENT, { type: ELEMENT_TYPE.SDOC_LINK, insertSdocFileLinkCallback: insertSdocFileLink });
    toggle && toggle();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggle, eventBus]);

  return (
    <DropdownMenuItem disabled={disabled} menuConfig={menuConfig} onClick={openSelectSdocFileDialog} />
  );
};

SdocLinkMenu.propTypes = {
  readonly: PropTypes.bool,
  editor: PropTypes.object,
  eventBus: PropTypes.object,
  toggle: PropTypes.func,
};

export default SdocLinkMenu;
