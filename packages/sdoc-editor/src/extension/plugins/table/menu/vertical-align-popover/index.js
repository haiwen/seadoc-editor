import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { UncontrolledPopover } from 'reactstrap';
import classNames from 'classnames';
import KebabToCamel from '../../../../../utils/Kebab-to-camel';
import { focusEditor } from '../../../../core';
import { TABLE_CELL_STYLE } from '../../constants';
import { setCellStyle } from '../../helpers';

import './style.css';

const VerticalAlignPopover = ({ target, editor, readonly, verticalAlign }) => {
  const { t } = useTranslation('sdoc-editor');

  const setVerticalAlignStyle = useCallback((position) => {
    if (readonly) return;
    const alignItems = KebabToCamel(TABLE_CELL_STYLE.ALIGN_ITEMS);
    setCellStyle(editor, { [alignItems]: position });
    const focusPoint = editor.selection.focus;
    // prevent select all text in the editor
    focusEditor(editor, focusPoint);
    // Select last focus point
    setTimeout(() => {
      focusEditor(editor, focusPoint);
    }, 0);
  }, [editor, readonly]);

  return (
    <UncontrolledPopover
      target={target.current}
      trigger="hover"
      placement="right-start"
      hideArrow={true}
      fade={false}
      offset={[0, 0]}
    >
      <div className="sdoc-dropdown-menu sdoc-table-alignment-menu">
        <div className="sdoc-dropdown-menu-item" onMouseDown={() => setVerticalAlignStyle('flex-start')}>
          <div className='sdoc-checked'><i className={classNames('sdocfont sdoc-check-mark', { active: !verticalAlign || verticalAlign === 'flex-start' })}></i></div>
          <span className='active'>{t('Top_align')}</span>
        </div>
        <div className="sdoc-dropdown-menu-item" onMouseDown={() => setVerticalAlignStyle('center')}>
          <div className='sdoc-checked'><i className={classNames('sdocfont sdoc-check-mark', { active: verticalAlign === 'center' })}></i></div>
          <span>{t('Center_align')}</span>
        </div>
        <div className="sdoc-dropdown-menu-item" onMouseDown={() => setVerticalAlignStyle('flex-end')}>
          <div className='sdoc-checked'><i className={classNames('sdocfont sdoc-check-mark', { active: verticalAlign === 'flex-end' })}></i></div>
          <span>{t('Bottom_align')}</span>
        </div>
      </div>
    </UncontrolledPopover>
  );
};

export default VerticalAlignPopover;
