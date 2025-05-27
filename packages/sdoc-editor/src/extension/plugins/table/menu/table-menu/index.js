import React, { useCallback } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import ElementDropdownMenuItem from '../../../../commons/dropdown-menu-item';
import { MENUS_CONFIG_MAP, ELEMENT_TYPE, INSERT_POSITION } from '../../../../constants';
import { getInsertPosition, insertTable, isTableMenuDisabled } from '../../helpers';
import TableSizePopover from '../../popover/table-size-popover';

const TableMenu = ({ editor, readonly, eventBus }) => {

  const disabled = isTableMenuDisabled(editor, readonly);
  const menuConfig = MENUS_CONFIG_MAP[ELEMENT_TYPE.TABLE];

  const createTable = useCallback((size) => {
    const insertPosition = getInsertPosition(editor, INSERT_POSITION.AFTER);
    insertTable(editor, size, editor.selection, insertPosition);
  }, [editor]);

  return (
    <>
      <ElementDropdownMenuItem disabled={disabled} menuConfig={menuConfig} className="pr-2">
        {!disabled && (
          <i className="sdocfont sdoc-right-slide sdoc-dropdown-item-right-icon"></i>
        )}
      </ElementDropdownMenuItem>
      {!disabled && (
        <TableSizePopover
          editor={editor}
          target={menuConfig.id}
          trigger="hover"
          placement="right-start"
          createTable={createTable}
        />
      )}
    </>
  );

};

TableMenu.propTypes = {
  readonly: PropTypes.bool,
  editor: PropTypes.object,
};

export default withTranslation('sdoc-editor')(TableMenu);
