import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, ModalBody, ModalFooter, Button, Label, Alert, ModalHeader } from 'reactstrap';
import PropTypes from 'prop-types';
import { TABLE_MAX_ROWS, TABLE_MAX_COLUMNS } from '../../constants';
import { insertTable } from '../../helpers';
import NumberInput from './number-input';

import './index.css';

const CustomTableSizeDialog = ({ editor, insertPosition, closeDialog }) => {
  const { t } = useTranslation('sdoc-editor');
  const [errorMessage, setErrorMessage] = useState('');
  const [rows, setRows] = useState('1');
  const [cols, setCols] = useState('1');

  const submit = useCallback(() => {
    if (
      !rows || !cols ||
      parseInt(rows) < 1 ||
      parseInt(rows) > 50 ||
      parseInt(cols) < 1 ||
      parseInt(cols) > 50
    ) {
      setErrorMessage('Valid_values_for_rows_and_columns');
      return;
    }

    insertTable(editor, [parseInt(rows), parseInt(cols)], editor.selection, insertPosition);
    closeDialog();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, rows, cols, insertPosition]);

  const rowsChange = useCallback((event) => {
    const value = event.target.value;
    if (value === rows) return;
    setErrorMessage('');
    setRows(value);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  const colsChange = useCallback((event) => {
    const value = event.target.value;
    if (value === cols) return;
    setErrorMessage('');
    setCols(value);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cols]);

  const close = useMemo(() => {
    return (
      <span className="sdoc-add-link-close-icon" onClick={closeDialog}>
        <i className="sdocfont sdoc-sm-close" aria-hidden="true"></i>
      </span>
    );
  }, [closeDialog]);

  return (
    <Modal isOpen={true} toggle={closeDialog} size="md" className="sdoc-custom-table-size-dialog" zIndex={1111}>
      <ModalHeader close={close}>{t('Customize_the_number_of_rows_and_columns')}</ModalHeader>
      <ModalBody>
        <div className="d-flex sdoc-custom-table-size-container">
          <div className="d-flex flex-column sdoc-custom-table-size-item mr-4">
            <Label className="mb-2">{t('Rows')}</Label>
            <NumberInput min={1} max={TABLE_MAX_ROWS} value={rows} onChange={rowsChange} />
          </div>
          <div className="d-flex flex-column sdoc-custom-table-size-item">
            <Label className="mb-2">{t('Columns')}</Label>
            <NumberInput min={1} max={TABLE_MAX_COLUMNS} value={cols} onChange={colsChange} />
          </div>
        </div>
        {errorMessage && <Alert className='mt-2 mb-0' color='danger'>{t(errorMessage)}</Alert>}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={closeDialog}>{t('Cancel')}</Button>
        <Button color="primary" onClick={submit}>
          {t('Submit')}
        </Button>
      </ModalFooter>
    </Modal>
  );

};

CustomTableSizeDialog.propTypes = {
  editor: PropTypes.object,
  closeDialog: PropTypes.func,
};

export default CustomTableSizeDialog;
