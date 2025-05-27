import React from 'react';
import { useTranslation } from 'react-i18next';

const Placeholder = (props) => {
  const { title, top = 5 } = props;
  const { t } = useTranslation('sdoc-editor');
  return (
    <span contentEditable="false" suppressContentEditableWarning style={{
      position: 'absolute',
      top: `${top}px`,
      color: 'rgba(191,191,191,1)',
      pointerEvents: 'none',
      width: '100%',
      maxWidth: '100%',
      display: 'block',
      userSelect: 'none',
      textDecoration: 'none',
      left: '1px'
    }}>
      {t(title)}
    </span>
  );
};

export default Placeholder;
