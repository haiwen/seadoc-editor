
import React, { useCallback, useEffect, useState } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import toaster from '../../../../components/toast';
import Tooltip from '../../../../components/tooltip';
import { ElementPopover } from '../../../commons/';
import { onCopyFormulaNode } from '../helper';

import './index.css';

const propTypes = {
  menuPosition: PropTypes.object.isRequired,
  onCopyFormula: PropTypes.func.isRequired,
  onDeleteFormula: PropTypes.func.isRequired,
};

const FormulaHoverMenu = ({ editor, element, menuPosition, onDeleteFormula, t, onHideInsertHoverMenu, onEditFormula }) => {
  const [isShowTooltip, setIsShowTooltip] = useState(false);

  useEffect(() => {
    setIsShowTooltip(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDelete = useCallback(() => {
    onDeleteFormula();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCopy = useCallback((e) => {
    e.stopPropagation();
    onCopyFormulaNode(editor, element);
    toaster.success(t('Copied'), { hasCloseButton: false, duration: 2 });
    onHideInsertHoverMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ElementPopover>
      <div className="sdoc-formula-hover-menu-container" style={menuPosition}>
        <div className='hover-menu-container'>
          <div id='sdoc_formula_edit' className="sdoc-formula-hover-operation-item">
            <div role="button" className="op-item" onClick={onEditFormula}>
              <i className='sdocfont sdoc-rename'></i>
            </div>
            {isShowTooltip && (
              <Tooltip target='sdoc_formula_edit' placement='top' fade={true}>
                {t('Edit_formula')}
              </Tooltip>
            )}
          </div>
          <div className="sdoc-formula-hover-operation-divider"></div>
          <div id='sdoc_formula_copy' className="sdoc-formula-hover-operation-item">
            <div role="button" className="op-item" onClick={onCopy}>
              <i className='sdocfont sdoc-copy'></i>
            </div>
            {isShowTooltip && (
              <Tooltip target='sdoc_formula_copy' placement='top' fade={true}>
                {t('Copy')}
              </Tooltip>
            )}
          </div>
          <div className="sdoc-formula-hover-operation-divider"></div>
          <div id='sdoc_formula_delete' className="sdoc-formula-hover-operation-item">
            <div role="button" className="op-item" onClick={onDelete}>
              <i className='sdocfont sdoc-delete'></i>
            </div>
            {isShowTooltip && (
              <Tooltip target='sdoc_formula_delete' placement='top' fade={true}>
                {t('Delete')}
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </ElementPopover>
  );
};

FormulaHoverMenu.propTypes = propTypes;

export default withTranslation('sdoc-editor')(FormulaHoverMenu);
