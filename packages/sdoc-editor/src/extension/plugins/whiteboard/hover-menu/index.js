import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import Tooltip from '../../../../components/tooltip';
import { ElementPopover } from '../../../commons';

import './index.css';

const propTypes = {
  menuPosition: PropTypes.object.isRequired,
  onOpen: PropTypes.func.isRequired,
  openFullscreen: PropTypes.func.isRequired,
  onDeleteWhiteboard: PropTypes.func.isRequired,
};

const WhiteboardHoverMenu = ({ menuPosition, onOpen, openFullscreen, onDeleteWhiteboard }) => {
  const { t } = useTranslation('sdoc-editor');
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    setShowTooltip(true);
  }, []);

  return (
    <ElementPopover>
      <div className="sdoc-whiteboard-hover-menu-container" style={menuPosition}>
        <div className='hover-menu-container'>
          <span className='op-group-item'>
            <span
              id='sdoc_whiteboard_open'
              role="button"
              className='op-item'
              onClick={onOpen}
            >
              <span className='mr-1'>{t('Open')}</span>
            </span>
          </span>
          <span className='op-group-item'>
            <span
              id='sdoc_whiteboard_delete'
              role="button"
              className='op-item'
              onClick={onDeleteWhiteboard}
            >
              <i className='sdocfont sdoc-delete icon-font'/>
              {showTooltip &&
                <Tooltip target='sdoc_whiteboard_delete' placement='top' fade={true}>
                  {t('Delete')}
                </Tooltip>}
            </span>
          </span>
          <span className='op-group-item'>
            <span
              id='sdoc_whiteboard_full_screen_mode'
              role="button"
              className='op-item'
              onClick={openFullscreen}
            >
              <i className='sdocfont sdoc-fullscreen icon-font'/>
              {showTooltip &&
                <Tooltip target='sdoc_whiteboard_full_screen_mode' placement='top' fade={true}>
                  {t('Full_screen_mode')}
                </Tooltip>}
            </span>
          </span>
        </div>
      </div>
    </ElementPopover>
  );
};

WhiteboardHoverMenu.propTypes = propTypes;

export default WhiteboardHoverMenu;
