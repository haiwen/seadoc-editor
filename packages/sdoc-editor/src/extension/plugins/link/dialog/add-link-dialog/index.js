import React, { Fragment, useCallback, useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, ModalBody, ModalFooter, Alert, Label, ModalHeader } from 'reactstrap';
import { Element } from '@seafile/slate';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { createProcessor } from '../../../../../slate-convert/md-to-html';
import slateToMdString from '../../../../../slate-convert/slate-to-md';
import { INTERNAL_LINKED_TYPE } from '../../../../constants';
import { getEditorString } from '../../../../core';
import { insertLink, updateLink, checkLink, parseHtmlString, isEmptyNode } from '../../helpers';

import './index.css';

const AddLinkDialog = ({ editor, className, element, insertPosition, slateNode, closeDialog, linkTitle, handleSubmit }) => {
  const { t } = useTranslation('sdoc-editor');
  const [linkErrorMessage, setLinkErrorMessage] = useState('');
  const [titleErrorMessage, setTitleErrorMessage] = useState('');
  const { href: oldURL, linked_id } = element || { href: '' };
  const oldTitle = element?.children[0].text || linkTitle || '';
  const initTitle = useMemo(() => oldTitle ? oldTitle : getEditorString(editor, editor.selection), [editor, oldTitle]);
  const [title, setTitle] = useState(initTitle);
  const [url, setURL] = useState(linked_id ? '' : oldURL);
  const [activeTab, setActiveTab] = useState(linked_id ? 'block' : 'url');
  const [selectedBlockId, setSelectedBlockId] = useState('');
  const [isOpenSelect, setIsOpenSelect] = useState(false);
  const [isOpenSelectHeader, setIsOpenSelectHeader] = useState(false);
  const [isOpenSelectImageBlock, setIsOpenSelectImageBlock] = useState(false);
  const [isOpenSelectCodeBlock, setIsOpenSelectCodeBlock] = useState(false);
  const [isOpenSelectBlockquote, setIsOpenSelectBlockquote] = useState(false);
  const [htmlString, setHtmlString] = useState('');

  const submit = useCallback(() => {
    setLinkErrorMessage('');
    setTitleErrorMessage('');

    if (!url && !selectedBlockId) {
      setLinkErrorMessage(t('The_link_address_or_link_block_is_required'));
      return;
    }
    if (!title) {
      setTitleErrorMessage(t('The_link_title_is_required'));
      return;
    }
    if (url && checkLink(url)) {
      setLinkErrorMessage(t('The_link_address_is_invalid'));
      return;
    }

    const isEdit = oldURL || oldTitle;
    if (isEdit) {
      updateLink(editor, title, url, selectedBlockId);
    } else {
      insertLink(editor, title, url, insertPosition, slateNode, selectedBlockId);
    }

    handleSubmit && handleSubmit();
    closeDialog();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, url, title, oldTitle, oldURL, insertPosition, selectedBlockId]);

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
    setSelectedBlockId('');

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

  const handleOnChangeBlock = (e) => {
    const block = e.target.closest('.linked-block-item');
    if (block) {
      const clone = block.cloneNode(true);
      const displayContainer = document.getElementById('selected-block-display');
      displayContainer.innerHTML = '';
      displayContainer.appendChild(clone);

      const nodeId = block.dataset.id;
      setSelectedBlockId(nodeId);
      setURL('');
      setIsOpenSelect(false);
    }
  };

  useEffect(() => {
    if (!linked_id) return;
    const timer = setTimeout(() => {
      const displayContainer = document.getElementById('selected-block-display');
      if (!displayContainer) return;

      // 'data-parent-id' check for linked image block node
      const linkedDomNode = document.querySelector(`[data-id="${linked_id}"]`) || document.querySelector(`[data-parent-id="${linked_id}"]`);
      if (linkedDomNode) {
        const clone = linkedDomNode.cloneNode(true);
        displayContainer.innerHTML = '';
        displayContainer.appendChild(clone);
      }
    }, 0);

    return () => clearTimeout(timer);

  }, []);

  useEffect(() => {
    const genHtml = async () => {
      const list = editor.children.filter(node => Element.isElement(node) && !isEmptyNode(node) && INTERNAL_LINKED_TYPE.includes(node.type));

      const mdValue = list
        .map(node => `<!--${node.id}-->\n${slateToMdString([node])}`)
        .join('\n\n');
      const ids = list.map(n => n.id);
      const processor = createProcessor(ids, 'linked-block-item');
      const file = await processor.process(mdValue);

      setHtmlString(String(file));
    };

    genHtml();
  }, [editor.children]);

  const headersHTML = parseHtmlString(htmlString, 'h1,h2,h3,h4,h5,h6');
  const imagesHTML = parseHtmlString(htmlString, 'img');
  const codeBlockHTML = parseHtmlString(htmlString, 'pre');
  const blockquoteHTML = parseHtmlString(htmlString, 'blockquote');

  return (
    <Modal isOpen={true} autoFocus={false} toggle={closeDialog} className={className} zIndex={1071} returnFocusAfterClose={false}>
      <ModalHeader close={close}>{t('Insert_link')}</ModalHeader>
      <ModalBody>
        <Fragment>
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
          <div className="select-btn">
            <div
              className={classnames('link-address-btn', { 'active': activeTab === 'url' })}
              onClick={() => setActiveTab('url')}
            >
              {t('Link_address')}
            </div>
            <div
              className={classnames('link-block-btn', { 'active': activeTab === 'block' })}
              onClick={() => setActiveTab('block')}
            >
              {t('Link_block')}
            </div>
          </div>
          {activeTab === 'url' && (
            <div className="form-group">
              <input
                onKeyDown={onKeyDown}
                autoFocus={true}
                type="url"
                className="form-control"
                id="addLink"
                value={url || ''}
                onChange={handleUrlChange}
              />
              {linkErrorMessage && (
                <Alert color="danger" className="mt-2">
                  {t(linkErrorMessage)}
                </Alert>
              )}
            </div>
          )}
          {activeTab === 'block' && (
            <div className="form-group selected-linked-block-wrapper">
              <div
                className={classnames('form-control', { 'expanded': isOpenSelect })}
                onClick={() => {
                  setIsOpenSelect(!isOpenSelect);
                }}
              >
                <span id='selected-block-display' className='selected-linked-block'></span>
                <i className='sdoc-file-icon sdoc-file-icon-toggle sdocfont sdoc-right-slide'></i>
              </div>
              {isOpenSelect && (
                <div className='link-block-wrapper'>
                  {headersHTML &&
                    <div className={classnames('select-block-wrapper', { 'expanded': isOpenSelectHeader })}
                      onClick={(e) => setIsOpenSelectHeader(!isOpenSelectHeader)}
                    >
                      <i className='sdoc-file-icon sdoc-file-icon-toggle sdocfont sdoc-right-slide'></i>
                      <div className='title'>{t('Header')}</div>
                    </div>
                  }
                  {isOpenSelectHeader && (
                    <div className='link-block-container'
                      dangerouslySetInnerHTML={{ __html: headersHTML }}
                      onClick={(e) => handleOnChangeBlock(e)}
                    />
                  )}
                  {imagesHTML &&
                    <div className={classnames('select-block-wrapper', { 'expanded': isOpenSelectImageBlock })}
                      onClick={(e) => setIsOpenSelectImageBlock(!isOpenSelectImageBlock)}
                    >
                      <i className='sdoc-file-icon sdoc-file-icon-toggle sdocfont sdoc-right-slide'></i>
                      <div className='title'>{t('Image')}</div>
                    </div>
                  }
                  {isOpenSelectImageBlock && (
                    <div className='link-block-container'
                      dangerouslySetInnerHTML={{ __html: imagesHTML }}
                      onClick={(e) => handleOnChangeBlock(e)}
                    />
                  )}
                  {codeBlockHTML &&
                    <div className={classnames('select-block-wrapper', { 'expanded': isOpenSelectCodeBlock })}
                      onClick={(e) => setIsOpenSelectCodeBlock(!isOpenSelectCodeBlock)}
                    >
                      <i className='sdoc-file-icon sdoc-file-icon-toggle sdocfont sdoc-right-slide'></i>
                      <div className='title'>{t('Code_block')}</div>
                    </div>
                  }
                  {isOpenSelectCodeBlock && (
                    <div className='link-block-container'
                      dangerouslySetInnerHTML={{ __html: codeBlockHTML }}
                      onClick={(e) => handleOnChangeBlock(e)}
                    />
                  )}
                  {blockquoteHTML &&
                    <div className={classnames('select-block-wrapper', { 'expanded': isOpenSelectBlockquote })}
                      onClick={(e) => setIsOpenSelectBlockquote(!isOpenSelectBlockquote)}
                    >
                      <i className='sdoc-file-icon sdoc-file-icon-toggle sdocfont sdoc-right-slide'></i>
                      <div className='title'>{t('Quote')}</div>
                    </div>
                  }
                  {isOpenSelectBlockquote && (
                    <div className='link-block-container'
                      dangerouslySetInnerHTML={{ __html: blockquoteHTML }}
                      onClick={(e) => handleOnChangeBlock(e)}
                    />
                  )}
                </div>
              )}
            </div>
          )}
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
