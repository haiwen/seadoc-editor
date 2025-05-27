import React from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import AskAIIcon from '../../../../assets/images/sdoc-ask-ai.png';

import './style.css';

export default function AIIcon({ className = 'big' }) {
  const { t } = useTranslation('sdoc-editor');

  const classnames = classNames('sdoc-ask-ai-icon', className);
  return (
    <img className={classnames} src={AskAIIcon} alt={t('Ask_AI')}></img>
  );

}
