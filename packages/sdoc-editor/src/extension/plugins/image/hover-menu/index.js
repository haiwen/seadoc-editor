import React, { useCallback, useEffect, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { Editor, Transforms } from '@seafile/slate';
import { ReactEditor } from '@seafile/slate-react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import Tooltip from '../../../../components/tooltip';
import { ElementPopover } from '../../../commons';
import { MENUS_CONFIG_MAP, TEXT_ALIGN, PARAGRAPH, IMAGE_BLOCK, TABLE, BLOCKQUOTE, CALL_OUT, MULTI_COLUMN } from '../../../constants';
import { generateEmptyElement } from '../../../core';
import { IMAGE_DISPLAY_TYPE, IMAGE_BORDER_TYPE } from '../constants';
import ImagePreviewer from '../dialogs/image-previewer';
import { getImageURL } from '../helpers';

import './index.css';

const propTypes = {
  editor: PropTypes.object.isRequired,
  menuPosition: PropTypes.object.isRequired,
  element: PropTypes.object.isRequired,
  imageCaptionInputRef: PropTypes.object,
  onHideImageHoverMenu: PropTypes.func,
};

const ImageHoverMenu = ({ editor, menuPosition, element, parentNodeEntry, imageCaptionInputRef, onHideImageHoverMenu, t, readonly }) => {
  const { data, border_type = IMAGE_BORDER_TYPE[0].type } = element;
  const { align = 'left', type } = parentNodeEntry[0];
  const { show_caption = false } = data;
  const [popoverState, setPopoverState] = useState({
    displayPopover: false,
    alignPopover: false,
    borderPopover: false,
  });
  const [isShowImagePreview, setIsShowImagePreview] = useState(false);
  const [isShowTooltip, setIsShowTooltip] = useState(false);

  useEffect(() => {
    setIsShowTooltip(true);
  }, []);

  const onShowProver = useCallback((event, showProverKey) => {
    event.stopPropagation();
    const newPopoverState = popoverState;
    for (let key in newPopoverState) {
      if (key === showProverKey) {
        newPopoverState[key] = !newPopoverState[key];
      } else {
        newPopoverState[key] = false;
      }
    }
    setPopoverState({ ...newPopoverState });
  }, [popoverState]);

  const onSelect = useCallback((event, props) => {
    event.stopPropagation();
    const path = ReactEditor.findPath(editor, element);
    if (path) {
      if (props['display_type'] === IMAGE_BLOCK && type === PARAGRAPH) {
        // Remove old node
        const nodeEntry = Editor.node(editor, [path[0]]);
        const newNodeEntry = JSON.parse(JSON.stringify(nodeEntry.slice(0)));
        Transforms.removeNodes(editor, { at: [path[0]] });
        // Insert new node
        const index = newNodeEntry[0].children.findIndex((item) => item.id === element.id);
        const beforeLeaf = newNodeEntry[0].children.slice(0, index);
        const imageLeaf = newNodeEntry[0].children.slice(index, index + 1);
        const afterLeaf = newNodeEntry[0].children.slice(index + 1);
        let beforeNode = null;
        let centerNode = null;
        let afterNode = null;
        let p = path[0];

        if (!beforeLeaf.every((item) => item?.text?.length === 0)) {
          beforeNode = generateEmptyElement(PARAGRAPH);
          beforeNode.children = beforeLeaf;
          Transforms.insertNodes(editor, beforeNode, { at: [p] });
          p = p + 1;
        }

        centerNode = generateEmptyElement(IMAGE_BLOCK);
        centerNode.children = imageLeaf;
        Transforms.insertNodes(editor, centerNode, { at: [p] });
        p = p + 1;

        if (!afterLeaf.every((item) => item?.text?.length === 0)) {
          afterNode = generateEmptyElement(PARAGRAPH);
          afterNode.children = afterLeaf;
          Transforms.insertNodes(editor, afterNode, { at: [p] });
        }
        return;
      }
      if (props['display_type'] === PARAGRAPH && type === IMAGE_BLOCK) {
        const nodeEntry = Editor.node(editor, [path[0]]);
        const newNodeEntry = JSON.parse(JSON.stringify(nodeEntry.slice(0)));
        Transforms.removeNodes(editor, { at: [path[0]] });
        const newNode = generateEmptyElement(PARAGRAPH);
        newNode.children = newNodeEntry[0].children;
        Transforms.insertNodes(editor, newNode, { at: [path[0]] });
        return;
      }
      if (props['align']) {
        Transforms.setNodes(editor, props, { at: [path[0]] });
        onHideImageHoverMenu();
        return;
      }
      if (props['border_type']) {
        Transforms.setNodes(editor, props, { at: path });
        onHideImageHoverMenu();
        return;
      }
      if (Object.keys(props)[0] === 'show_caption') {
        Transforms.setNodes(editor, { data: { ...data, ...props } }, { at: path });
        queueMicrotask(() => {
          if (imageCaptionInputRef.current) {
            imageCaptionInputRef.current.focus();
          }
        });
        return;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ElementPopover>
      <div className="sdoc-image-hover-menu-container" style={menuPosition}>
        <div className='hover-menu-container'>
          {![TABLE, BLOCKQUOTE, CALL_OUT, MULTI_COLUMN].includes(type) && !readonly && (
            <span className='op-group-item'>
              <span
                role="button"
                className={classnames('op-item', { 'active': popoverState.displayPopover })}
                onClick={(e) => {
                  onShowProver(e, 'displayPopover');
                }}
              >
                <span className='mr-1'>{t(type === IMAGE_BLOCK ? 'Block' : 'Inline')}</span>
                <i className='sdocfont sdoc-arrow-down'/>
              </span>
            </span>)}
          {
            !readonly && (
              <span className='op-group-item'>
                {type === IMAGE_BLOCK && (
                  <span
                    role="button"
                    className={classnames('op-item', { 'active': popoverState.alignPopover })}
                    onClick={(e) => {
                      onShowProver(e, 'alignPopover');
                    }}
                  >
                    <i className={classnames(`sdocfont sdoc-align-${align || 'left'} mr-1`)}/>
                    <i className='sdocfont sdoc-arrow-down'/>
                  </span>
                )}
                <span
                  id='sdoc_image_border'
                  role="button"
                  className={classnames('op-item', 'ml-1', { 'active': popoverState.borderPopover })}
                  onClick={(e) => {
                    onShowProver(e, 'borderPopover');
                  }}
                >
                  <i className='sdocfont sdoc-image mr-1'/>
                  <i className='sdocfont sdoc-arrow-down'/>
                  {isShowTooltip && (
                    <Tooltip target='sdoc_image_border' placement='top' fade={true}>
                      {t('Image_border')}
                    </Tooltip>
                  )}
                </span>
                {type === IMAGE_BLOCK && (
                  <span
                    id='sdoc_image_caption'
                    role="button"
                    className={classnames('op-item', 'ml-1', { 'active': show_caption })}
                    onClick={(event) => onSelect(event, { 'show_caption': !show_caption })}
                  >
                    <i className='sdocfont sdoc-caption mr-1'/>
                    {isShowTooltip && (
                      <Tooltip target='sdoc_image_caption' placement='top' fade={true}>
                        {t('Caption')}
                      </Tooltip>
                    )}
                  </span>
                )}
              </span>)
          }
          <span className='op-group-item'>
            <span
              id='sdoc_image_full_screen_mode'
              role="button"
              className='op-item'
              onClick={(e) => {
                e.stopPropagation();
                setIsShowImagePreview(!isShowImagePreview);
              }}
            >
              <i className='sdocfont sdoc-fullscreen'/>
              {isShowTooltip && (
                <Tooltip target='sdoc_image_full_screen_mode' placement='top' fade={true}>
                  {t('Full_screen_mode')}
                </Tooltip>
              )}
            </span>
          </span>
        </div>
        {popoverState.displayPopover && (
          <div className="sdoc-image-popover sdoc-dropdown-menu">
            {IMAGE_DISPLAY_TYPE.map((item) => {
              return (
                <div
                  key={item.value}
                  className="sdoc-dropdown-menu-item sdoc-dropdown-item-with-left-icon pr-2"
                  onClick={(event) => onSelect(event, { 'display_type': item.value })}
                >
                  <div className="sdoc-dropdown-item-content">
                    <i className='sdoc-dropdown-item-content-icon'/>
                    <span>{t(item.text)}</span>
                  </div>
                  {type === item.value && (<i className="sdocfont sdoc-check-mark sdoc-dropdown-item-right-icon"/>)}
                </div>
              );
            })}
          </div>
        )}
        {popoverState.alignPopover && (
          <div className="sdoc-image-popover align-popover sdoc-dropdown-menu">
            {MENUS_CONFIG_MAP[TEXT_ALIGN].map((item) => {
              return (
                <div
                  key={item.id}
                  className="sdoc-dropdown-menu-item sdoc-dropdown-item-with-left-icon pr-2"
                  onClick={(event) => onSelect(event, { align: item.type })}
                >
                  <div className="sdoc-dropdown-item-content">
                    <i className={classnames(item.iconClass)}/>
                  </div>
                  {align === item.type && (<i className="sdocfont sdoc-check-mark sdoc-dropdown-item-right-icon"/>)}
                </div>
              );
            })}
          </div>
        )}
        {popoverState.borderPopover && (
          <div className="sdoc-image-popover border-popover sdoc-dropdown-menu">
            {IMAGE_BORDER_TYPE.map((item) => {
              return (
                <div
                  key={item.type}
                  className="sdoc-dropdown-menu-item sdoc-dropdown-item-with-left-icon pr-2"
                  onClick={(event) => onSelect(event, { border_type: item.type })}
                >
                  <div className="sdoc-dropdown-item-content">
                    <img src={item.imgUrl} draggable={false} alt=''/>
                    {border_type === item.type && <i className="sdocfont sdoc-check-mark sdoc-dropdown-item-right-icon"/>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {isShowImagePreview && (
          <ImagePreviewer
            imageUrl={getImageURL(data, editor)}
            editor={editor}
            toggleImagePreviewer={() => {
              setIsShowImagePreview(!isShowImagePreview);
            }}
            t={t}
          />
        )}
      </div>
    </ElementPopover>
  );
};

ImageHoverMenu.propTypes = propTypes;

export default withTranslation('sdoc-editor')(ImageHoverMenu);
