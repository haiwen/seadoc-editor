import React from 'react';
import { UncontrolledPopover } from 'reactstrap';
import classnames from 'classnames';
import PropTypes from 'prop-types';

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

  return (
    <>
      <button className={validClassName} type="button" aria-label='more' id={buttonId}>
        <i className="sdocfont sdoc-more"></i>
      </button>
      <UncontrolledPopover
        target={buttonId}
        className="sdoc-menu-popover sdoc-dropdown-menu"
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
