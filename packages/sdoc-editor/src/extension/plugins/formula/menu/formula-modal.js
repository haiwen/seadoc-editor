import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, ModalBody, ModalFooter, Input, ModalHeader } from 'reactstrap';
import { getAboveBlockNode } from '../../../core';
import { insertFormula, updateFormula } from '../helper';

const FormulaModal = ({ editor, formula, onCloseModal }) => {
  const oldFormulaRef = useRef(formula);
  const [newFormula, setNewFormula] = useState(formula);
  const [modifyPath, setModifyPath] = useState(null);
  const [isDisabled, setIsDisabled] = useState(true);
  const formulaPreviewRef = useRef(null);
  const { t } = useTranslation('sdoc-editor');

  // record current selection position
  useEffect(() => {
    const node = getAboveBlockNode(editor);
    if (node) {
      setModifyPath(node[1]);
      return;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (formulaPreviewRef.current) {
      formulaPreviewRef.current.innerHTML = '';
      const dom = window.MathJax.tex2svg(newFormula);
      formulaPreviewRef.current.appendChild(dom);
    }
  });

  const onFormulaChange = useCallback((event) => {
    setIsDisabled(false);
    setNewFormula(event.target.value);
  }, []);

  const handleUpdateFormula = useCallback(() => {
    const data = { formula: newFormula, at: modifyPath };
    if (oldFormulaRef.current) {
      updateFormula(editor, data);
    } else {
      insertFormula(editor, data);
    }
    onCloseModal();
  }, [editor, modifyPath, newFormula, onCloseModal]);

  return (
    <Modal isOpen={true} toggle={onCloseModal} autoFocus={false} wrapClassName='formula-dialog-wrapper'>
      <ModalHeader toggle={onCloseModal}>{t('Insert_formula')}</ModalHeader>
      <ModalBody>
        <div className="form-group">
          <label className="form-check-label">{t('Formula')}</label>
          <Input
            type="textarea"
            className="form-control"
            value={newFormula}
            autoFocus={true}
            onChange={onFormulaChange}
          />
        </div>
        <div ref={formulaPreviewRef} className="formula-preview"></div>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={onCloseModal}>{t('Cancel')}</Button>
        <Button color="primary" disabled={isDisabled} onClick={handleUpdateFormula}>{t('Insert_formula')}</Button>
      </ModalFooter>
    </Modal>
  );
};

export default FormulaModal;
