import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

export default function TipDialog({ closeDialog, discardCurrentContent }) {
  const { t } = useTranslation('sdoc-editor');
  const close = useMemo(() => {
    return (
      <span className="sdoc-add-link-close-icon" onClick={closeDialog}>
        <i className="sdocfont sdoc-sm-close" aria-hidden="true"></i>
      </span>
    );
  }, [closeDialog]);

  return (
    <Modal isOpen={true} toggle={closeDialog}>
      <ModalHeader close={close}>{t('Tip')}</ModalHeader>
      <ModalBody>
        <div className='pb-6'>{t('AI_tip_content')}</div>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" className="mr-2" onClick={closeDialog}>{t('Cancel')}</Button>
        <Button color="primary" onClick={discardCurrentContent}>
          {t('Discard')}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
