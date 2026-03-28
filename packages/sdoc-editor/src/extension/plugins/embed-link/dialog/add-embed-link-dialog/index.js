import React, { Fragment, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, ModalBody, ModalFooter, Alert, Label, ModalHeader } from 'reactstrap';
import PropTypes from 'prop-types';
import { getEmbedLinkType, insertEmbedLink } from '../../helper';

const AddEmbedLinkDialog = ({ editor, className, closeDialog, handleSubmit }) => {
  const { t } = useTranslation('sdoc-editor');
  const [linkErrorMessage, setLinkErrorMessage] = useState('');
  const [url, setURL] = useState('');

  const submit = useCallback(() => {
    setLinkErrorMessage('');

    if (!url) {
      setLinkErrorMessage(t('The_link_address_is_required'));
      return;
    }

    const embedLinkType = getEmbedLinkType(url);
    if (!embedLinkType) {
      setLinkErrorMessage(t('The_link_address_is_invalid'));
      return;
    }

    insertEmbedLink(editor, url, embedLinkType);

    handleSubmit && handleSubmit();
    closeDialog();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, url]);

  const onKeyDown = useCallback((event) => {
    if (event.keyCode === 13) {
      event.preventDefault();
      submit();
      return;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, url]);

  const handleUrlChange = useCallback((event) => {
    const embedLinkUrl = event.target.value.trim();
    if (embedLinkUrl === url) return;
    setURL(embedLinkUrl);
  }, [url]);

  const close = useMemo(() => {
    return (
      <span className="sdoc-add-link-close-icon" onClick={closeDialog}>
        <i className="sdocfont sdoc-sm-close" aria-hidden="true"></i>
      </span>
    );
  }, [closeDialog]);

  return (
    <Modal isOpen={true} autoFocus={false} toggle={closeDialog} className={className} zIndex={1071} returnFocusAfterClose={false}>
      <ModalHeader close={close}>{t('Add_embed_link')}</ModalHeader>
      <ModalBody>
        <Fragment>
          <div className="form-group">
            <Label for="addLink">{t('Link_address')}</Label>
            <input
              onKeyDown={onKeyDown}
              autoFocus={true}
              type="url"
              className="form-control"
              id="addVideoLink"
              value={url || ''}
              onChange={handleUrlChange}
            />
            {linkErrorMessage && <Alert color="danger" className="mt-2">{t(linkErrorMessage)}</Alert>}
          </div>
          <div style={{ textAlign: 'center', fontSize: '12px', color: '#787774' }}>{t('Support_Figma_Seatable_link')}</div>
        </Fragment>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={closeDialog}>{t('Cancel')}</Button>
        <Button color="primary" disabled={false} onClick={submit}>{t('Add_link')}</Button>
      </ModalFooter>
    </Modal>
  );
};

AddEmbedLinkDialog.propTypes = {
  editor: PropTypes.object.isRequired,
  className: PropTypes.string,
  closeDialog: PropTypes.func,
  handleSubmit: PropTypes.func
};

export default AddEmbedLinkDialog;
