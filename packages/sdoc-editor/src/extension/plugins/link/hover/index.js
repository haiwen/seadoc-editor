import React, { useCallback, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Editor } from '@seafile/slate';
import { ReactEditor, useReadOnly } from '@seafile/slate-react';
import PropTypes from 'prop-types';
import Tooltip from '../../../../components/tooltip';
import { isNodeInCurrentView, isWeChat } from '../helpers';

import './index.css';

const LinkHover = ({ editor, element, menuPosition, onDeleteLink, onEditLink }) => {
  const readOnly = useReadOnly();
  const { t } = useTranslation('sdoc-editor');
  const { linked_id } = element;
  const [isShowTooltip, setIsShowTooltip] = useState(false);

  useEffect(() => {
    setIsShowTooltip(true);
  }, []);

  const onMouseDown = useCallback((event) => {
    event.stopPropagation();
    if (!isWeChat()) {
      window.open(element.href);
    } else {
      // eslint-disable-next-line no-restricted-globals
      location.href = element.href;
    }
  }, [element.href]);

  const handleOnClick = useCallback((event) => {
    event.stopPropagation();
    if (!linked_id) return;

    const [linkedNodeEntry] = Editor.nodes(editor, {
      at: [],
      match: n => n.id === linked_id,
    });

    if (linkedNodeEntry) {
      const node = linkedNodeEntry[0];
      const linkedDomNode = ReactEditor.toDOMNode(editor, node);
      linkedDomNode.classList.add('linked-block-highlight-overlay');

      // Scroll linked node to view if not in current view
      if (!isNodeInCurrentView(linkedDomNode)) {
        linkedDomNode.scrollIntoView();
      }
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linked_id]);


  return (
    <>
      {createPortal(
        <div id="link-op-menu" className="link-op-menu" style={menuPosition}>
          {linked_id ?
            <span className="link-op-menu-link" onClick={handleOnClick}>{t('Go_to_link')}</span> :
            <span target="_blank" rel="noopener noreferrer" className="link-op-menu-link" onMouseDown={onMouseDown}>{t('Open_link')}</span>
          }
          {!readOnly && (
            <div className="link-op-icons d-flex">
              <span id='edit-link' role="button" className="link-op-icon" onClick={onEditLink}>
                <i className="sdocfont sdoc-rename"></i>
              </span>
              {isShowTooltip && (
                <Tooltip target='edit-link' placement='top' fade={true}>
                  {t('Edit_link')}
                </Tooltip>
              )}
              <span id='delete-link' role="button" className="link-op-icon" onClick={onDeleteLink}>
                <i className="sdocfont sdoc-unlink"></i>
              </span>
              {isShowTooltip && (
                <Tooltip target='delete-link' placement='top' fade={true}>
                  {t('Remove_link')}
                </Tooltip>
              )}
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
};

LinkHover.propTypes = {
  element: PropTypes.object,
  menuPosition: PropTypes.object,
  onDeleteLink: PropTypes.func,
};

export default LinkHover;
