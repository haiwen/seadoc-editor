import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { EventBus } from '@seafile/sdoc-editor';

export default function MobileEditing() {
  const { t } = useTranslation('sdoc-editor');
  const [insertText, setInsertText] = useState('Edit');
  const isEdit = useRef(false);

  const onEditToggle = useCallback(() => {
    if (isEdit.current) {
      isEdit.current = false;
      setInsertText('Edit');
    } else {
      isEdit.current = true;
      setInsertText('Finish');
    }

    const eventBus = EventBus.getInstance();
    eventBus.dispatch('ViewOrEdit', { isEdit: isEdit.current });
  }, []);

  return (
    <span className='op-item' id='op-edit' onClick={onEditToggle}>
      {t(insertText)}
    </span>
  );
}
