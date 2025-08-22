import React, { useCallback, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { Transforms } from '@seafile/slate';
import { ReactEditor, useReadOnly } from '@seafile/slate-react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import toaster from '../../../../components/toast';
import { INTERNAL_EVENT } from '../../../../constants';
import { usePlugins } from '../../../../hooks/use-plugins';
import EventBus from '../../../../utils/event-bus';
import { ElementPopover } from '../../../commons';
import { SDOC_LINK_TYPE_CONFIG, SDOC_LINK_TYPE, SDOC_LINK_TYPES } from '../constants';
import { isInTable, onCopySdocLinkNode } from '../helpers';

import './index.css';

const propTypes = {
  editor: PropTypes.object.isRequired,
  menuPosition: PropTypes.object.isRequired,
  url: PropTypes.string.isRequired,
  element: PropTypes.object.isRequired,
  onUnwrapFileLinkNode: PropTypes.func
};

const SdocLinkHoverMenu = ({ editor, menuPosition, element, onUnwrapFileLinkNode, onHideInsertHoverMenu, t, url }) => {
  const { updateDisplayPlugin } = usePlugins();
  const readOnly = useReadOnly();
  const [isShowDisplayStylePopover, setIsShowDisplayStylePopover] = useState(false);

  const onCopy = useCallback((e) => {
    e.stopPropagation();
    onCopySdocLinkNode(editor, element);
    toaster.success(t('Copied'), { hasCloseButton: false, duration: 2 });
    onHideInsertHoverMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onShowProver = useCallback((e) => {
    setIsShowDisplayStylePopover(true);
  }, []);

  const onSelect = useCallback((event, value) => {
    event.stopPropagation();
    const path = ReactEditor.findPath(editor, element);
    if (path) {
      Transforms.setNodes(editor, { display_type: value }, { at: path });
    }
    onHideInsertHoverMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenLinkPreview = useCallback((pluginName) => {
    updateDisplayPlugin(pluginName, true);
    const { doc_uuid, title, type } = element;

    const eventBus = EventBus.getInstance();
    eventBus.dispatch(INTERNAL_EVENT.TRANSFER_PREVIEW_FILE_ID, { doc_uuid, title, type });
  }, [updateDisplayPlugin]);

  const selectedType = element.display_type || SDOC_LINK_TYPE.TEXT_LINK;
  const id = `sdoc-link-display-type-${element.id}`;
  const newSdocFileTypes = SDOC_LINK_TYPES.filter(sdocLinkType => isInTable(editor, element) ? sdocLinkType !== SDOC_LINK_TYPE.CARD_LINK : true);

  return (
    <ElementPopover>
      <div className="sdoc-link-hover-menu-container" style={menuPosition}>
        <div className='hover-menu-container'>
          <span className='op-group-item'>
            <span role="button" className={classnames('op-item', { 'ml-0': readOnly })}>
              <a href={url} target="_blank" rel="noopener noreferrer" className="link-op-menu-link">{t('Open_link')}</a>
            </span>
          </span>
          {!readOnly && (
            <>
              <span className='op-group-item'>
                <span role="button" className='op-item' onClick={onCopy}>
                  <i className='sdocfont sdoc-copy icon-font'></i>
                </span>
                <span
                  role="button"
                  className={`op-item ${isShowDisplayStylePopover ? 'link-style-icon-active' : '' }`}
                  onClick={onShowProver}
                  id={id}
                >
                  <i className={classnames('icon-font mr-1', SDOC_LINK_TYPE_CONFIG[selectedType].icon)}></i>
                  <i className='sdocfont sdoc-drop-down icon-font'></i>
                </span>
              </span>
              <span className='op-group-item'>
                <span role="button" className={'op-item'} onClick={onUnwrapFileLinkNode}>
                  <i className='sdocfont sdoc-unlink icon-font'></i>
                </span>
                <span role="button" className='op-item' onClick={() => handleOpenLinkPreview('sdoc-file-preview')}>
                  <i className='sdocfont eye icon-font'></i>
                </span>
              </span>
            </>
          )}
        </div>
        {isShowDisplayStylePopover && (
          <div className="sdoc-file-display-style-popover sdoc-dropdown-menu">
            {newSdocFileTypes.map((sdocLinkType) => {
              return (
                <div
                  key={sdocLinkType}
                  date-type={sdocLinkType}
                  className="sdoc-dropdown-menu-item sdoc-dropdown-item-with-left-icon pr-2"
                  onClick={(event) => onSelect(event, sdocLinkType)}
                >
                  <div className="sdoc-dropdown-item-content">
                    <i className={classnames('sdoc-dropdown-item-content-icon', SDOC_LINK_TYPE_CONFIG[sdocLinkType].icon)}></i>
                    <span>{t(SDOC_LINK_TYPE_CONFIG[sdocLinkType].text)}</span>
                  </div>
                  {selectedType === sdocLinkType && (<i className="sdocfont sdoc-check-mark sdoc-dropdown-item-right-icon"></i>)}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ElementPopover>
  );
};

SdocLinkHoverMenu.propTypes = propTypes;

export default withTranslation('sdoc-editor')(SdocLinkHoverMenu);
