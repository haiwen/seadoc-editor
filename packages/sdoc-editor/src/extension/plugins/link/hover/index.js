import React, { useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useReadOnly } from '@seafile/slate-react';
import PropTypes from 'prop-types';
import { isWeChat } from '../helpers';

import './index.css';

const LinkHover = ({ editor, element, menuPosition, onDeleteLink, onEditLink }) => {
  const readOnly = useReadOnly();
  const { t } = useTranslation('sdoc-editor');

  const onMouseDown = useCallback((event) => {
    event.stopPropagation();
    if (!isWeChat()) {
      window.open(element.href);
    } else {
      // eslint-disable-next-line no-restricted-globals
      location.href = element.href;
    }
  }, [element.href]);

  return (
    <>
      {createPortal(
        <div id="link-op-menu" className="link-op-menu" style={menuPosition}>
          <span target="_blank" rel="noopener noreferrer" className="link-op-menu-link" onMouseDown={onMouseDown}>{t('Open_link')}</span>
          {!readOnly && (
            <div className="link-op-icons d-flex">
              <span role="button" className="link-op-icon" onClick={onEditLink}>
                <i className="sdocfont sdoc-rename"></i>
              </span>
              <span role="button" className="link-op-icon" onClick={onDeleteLink}>
                <i className="sdocfont sdoc-unlink"></i>
              </span>
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
