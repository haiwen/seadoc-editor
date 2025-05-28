import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { EventBus, Tooltip } from '@seafile/sdoc-editor';
import { EXTERNAL_EVENT } from '../../../constants';

export default function ShareOperation() {
  const { t } = useTranslation('sdoc-editor');
  const id = 'sdoc-share';

  const onShareToggle = useCallback(() => {
    const eventBus = EventBus.getInstance();
    eventBus.dispatch(EXTERNAL_EVENT.SHARE_SDOC);
  }, []);

  return (
    <span className='op-item' id={id} onClick={onShareToggle}>
      <i className='sdocfont sdoc-share'></i>
      <Tooltip target={id}>
        {t('Share')}
      </Tooltip>
    </span>
  );
}
