import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, ModalBody, ModalFooter, ModalHeader, } from 'reactstrap';

const ReplaceAllConfirmModal = ({ isOpen, handleConfirm, handleCancel, number, originalWord, replacedWord }) => {
  const { t } = useTranslation('sdoc-editor');

  const modalContent = replacedWord === ''
    ? t('Are_you_sure_to_clear_all_number_xxx_in_this_document', { number, originalWord })
    : t('Are_you_sure_to_replace_all_number_xxx_in_this_document_with_yyy', { number, originalWord, replacedWord });

  const close = (
    <span className="sdoc-add-link-close-icon" onClick={handleCancel}>
      <i className="sdocfont sdoc-sm-close" aria-hidden="true"></i>
    </span>
  );

  return (
    <Modal isOpen={isOpen} >
      <ModalHeader close={close}>{t('Tip')}</ModalHeader>
      <ModalBody>{`${modalContent}`}</ModalBody>
      <ModalFooter>
        <button onClick={handleCancel} className='btn btn-secondary'>{t('Cancel')}</button>
        <button onClick={handleConfirm} className='btn btn-primary'>{t('Confirm')}</button>
      </ModalFooter>
    </Modal>
  );
};

export default ReplaceAllConfirmModal;
