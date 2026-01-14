import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { UncontrolledPopover } from 'reactstrap';
import PropTypes from 'prop-types';
import { INTERNAL_EVENT } from '../../../../constants';
import DropdownMenuItem from '../../../commons/dropdown-menu-item';
import { ELEMENT_TYPE, MENUS_CONFIG_MAP, WHITEBOARD } from '../../../constants';
import { insertWhiteboard, isInsertWhiteboardMenuDisabled, onCreateWhiteboardFile } from '../helper';

const WhiteboardMenu = ({ editor, readonly, toggle, eventBus }) => {
  const disabled = isInsertWhiteboardMenuDisabled(editor, readonly);
  const menuConfig = MENUS_CONFIG_MAP[WHITEBOARD];
  const { t } = useTranslation('sdoc-editor');

  const onCreateFile = () => {
    onCreateWhiteboardFile(editor);
  };

  const openSelectWhiteboardFileDialog = useCallback(() => {
    eventBus.dispatch(INTERNAL_EVENT.INSERT_ELEMENT, { type: ELEMENT_TYPE.WHITEBOARD, insertWhiteboard: insertWhiteboard });
    toggle && toggle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggle, eventBus]);

  return (
    <>
      <DropdownMenuItem disabled={disabled} menuConfig={menuConfig} className='pr-2'>
        {!disabled && (
          <i className='sdocfont sdoc-arrow-right sdoc-dropdown-item-right-icon'></i>
        )}
      </DropdownMenuItem>
      {!disabled && (
        <UncontrolledPopover
          target={menuConfig.id}
          trigger='hover'
          className='sdoc-menu-popover sdoc-dropdown-menu sdoc-sub-dropdown-menu sdoc-insert-whiteboard-menu-popover'
          placement='right-start'
          hideArrow={true}
          fade={false}
        >
          <div className='sdoc-insert-whiteboard-menu-popover-container sdoc-dropdown-menu-container'>
            <div className='sdoc-dropdown-menu-item' onClick={openSelectWhiteboardFileDialog}>{t('Link_Excalidraw_file')}</div>
            <div className='sdoc-dropdown-menu-item' onClick={onCreateFile}>{t('New_Excalidraw_file')}</div>
          </div>
        </UncontrolledPopover>
      )}
    </>
  );
};

WhiteboardMenu.propTypes = {
  readonly: PropTypes.bool,
  editor: PropTypes.object,
  eventBus: PropTypes.object,
  toggle: PropTypes.func,
};

export default WhiteboardMenu;
