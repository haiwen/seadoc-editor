import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { INTERNAL_EVENT } from '../../../../constants';
import EventBus from '../../../../utils/event-bus';
import { MenuItem } from '../../../commons';
import { MENUS_CONFIG_MAP } from '../../../constants';
import { SEARCH_REPLACE } from '../../../constants/menus-config';
import SearchReplacePopover from '../popover';

import './index.css';

const menuConfig = MENUS_CONFIG_MAP[SEARCH_REPLACE];
const SearchReplaceMenu = ({ isRichEditor, className, editor, readonly }) => {
  const [isOpenPopover, setIsOpenPopover] = useState(false);
  useEffect(() => {
    const eventBus = EventBus.getInstance();
    const unsubscribe = eventBus.subscribe(INTERNAL_EVENT.OPEN_SEARCH_REPLACE_MODAL, () => setIsOpenPopover(true));
    return () => unsubscribe();
  }, [isOpenPopover]);

  const onMouseDown = useCallback(() => {
    setIsOpenPopover(!isOpenPopover);
  }, [isOpenPopover]);

  const articleContainer = document.querySelector('.sdoc-article-container');

  const articleContainerSize = useMemo(() => {
    const articleContainer = document.querySelector('.sdoc-article-container');
    if (!articleContainer) return null;
    const { offsetHeight, offsetWidth, clientHeight } = articleContainer;
    return { offsetHeight, offsetWidth, clientHeight };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpenPopover]);

  const renderCanvasses = useMemo(() => {
    if (!isOpenPopover) return false;
    const generateCount = Math.ceil(articleContainerSize.offsetHeight / 5000);
    const canvasList = [];
    for (let index = 0; index < generateCount; index++) {
      const top = index * 5000;
      canvasList.push(
        <canvas
          key={'sdoc-find-search-' + index}
          id={`sdoc-find-search-${index}`}
          className='sdoc-find-search-highlight-canvas'
          width={articleContainerSize.offsetWidth}
          height={5000}
          style={{ top }}
        />
      );
    }
    return canvasList;
  }, [articleContainerSize, isOpenPopover]);

  return (
    <>
      <MenuItem
        isRichEditor={isRichEditor}
        className={className}
        ariaLabel='search'
        disabled={false}
        isActive={isOpenPopover}
        onMouseDown={onMouseDown}
        {...menuConfig}
      />
      {isOpenPopover && <SearchReplacePopover editor={editor} readonly={readonly} isOpen={isOpenPopover} closePopover={onMouseDown} />}
      {
        isOpenPopover && createPortal(<div style={{ height: articleContainerSize.clientHeight }} className='sdoc-search-highlight-container'>{renderCanvasses}</div>, articleContainer)
      }
    </>
  );
};

SearchReplaceMenu.propTypes = {
  readonly: PropTypes.bool,
  isRichEditor: PropTypes.bool,
  className: PropTypes.string,
  editor: PropTypes.object,
};

export default SearchReplaceMenu;
