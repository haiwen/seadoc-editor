import React, { Fragment, useCallback, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, ModalBody, ModalFooter, Alert, Label, ModalHeader } from 'reactstrap';
import PropTypes from 'prop-types';
import { getEditorString } from '../../../../core';
import { insertLink, updateLink, checkLink } from '../../helpers';


const AddLinkDialog = ({ editor, className, element, insertPosition, slateNode, closeDialog, linkTitle, handleSubmit }) => {
  const { t } = useTranslation('sdoc-editor');
  const [linkErrorMessage, setLinkErrorMessage] = useState('');
  const [titleErrorMessage, setTitleErrorMessage] = useState('');
  const { title: oldTitle, href: oldURL } = element || { title: linkTitle || '', href: '' };
  const initTitle = useMemo(() => oldTitle ? oldTitle : getEditorString(editor, editor.selection), [editor, oldTitle]);
  const [title, setTitle] = useState(initTitle);
  const [url, setURL] = useState(oldURL);

  const submit = useCallback(() => {
    setLinkErrorMessage('');
    setTitleErrorMessage('');

    if (!url) {
      setLinkErrorMessage(t('The_link_address_is_required'));
      return;
    }
    if (!title) {
      setTitleErrorMessage(t('The_link_title_is_required'));
      return;
    }
    if (checkLink(url)) {
      setLinkErrorMessage(t('The_link_address_is_invalid'));
      return;
    }

    const isEdit = oldURL || oldTitle;
    if (isEdit) {
      updateLink(editor, title, url);
    } else {
      insertLink(editor, title, url, insertPosition, slateNode);
    }

    handleSubmit && handleSubmit();
    closeDialog();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, url, title, oldTitle, oldURL, insertPosition]);

  const onKeyDown = useCallback((event) => {
    if (event.keyCode === 13) {
      event.preventDefault();
      submit();
      return;
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, url, title, oldTitle, oldURL, insertPosition]);

  const handleUrlChange = useCallback((event) => {
    const value = event.target.value.trim();
    if (value === url) return;
    setURL(value);

  }, [url]);

  const handleTitleChange = useCallback((event) => {
    const value = event.target.value;
    if (value === title) return;
    setTitle(value);
  }, [title]);

  const close = useMemo(() => {
    return (
      <span className="sdoc-add-link-close-icon" onClick={closeDialog}>
        <i className="sdocfont sdoc-sm-close" aria-hidden="true"></i>
      </span>
    );
  }, [closeDialog]);

  return (
    <Modal isOpen={true} autoFocus={false} toggle={closeDialog} className={className} zIndex={1071} returnFocusAfterClose={false}>
      <ModalHeader close={close}>{t('Insert_link')}</ModalHeader>
      <ModalBody>
        <Fragment>
          <div className="form-group">
            <Label for="addLink">{t('Link_address')}</Label>
            <input
              onKeyDown={onKeyDown}
              autoFocus={true}
              type="url"
              className="form-control"
              id="addLink"
              value={url || ''}
              onChange={handleUrlChange}
            />
            {linkErrorMessage && <Alert color="danger" className="mt-2">{t(linkErrorMessage)}</Alert>}
          </div>
          <div className="form-group">
            <Label for="addTitle">{t('Link_title')}</Label>
            <input
              onKeyDown={onKeyDown}
              type="text"
              className="form-control"
              id="addTitle"
              value={title}
              onChange={handleTitleChange}
            />
            {titleErrorMessage && <Alert color="danger" className="mt-2">{t(titleErrorMessage)}</Alert>}
          </div>
        </Fragment>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={closeDialog}>{t('Cancel')}</Button>
        <Button color="primary" disabled={false} onClick={submit}>{t('Add_link')}</Button>
      </ModalFooter>
    </Modal>
  );
};

AddLinkDialog.propTypes = {
  editor: PropTypes.object.isRequired,
  className: PropTypes.string,
  slateNode: PropTypes.object
};

export default AddLinkDialog;
