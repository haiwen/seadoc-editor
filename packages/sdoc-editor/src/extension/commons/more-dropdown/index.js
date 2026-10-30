import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UncontrolledPopover } from 'reactstrap';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import Tooltip from '../../../components/tooltip';

const MoreDropdown = ({
  id = 'sdoc-more-text-operations',
  isRichEditor = true,
  className = 'menu-group-item',
  disabled,
  children
}) => {
  const popoverRef = useRef(null);
  const validClassName = classnames(className, 'sdoc-more-text-button', {
    'disabled': disabled,
    'rich-icon-btn': isRichEditor,
    'rich-icon-btn-disabled': isRichEditor && disabled,
    'rich-icon-btn-hover': isRichEditor && !disabled,
    'btn btn-icon btn-secondary btn-active': !isRichEditor,
  });
  const { t } = useTranslation('sdoc-editor');

  const [isShowMenu, setIsShowMenu] = useState(false);

  const toggle = useCallback((event) => {
    popoverRef.current.toggle();
    setIsShowMenu(!isShowMenu);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShowMenu]);

  return (
    <>
      <button className={validClassName} type="button" aria-label='more' id={id}>
        <i className="sdocfont sdoc-more"></i>
        {!isShowMenu && (
          <Tooltip target={id}>
            {t('More_operation')}
          </Tooltip>
        )}
      </button>
      <UncontrolledPopover
        target={id}
        className="sdoc-dropdown-menu"
        popperClassName="sdoc-popover-box-shadow"
        trigger="legacy"
        placement="bottom-end"
        hideArrow={true}
        toggle={toggle}
        fade={false}
        ref={popoverRef}
      >
        <div className="menu-group">
          {children}
        </div>
      </UncontrolledPopover>
    </>

  );
};

MoreDropdown.propTypes = {
  id: PropTypes.string,
  disabled: PropTypes.bool,
  isRichEditor: PropTypes.bool,
  children: PropTypes.array.isRequired,
  classnames: PropTypes.string,
};

export default MoreDropdown;
