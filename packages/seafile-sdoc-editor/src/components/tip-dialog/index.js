import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, ModalBody, ModalFooter, Button } from 'reactstrap';
import { FileLoading } from '@seafile/sdoc-editor';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import ContentReplaced from '../../assets/images/content-replaced.png';
import { TIP_TYPE, TIP_TITLE, TIP_CONTENT } from '../../constants';
import SdocModalHeader from '../modal-header';

import './index.css';

const NOT_CLOSE_DIALOG_TIP_TYPE = [
  TIP_TYPE.HAS_BEEN_REPLACED,
  TIP_TYPE.HAS_BEEN_PUBLISHED,
  TIP_TYPE.CHECKING,
  TIP_TYPE.PUBLISHING
];

const TipDialog = ({ className, tipType, onClose, onSubmit: propsOnSubmit, zIndex = 1071, children }) => {
  const { t } = useTranslation('sdoc-editor');
  const [isSubmitting, setSubmitting] = useState();

  const closeDialog = useCallback(() => {
    if (NOT_CLOSE_DIALOG_TIP_TYPE.includes(tipType)) return;
    if (isSubmitting) return;
    onClose && onClose();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipType, isSubmitting]);

  const onSubmit = useCallback(() => {
    if ([TIP_TYPE.HAS_CONFLICT_BEFORE_VIEW_CHANGES, TIP_TYPE.HAS_CONFLICT_BEFORE_PUBLISH].includes(tipType)) {
      closeDialog();
      return;
    }
    setSubmitting(true);
    propsOnSubmit && propsOnSubmit();
  }, [closeDialog, propsOnSubmit, tipType]);

  useEffect(() => {
    if (isSubmitting) {
      const timer = setTimeout(() => {
        setSubmitting(false);
      }, 3000);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [isSubmitting]);

  const refreshPage = useCallback(() => {
    window.location.reload();
  }, []);

  const renderTip = useCallback(() => {
    if (tipType === TIP_TYPE.HAS_BEEN_REPLACED) {
      return (
        <div className="sdoc-tip-dialog-custom-container">
          <div className="sdoc-tip-img-container"><img src={ContentReplaced} alt="" height="140" /></div>
          <div className="sdoc-tip-content">{t(TIP_CONTENT[tipType])}</div>
          <div className="sdoc-tip-operations-container">
            <Button color="primary" className="highlight-bg-color sdoc-tip-operation-btn" onClick={refreshPage}>
              {t('Refresh')}
            </Button>
          </div>
        </div>
      );
    }

    if (tipType === TIP_TYPE.PUBLISHING) {
      return (
        <div className="sdoc-tip-dialog-custom-container publishing">
          <FileLoading />
          <div className="sdoc-tip-content">{t(TIP_CONTENT[tipType])}</div>
        </div>
      );
    }

    return (
      <>
        <SdocModalHeader toggle={NOT_CLOSE_DIALOG_TIP_TYPE.includes(tipType) ? undefined : closeDialog}>
          {t(TIP_TITLE[tipType])}
        </SdocModalHeader>
        <ModalBody className="sdoc-tip-body">
          {children ? children : (<>{t(TIP_CONTENT[tipType])}</>)}
        </ModalBody>
        {!NOT_CLOSE_DIALOG_TIP_TYPE.includes(tipType) && (
          <ModalFooter>
            <Button color="secondary" className="mr-2" onClick={closeDialog}>{t('Cancel')}</Button>
            <Button
              color="primary"
              className={classnames('highlight-bg-color', { 'd-flex align-items-center': isSubmitting })}
              disabled={isSubmitting}
              onClick={onSubmit}
            >
              {isSubmitting && (<span className="submit-loading-container mr-2"><FileLoading/></span>)}
              {t('Confirm')}
            </Button>
          </ModalFooter>
        )}
      </>
    );
  }, [children, closeDialog, isSubmitting, onSubmit, t, tipType, refreshPage]);

  return (
    <Modal
      isOpen={true}
      autoFocus={false}
      zIndex={zIndex}
      returnFocusAfterClose={false}
      toggle={closeDialog}
      className={classnames('sdoc-tip-dialog', className)}
      contentClassName="sdoc-tip-modal"
    >
      {renderTip()}
    </Modal>
  );
};

TipDialog.propTypes = {
  className: PropTypes.string,
  tipType: PropTypes.string,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
};

export default TipDialog;
