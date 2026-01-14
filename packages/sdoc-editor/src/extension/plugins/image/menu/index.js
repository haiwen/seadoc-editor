import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { UncontrolledPopover } from 'reactstrap';
import PropTypes from 'prop-types';
import { COMMENT_EDITOR, INTERNAL_EVENT } from '../../../../constants';
import { MenuItem } from '../../../commons';
import DropdownMenuItem from '../../../commons/dropdown-menu-item';
import { IMAGE, MENUS_CONFIG_MAP, LOCAL_IMAGE } from '../../../constants';
import { isInsertImageMenuDisabled } from '../helpers';

const ImageMenu = ({ editor, readonly, eventBus, isRichEditor, className }) => {
  const disabled = isInsertImageMenuDisabled(editor, readonly);
  const menuConfig = MENUS_CONFIG_MAP[IMAGE];
  const { t } = useTranslation('sdoc-editor');

  const openInsertLocalImage = useCallback(() => {
    eventBus.dispatch(INTERNAL_EVENT.INSERT_ELEMENT, { type: LOCAL_IMAGE, editor });
  }, [editor, eventBus]);

  // Apply for comment Editor
  if (editor.editorType === COMMENT_EDITOR) {
    const commentEditorConfig = { ...menuConfig, text: 'Upload_local_image' };
    const menuProps = {
      isRichEditor,
      className,
      ...commentEditorConfig,
      disabled: disabled,
      isActive: false,
      onMouseDown: openInsertLocalImage,
    };
    return (
      <MenuItem {...menuProps} />
    );
  }

  return (
    <>
      <DropdownMenuItem disabled={disabled} menuConfig={menuConfig} className="pr-2">
        {!disabled && (
          <i className="sdocfont sdoc-arrow-right sdoc-dropdown-item-right-icon"></i>
        )}
      </DropdownMenuItem>
      {!disabled && (
        <UncontrolledPopover
          target={menuConfig.id}
          trigger="hover"
          className="sdoc-menu-popover sdoc-dropdown-menu sdoc-sub-dropdown-menu sdoc-insert-image-menu-popover"
          placement="right-start"
          hideArrow={true}
          fade={false}
        >
          <div className="sdoc-insert-image-menu-popover-container sdoc-dropdown-menu-container">
            <div className="sdoc-dropdown-menu-item" onClick={openInsertLocalImage}>{t('Upload_local_image')}</div>
          </div>
        </UncontrolledPopover>
      )}
    </>
  );
};

ImageMenu.propTypes = {
  readonly: PropTypes.bool,
  editor: PropTypes.object,
  eventBus: PropTypes.object,
};

export default ImageMenu;
