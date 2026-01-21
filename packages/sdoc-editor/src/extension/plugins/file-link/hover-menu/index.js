import React, { useCallback, useState, useEffect } from 'react';
import { withTranslation } from 'react-i18next';
import { Transforms } from '@seafile/slate';
import { ReactEditor, useReadOnly } from '@seafile/slate-react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import toaster from '../../../../components/toast';
import Tooltip from '../../../../components/tooltip';
import { ElementPopover } from '../../../commons';
import { TABLE_CELL } from '../../../constants';
import { getCurrentNode } from '../../../core';
import { FILE_LINK_TYPE_CONFIG, FILE_LINK_TYPE, FILE_LINK_TYPES } from '../constants';
import { getUrl, onCopyFileLinkNode } from '../helpers';

import './index.css';

const propTypes = {
  editor: PropTypes.object.isRequired,
  menuPosition: PropTypes.object.isRequired,
  element: PropTypes.object.isRequired,
  onUnwrapFileLinkNode: PropTypes.func
};

const FileLinkHoverMenu = ({ editor, menuPosition, element, onUnwrapFileLinkNode, onHideInsertHoverMenu, t }) => {
  const readOnly = useReadOnly();
  const [isShowDisplayStylePopover, setIsShowDisplayStylePopover] = useState(false);
  const [isShowTooltip, setIsShowTooltip] = useState(false);

  useEffect(() => {
    setIsShowTooltip(true);
  }, []);

  const onCopy = useCallback((e) => {
    e.stopPropagation();
    onCopyFileLinkNode(editor, element);
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

  const selectedType = element.display_type || FILE_LINK_TYPE.TEXT_LINK;
  const id = `file-link-display-type-${element.id}`;
  const newFileLinkTypes = FILE_LINK_TYPES.filter(fileLinkType => getCurrentNode(editor)[0].type === TABLE_CELL ? fileLinkType !== FILE_LINK_TYPE.CARD_LINK : true);

  return (
    <ElementPopover>
      <div className="sdoc-file-link-hover-menu-container" style={menuPosition}>
        <div className='hover-menu-container'>
          <span className='op-group-item'>
            <span role="button" className={classnames('op-item', { 'ml-0': readOnly })}>
              <a href={getUrl(element.doc_uuid)} target="_blank" rel="noopener noreferrer" className="link-op-menu-link">{t('Open_link')}</a>
            </span>
          </span>
          {!readOnly && (
            <span className='op-group-item'>
              <span id='copy_link' role="button" className='op-item' onClick={onCopy}>
                <i className='sdocfont sdoc-copy'></i>
              </span>
              {isShowTooltip && (
                <Tooltip target='copy_link' placement='top' fade={true}>
                  {t('Copy')}
                </Tooltip>
              )}
              <span
                id='select_style'
                role="button"
                className={classnames('op-item', { 'link-style-icon-active': isShowDisplayStylePopover })}
                onClick={onShowProver}
              >
                <i className={classnames('mr-1', FILE_LINK_TYPE_CONFIG[selectedType].icon)}></i>
                <i className='sdocfont sdoc-arrow-down'></i>
                {isShowDisplayStylePopover && (
                  <div className="sdoc-file-display-style-popover sdoc-dropdown-menu">
                    {newFileLinkTypes.map((fileLinkType) => {
                      return (
                        <div
                          key={fileLinkType}
                          date-type={fileLinkType}
                          className="sdoc-dropdown-menu-item sdoc-dropdown-item-with-left-icon pr-2"
                          onClick={(event) => onSelect(event, fileLinkType)}
                        >
                          <div className="sdoc-dropdown-item-content">
                            <i className={classnames('sdoc-dropdown-item-content-icon', FILE_LINK_TYPE_CONFIG[fileLinkType].icon)}></i>
                            <span>{t(FILE_LINK_TYPE_CONFIG[fileLinkType].text)}</span>
                          </div>
                          {selectedType === fileLinkType && (<i className="sdocfont sdoc-check-mark sdoc-dropdown-item-right-icon"></i>)}
                        </div>
                      );
                    })}
                  </div>
                )}
              </span>
              {isShowTooltip && (
                <Tooltip target='select_style' placement='top' fade={true}>
                  {t('Select_style')}
                </Tooltip>
              )}
              <span id='delete_link' role="button" className='op-item' onClick={onUnwrapFileLinkNode}>
                <i className='sdocfont sdoc-unlink'></i>
              </span>
              {isShowTooltip && (
                <Tooltip target='delete_link' placement='top' fade={true}>
                  {t('Remove_link')}
                </Tooltip>
              )}
            </span>
          )}
        </div>
      </div>
    </ElementPopover>
  );
};

FileLinkHoverMenu.propTypes = propTypes;

export default withTranslation('sdoc-editor')(FileLinkHoverMenu);
