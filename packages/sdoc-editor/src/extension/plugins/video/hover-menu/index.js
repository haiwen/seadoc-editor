import React, { useCallback, useState, useEffect } from 'react';
import { withTranslation } from 'react-i18next';
import { Transforms } from '@seafile/slate';
import { ReactEditor, useReadOnly } from '@seafile/slate-react';
import PropTypes from 'prop-types';
import toaster from '../../../../components/toast';
import Tooltip from '../../../../components/tooltip';
import { ElementPopover } from '../../../commons';
import { focusEditor } from '../../../core';
import { onCopyVideoNode } from '../helpers';

import './index.css';

const propTypes = {
  editor: PropTypes.object.isRequired,
  menuPosition: PropTypes.object.isRequired,
  element: PropTypes.object.isRequired,
};

const VideoHoverMenu = ({ editor, menuPosition, element, videoRef, setIsSelected, t }) => {
  const readOnly = useReadOnly();
  const [isShowTooltip, setIsShowTooltip] = useState(false);

  useEffect(() => {
    setIsShowTooltip(true);
  }, []);

  const onCopy = useCallback((e) => {
    e.stopPropagation();
    onCopyVideoNode(editor, element);
    toaster.success(t('Copied'), { hasCloseButton: false, duration: 2 });
    setIsSelected(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDeleteVideo = useCallback(() => {
    const path = ReactEditor.findPath(editor, element);
    Transforms.removeNodes(editor, { at: path });
    focusEditor(editor);
    Transforms.select(editor, editor.selection);
  }, [editor, element]);

  const handleFullScreen = () => {
    setIsSelected(false);
    videoRef.current?.requestFullscreen();
  };

  return (
    <ElementPopover>
      <div className="video-hover-menu-container" style={menuPosition}>
        <div className='hover-menu-container'>
          {!readOnly && (
            <>
              <span className='op-group-item'>
                <span id='sdoc_video_copy' role="button" className='op-item' onClick={onCopy}>
                  <i className='sdocfont sdoc-copy icon-font'></i>
                </span>
                {isShowTooltip && (
                  <Tooltip target='sdoc_video_copy' placement='top' fade={true}>
                    {t('Copy')}
                  </Tooltip>
                )}
                <span
                  id='sdoc_video_delete' role="button" className='op-item' onClick={onDeleteVideo}>
                  <i className='sdocfont sdoc-delete icon-font'/>
                  {isShowTooltip &&
                    <Tooltip target='sdoc_video_delete' placement='top' fade={true}>
                      {t('Delete')}
                    </Tooltip>}
                </span>
              </span>
              <span className='op-group-item'>
                <span
                  id='sdoc_video_full_screen_mode'
                  role="button"
                  className='op-item'
                  onClick={handleFullScreen}
                >
                  <i className='sdocfont sdoc-fullscreen icon-font'/>
                  {isShowTooltip &&
                    <Tooltip target='sdoc_video_full_screen_mode' placement='top' fade={true}>
                      {t('Full_screen_mode')}
                    </Tooltip>}
                </span>
              </span>
            </>
          )}
        </div>
      </div>
    </ElementPopover>
  );
};

VideoHoverMenu.propTypes = propTypes;

export default withTranslation('sdoc-editor')(VideoHoverMenu);
