import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { UncontrolledPopover } from 'reactstrap';
import PropTypes from 'prop-types';
import { INTERNAL_EVENT } from '../../../../constants';
import DropdownMenuItem from '../../../commons/dropdown-menu-item';
import { VIDEO, MENUS_CONFIG_MAP, LOCAL_VIDEO, ELEMENT_TYPE } from '../../../constants';
import { insertVideo, isInsertVideoMenuDisabled } from '../helpers';

const VideoMenu = ({ editor, readonly, toggle, eventBus }) => {
  const disabled = isInsertVideoMenuDisabled(editor, readonly);
  const menuConfig = MENUS_CONFIG_MAP[VIDEO];
  const { t } = useTranslation('sdoc-editor');

  const openLocalVideoDialog = useCallback(() => {
    eventBus.dispatch(INTERNAL_EVENT.INSERT_ELEMENT, { type: LOCAL_VIDEO, editor });
  }, [editor, eventBus]);

  const addVideoLink = useCallback(() => {
    eventBus.dispatch(INTERNAL_EVENT.INSERT_ELEMENT, { type: ELEMENT_TYPE.VIDEO_LINK, editor });
    toggle && toggle();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, eventBus]);

  const openSelectVideoFileDialog = useCallback(() => {
    eventBus.dispatch(INTERNAL_EVENT.INSERT_ELEMENT, { type: ELEMENT_TYPE.VIDEO, insertVideo: insertVideo });
    toggle && toggle();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggle, eventBus]);

  return (
    <>
      <DropdownMenuItem disabled={disabled} menuConfig={menuConfig} className="pr-2">
        {!disabled && (
          <i className="sdocfont sdoc-right-slide sdoc-dropdown-item-right-icon"></i>
        )}
      </DropdownMenuItem>
      {!disabled && (
        <UncontrolledPopover
          target={menuConfig.id}
          trigger="hover"
          className="sdoc-menu-popover sdoc-dropdown-menu sdoc-sub-dropdown-menu sdoc-insert-video-menu-popover"
          placement="right-start"
          hideArrow={true}
          fade={false}
        >
          <div className="sdoc-insert-video-menu-popover-container sdoc-dropdown-menu-container">
            <div className="sdoc-dropdown-menu-item" onClick={openLocalVideoDialog}>{t('Upload_local_video')}</div>
            <div className="sdoc-dropdown-menu-item" onClick={addVideoLink}>{t('Add_video_link')}</div>
            <div className="sdoc-dropdown-menu-item" onClick={openSelectVideoFileDialog}>{t('Link_video_file')}</div>
          </div>
        </UncontrolledPopover>
      )}
    </>
  );
};

VideoMenu.propTypes = {
  readonly: PropTypes.bool,
  editor: PropTypes.object,
  eventBus: PropTypes.object,
};

export default VideoMenu;
