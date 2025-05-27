import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import Tooltip from '../../../../../components/tooltip';

const FontSizeScale = ({
  isRichEditor = true,
  className = 'menu-group-item',
  children,
  id,
  disabled,
  onClick,
  tipMessage
}) => {

  const validClassName = classnames(className, {
    'disabled': disabled,
    'rich-icon-btn': isRichEditor,
    'rich-icon-btn-disabled': isRichEditor && disabled,
    'rich-icon-btn-hover': isRichEditor && !disabled,
    'btn btn-icon btn-secondary btn-active d-flex': !isRichEditor,
  });

  return (
    <>
      <button type="button" className={validClassName} disabled={disabled} onClick={disabled ? () => {} : onClick} id={id}>
        {children}
      </button>
      {tipMessage && (
        <Tooltip target={id}>
          {tipMessage}
        </Tooltip>
      )}
    </>
  );
};

FontSizeScale.propTypes = {
  disabled: PropTypes.bool,
  isRichEditor: PropTypes.bool,
  className: PropTypes.string,
  id: PropTypes.string.isRequired,
  tipMessage: PropTypes.string,
  onClick: PropTypes.func.isRequired,
};

export default FontSizeScale;
