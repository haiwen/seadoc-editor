import React, { useCallback } from 'react';
import { withTranslation } from 'react-i18next';
import { Button } from 'reactstrap';
import { context } from '@seafile/sdoc-editor';

import './error-page.css';

function ErrorPage({ t }) {

  const normalizeSdoc = useCallback(async () => {
    const res = await context.normalizeSdocContent();
    const { success } = res.data;
    if (success) {
      // eslint-disable-next-line no-restricted-globals
      location.reload(true);
    }
  }, []);

  return (
    <div className='error-page'>
      <span className='error-tip'>{t('Sdoc_error_tip')}</span>
      <Button className='error-button' onClick={() => normalizeSdoc()}>{t('Repair')}</Button>
    </div>
  );
}

export default withTranslation('sdoc-editor')(ErrorPage);
