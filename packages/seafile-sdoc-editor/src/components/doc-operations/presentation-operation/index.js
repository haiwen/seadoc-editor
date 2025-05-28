import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { EventBus, Tooltip, INTERNAL_EVENT } from '@seafile/sdoc-editor';

const PresentationOperation = () => {
  const { t } = useTranslation('sdoc-editor');
  const id = 'sdoc_presentation';

  const onPresentationToggle = useCallback(() => {

    const eventBus = EventBus.getInstance();
    eventBus.dispatch(INTERNAL_EVENT.TOGGLE_PRESENTATION_MODE, { isShowFullScreen: true });

    const node = document.querySelector('.sdoc-editor-container');
    if (node?.requestFullscreen) {
      node.requestFullscreen().catch(err => console.error('Failed to enter fullscreen:', err));
    }
  }, []);

  return (
    <span className='op-item' id={id} onClick={onPresentationToggle}>
      <i className='sdocfont sdoc-presentation'></i>
      <Tooltip target={id}>
        {t('Presentation')}
      </Tooltip>
    </span>
  );
};

export default PresentationOperation;
