import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { UncontrolledPopover } from 'reactstrap';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import Tooltip from '../../../../components/tooltip';
import EventBus from '../../../../utils/event-bus';
import CodeBlockMenu from '../../../plugins/code-block/menu';
import FileLinkMenu from '../../../plugins/file-link/menu';
import ImageMenu from '../../../plugins/image/menu';
import LinkMenu from '../../../plugins/link/menu';
import SdocLinkMenu from '../../../plugins/sdoc-link/menu';
import TableMenu from '../../../plugins/table/menu/table-menu';
import VideoMenu from '../../../plugins/video/menu';

import './index.css';

const InsertToolbar = ({
  isRichEditor = true,
  className = 'menu-group-item',
  editor,
  readonly
}) => {
  const [isShowMenu, setMenuShow] = useState(false);
  const { t } = useTranslation('sdoc-editor');
  const popoverRef = useRef(null);
  const disabled = readonly;
  const insertButtonRef = useRef(null);
  const insertToolbarId = 'sdoc-insert-toolbar-btn';

  const eventBus = useMemo(() => {
    return EventBus.getInstance();
  }, []);

  const toggle = useCallback((event) => {
    if (event?.target && event?.target?.tagName === 'INPUT') {
      return;
    }
    popoverRef.current && popoverRef.current.toggle();
    setMenuShow(!isShowMenu);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShowMenu]);

  const validClassName = classnames(className, 'sdoc-menu-with-dropdown sdoc-insert-toolbar-btn', {
    'menu-show': isShowMenu,
    'disabled': disabled,
    'rich-icon-btn d-flex': isRichEditor,
    'rich-icon-btn-disabled': isRichEditor && disabled,
    'rich-icon-btn-hover': isRichEditor && !disabled,
    'btn btn-icon btn-secondary btn-active d-flex': !isRichEditor,
  });

  const caretIconClass = `sdoc-menu-with-dropdown-triangle-icon sdocfont sdoc-${isShowMenu ? 'caret-up' : 'drop-down'}`;
  const { bottom } = insertButtonRef.current ? insertButtonRef.current.getBoundingClientRect() : { bottom: 92.5 };
  const props = {
    eventBus,
    editor,
    readonly,
    toggle,
  };

  return (
    <>
      <button type='button' className={validClassName} id={insertToolbarId} disabled={disabled} ref={insertButtonRef}>
        <div className='sdoc-menu-with-dropdown-icon'>
          <i className='sdocfont sdoc-insert mr-1'></i>
          <span className='text-truncate'>{t('Insert')}</span>
        </div>
        <div className='sdoc-menu-with-dropdown-triangle'>
          <span className={caretIconClass}></span>
        </div>
      </button>
      <Tooltip target={insertToolbarId}>
        {t('Insert')}
      </Tooltip>
      {!disabled && (
        <UncontrolledPopover
          target={insertToolbarId}
          className='sdoc-menu-popover sdoc-dropdown-menu sdoc-insert-menu-popover'
          trigger='legacy'
          placement='bottom-start'
          hideArrow={true}
          toggle={toggle}
          fade={false}
          ref={popoverRef}
        >
          <div className='sdoc-insert-menu-container sdoc-dropdown-menu-container' style={{ maxHeight: window.innerHeight - bottom - 100 }}>
            <ImageMenu { ...props } />
            <TableMenu { ...props } />
            <VideoMenu { ...props } />
            <LinkMenu { ...props } />
            <CodeBlockMenu { ...props } />
            <div className="sdoc-dropdown-menu-divider"></div>
            <SdocLinkMenu { ...props } />
            <FileLinkMenu { ...props } />
          </div>
        </UncontrolledPopover>
      )}
    </>
  );

};

InsertToolbar.propTypes = {
  editor: PropTypes.object.isRequired,
};

export default InsertToolbar;
