import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import Tooltip from '../../../../components/tooltip';
import AIIcon from '../ai-icon';

const MenuItem = ({
  isRichEditor = true,
  className = 'menu-group-item',
  disabled,
  isActive,
  type,
  onMouseDown,
  iconClass,
  id,
  text,
  ariaLabel
}) => {
  const { t } = useTranslation('sdoc-editor');

  const onClick = useCallback((event) => {
    if (disabled) return;
    onMouseDown(event, type);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled, type]);

  const validClassName = classnames('', className, {
    'btn btn-icon btn-secondary btn-active': !isRichEditor,
    'rich-icon-btn': isRichEditor,
    'rich-icon-btn-disabled': isRichEditor && disabled,
    'rich-icon-btn-hover': isRichEditor && !disabled,
  });

  return (
    <>
      <button
        id={id}
        type="button"
        aria-label={ariaLabel}
        className={validClassName}
        disabled={disabled}
        data-active={isActive}
        onClick={onClick}
      >
        <span className='sdoc-ask-ai-menu-item'>
          <AIIcon className='small'/>
          <span>{t(text)}</span>
        </span>
      </button>
      <Tooltip target={id}>
        {t(text)}
      </Tooltip>
    </>
  );

};

MenuItem.propTypes = {
  isRichEditor: PropTypes.bool,
  disabled: PropTypes.bool.isRequired,
  isActive: PropTypes.bool.isRequired,
  className: PropTypes.string,
  id: PropTypes.string.isRequired,
  iconClass: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  onMouseDown: PropTypes.func,
};

export default MenuItem;
