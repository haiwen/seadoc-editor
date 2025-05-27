import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, ModalBody, ModalFooter, Alert, Row, Col, FormGroup, Label, Input, ModalHeader } from 'reactstrap';
import PropTypes from 'prop-types';
import { getSelectedInfo, splitCell } from '../helpers';

const propTypes = {
  editor: PropTypes.object,
  closeDialog: PropTypes.func.isRequired
};

const SplitCellSettingDialog = ({ editor, closeDialog }) => {
  const { t } = useTranslation('sdoc-editor');

  const { cell } = getSelectedInfo(editor);
  const { rowspan = 1, colspan = 1 } = cell;
  const [rowNumber, setRowNumber] = useState(rowspan);
  const [columnNumber, setColumnNumber] = useState(colspan);
  const CELL_SPLIT_MAX_ROWS = rowspan;
  const CELL_SPLIT_MAX_COLUMNS = colspan;

  const [errorMessage, setErrorMessage] = useState('');

  const onRowNumberChange = useCallback((e) => {
    setRowNumber(e.target.value);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onColumnNumberChange = useCallback((e) => {
    setColumnNumber(e.target.value);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = useCallback(() => {
    const parsedRowNumber = parseInt(rowNumber);
    const parsedColumnNumber = parseInt(columnNumber);

    if (!parsedRowNumber || !parsedColumnNumber || parsedRowNumber < 0 || parsedColumnNumber < 0) {
      setErrorMessage(t('Please_enter_a_non-negative_integer'));
      return false;
    }

    let targetRowNumber = parsedRowNumber;
    let targetColumnNumber = parsedColumnNumber;

    if (parsedRowNumber > CELL_SPLIT_MAX_ROWS) {
      targetRowNumber = CELL_SPLIT_MAX_ROWS;
      setRowNumber(targetRowNumber);
      setErrorMessage(t('The_maximum_row_number_is_{number}').replace('{number}', CELL_SPLIT_MAX_ROWS));
      return false;
    }

    if (parsedColumnNumber > CELL_SPLIT_MAX_COLUMNS) {
      targetColumnNumber = CELL_SPLIT_MAX_COLUMNS;
      setColumnNumber(targetColumnNumber);
      setErrorMessage(t('The_maximum_column_number_is_{number}').replace('{number}', CELL_SPLIT_MAX_COLUMNS));
      return false;
    }

    splitCell(editor, targetRowNumber, targetColumnNumber);
    closeDialog();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowNumber, columnNumber]);

  const close = useMemo(() => {
    return (
      <span className="sdoc-add-link-close-icon" onClick={closeDialog}>
        <i className="sdocfont sdoc-sm-close" aria-hidden="true"></i>
      </span>
    );
  }, [closeDialog]);

  return (
    <Modal isOpen={true} autoFocus={false} toggle={closeDialog} zIndex={1071} returnFocusAfterClose={true}>
      <ModalHeader close={close}>{t('Split_cell')}</ModalHeader>
      <ModalBody>
        <Row>
          <Col md={6}>
            <FormGroup>
              <Label for="row-number">{t('Row_number')}</Label>
              <Input
                id="row-number"
                name="row-number"
                type="number"
                min={1}
                value={rowNumber}
                onChange={onRowNumberChange}
              />
            </FormGroup>
          </Col>
          <Col md={6}>
            <FormGroup>
              <Label for="column-number">{t('Column_number')}</Label>
              <Input
                id="column-number"
                name="column-number"
                type="number"
                min={1}
                value={columnNumber}
                onChange={onColumnNumberChange}
              />
            </FormGroup>
          </Col>
        </Row>
        {errorMessage && <Alert className='mt-2 mb-0' color='danger'>{t(errorMessage)}</Alert>}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={closeDialog}>{t('Cancel')}</Button>
        <Button color="primary" onClick={handleSubmit}>{t('Submit')}</Button>
      </ModalFooter>
    </Modal>
  );
};

SplitCellSettingDialog.propTypes = propTypes;

export default SplitCellSettingDialog;
