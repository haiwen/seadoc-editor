import React from 'react';
import { useTranslation } from 'react-i18next';
import { UncontrolledPopover } from 'reactstrap';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import Tooltip from '../../../components/tooltip';

const MoreDropdown = ({
  isRichEditor = true,
  className = 'menu-group-item',
  disabled,
  children
}) => {
  const validClassName = classnames(className, 'sdoc-more-text-button', {
    'disabled': disabled,
    'rich-icon-btn': isRichEditor,
    'rich-icon-btn-disabled': isRichEditor && disabled,
    'rich-icon-btn-hover': isRichEditor && !disabled,
    'btn btn-icon btn-secondary btn-active': !isRichEditor,
  });
  const buttonId = 'sdoc-more-text-operations';
  const { t } = useTranslation('sdoc-editor');

  return (
    <>
      <button className={validClassName} type="button" aria-label='more' id={buttonId}>
        <i className="sdocfont sdoc-more"></i>
        <Tooltip target={buttonId}>
          {t('More_operation')}
        </Tooltip>
      </button>
      <UncontrolledPopover
        target={buttonId}
        className="sdoc-dropdown-menu"
        popperClassName="sdoc-popover-box-shadow"
        trigger="legacy"
        placement="bottom-end"
        hideArrow={true}
        fade={false}
      >
        <div className="menu-group">
          {children}
        </div>
      </UncontrolledPopover>
    </>

  );
};

MoreDropdown.propTypes = {
  disabled: PropTypes.bool,
  isRichEditor: PropTypes.bool,
  children: PropTypes.array.isRequired,
  classnames: PropTypes.string,
};

export default MoreDropdown;
