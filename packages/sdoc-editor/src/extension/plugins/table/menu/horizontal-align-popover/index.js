import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { UncontrolledPopover } from 'reactstrap';
import classNames from 'classnames';
import { focusEditor } from '../../../../core';
import { TABLE_CELL_STYLE } from '../../constants';
import { setCellStyle } from '../../helpers';

import '../vertical-align-popover/style.css';

const HorizontalAlignPopover = ({ target, editor, readonly, horizontalAlign }) => {
  const { t } = useTranslation('sdoc-editor');

  const setTextAlignStyle = useCallback((textAlign) => {
    if (readonly) return;
    setCellStyle(editor, { [TABLE_CELL_STYLE.TEXT_ALIGN]: textAlign });
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
      popperClassName='sdoc-popover-box-shadow'
      hideArrow={true}
      fade={false}
      offset={[0, 8]}
    >
      <div className="sdoc-dropdown-menu sdoc-table-alignment-menu">
        <div className="sdoc-dropdown-menu-item" onMouseDown={() => setTextAlignStyle('left')}>
          <i className={classNames('sdocfont sdoc-check-mark', { active: !horizontalAlign || horizontalAlign === 'left' })}></i>
          <span className='active'>{t('Left')}</span>
        </div>
        <div className="sdoc-dropdown-menu-item" onMouseDown={() => setTextAlignStyle('center')}>
          <i className={classNames('sdocfont sdoc-check-mark', { active: horizontalAlign === 'center' })}></i>
          <span>{t('Center')}</span>
        </div>
        <div className="sdoc-dropdown-menu-item" onMouseDown={() => setTextAlignStyle('right')}>
          <i className={classNames('sdocfont sdoc-check-mark', { active: horizontalAlign === 'right' })}></i>
          <span>{t('Right')}</span>
        </div>
      </div>
    </UncontrolledPopover >
  );
};

export default HorizontalAlignPopover;
