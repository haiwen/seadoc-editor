import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { createWikiPageAndInsertLink, validateWikiPageTitle } from './helpers';

const CreatePageDialog = ({ isOpen, initialTitle, editor, element, onClose }) => {
  const { t } = useTranslation('sdoc-editor');
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setTitle(initialTitle || '');
    setError('');
  }, [initialTitle, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    queueMicrotask(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  }, [isOpen]);

  const onChange = useCallback((event) => {
    setTitle(event.target.value);
    if (error) {
      setError('');
    }
  }, [error]);

  const onCreate = useCallback(() => {
    const errorMessage = validateWikiPageTitle(title);
    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    onClose();
    createWikiPageAndInsertLink({
      editor,
      element,
      title,
    });
  }, [editor, element, onClose, title]);

  const onKeyDown = useCallback((event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onCreate();
    }
  }, [onCreate]);

  return (
    <Modal isOpen={isOpen} toggle={onClose} zIndex={1071} returnFocusAfterClose={false}>
      <ModalHeader toggle={onClose}>{t('New_page')}</ModalHeader>
      <ModalBody>
        <div className="form-group mb-0">
          <Label for="createWikiPageTitle">{t('Page_name')}</Label>
          <Input
            innerRef={inputRef}
            id="createWikiPageTitle"
            type="text"
            value={title}
            autoFocus={true}
            onChange={onChange}
            onKeyDown={onKeyDown}
          />
          {error && <Alert color="danger" className="mt-2 mb-0">{t(error)}</Alert>}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={onClose}>{t('Cancel')}</Button>
        <Button color="primary" onClick={onCreate}>{t('Create')}</Button>
      </ModalFooter>
    </Modal>
  );
};

export default CreatePageDialog;
