import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useReadOnly, useSelected } from '@seafile/slate-react';
import classnames from 'classnames';
import { useScrollContext } from '../../../hooks/use-scroll-context';
import { DELETED_STYLE, ADDED_STYLE } from '../../constants';
import { FILE_LINK_TYPE } from './constants';
import { unwrapLinkNode, getUrl } from './helpers';
import HoverMenu from './hover-menu';

import './render-elem.css';

const FileLink = ({ editor, element, children, attributes }) => {
  const fileRef = useRef(null);
  const scrollRef = useScrollContext();
  const readOnly = useReadOnly();
  const [isShowInsertHoverMenu, setIsShowInsertHoverMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({});
  const isSelected = useSelected();

  const registerEventHandle = useCallback(() => {
    document.addEventListener('click', onHideInsertHoverMenu);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unregisterEventHandle = useCallback(() => {
    document.removeEventListener('click', onHideInsertHoverMenu);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      unregisterEventHandle();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setPosition = useCallback((elem) => {
    if (elem) {
      const { top, left } = elem.getBoundingClientRect();
      const menuTop = top - 42; // top = top distance - menu height
      const menuLeft = left - 18; // left = left distance - (menu width / 2)
      const newMenuPosition = {
        top: menuTop,
        left: menuLeft
      };
      setMenuPosition(newMenuPosition);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onScroll = useCallback((e) => {
    setPosition(fileRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let observerRefValue = null;
    if (isShowInsertHoverMenu) {
      scrollRef.current && scrollRef.current.addEventListener('scroll', onScroll);
      observerRefValue = scrollRef.current;
    } else {
      scrollRef.current && scrollRef.current.removeEventListener('scroll', onScroll);
    }
    return () => {
      if (observerRefValue) {
        observerRefValue.removeEventListener('scroll', onScroll);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShowInsertHoverMenu]);

  const onClickFile = useCallback((e) => {
    if (readOnly) {
      window.open(getUrl(element.doc_uuid));
      return;
    }

    if (isShowInsertHoverMenu) {
      e.stopPropagation();
    }

    setPosition(e.currentTarget);
    setIsShowInsertHoverMenu(true);

    setTimeout(() => {
      registerEventHandle();
    }, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShowInsertHoverMenu]);

  const onHideInsertHoverMenu = useCallback((e) => {
    setIsShowInsertHoverMenu(false);
    unregisterEventHandle();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onUnwrapFileLinkNode = useCallback((event) => {
    event.stopPropagation();
    unwrapLinkNode(editor, element);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let style = {};
  if (element.add) {
    style = { ...ADDED_STYLE };
  } else if (element.delete) {
    style = { ...DELETED_STYLE };
  }
  if (style.computed_background_color) {
    style['backgroundColor'] = style.computed_background_color;
  }

  return (
    <span
      {...attributes}
      data-id={element.id}
      contentEditable={false}
      className={classnames('sdoc-file-link-render', { 'file-link-selected': isSelected }, { 'sdoc-file-card-link': element.display_type === FILE_LINK_TYPE.CARD_LINK } )}
      onClick={onClickFile}
      style={element.display_type === FILE_LINK_TYPE.CARD_LINK ? style : {}}
    >
      <span ref={fileRef}>
        {[FILE_LINK_TYPE.ICON_LINK, FILE_LINK_TYPE.CARD_LINK].includes(element.display_type) && (
          <span className='sdoc-file-link-icon' style={style}>
            <i className="sdocfont sdoc-link-file"></i>
          </span>
        )}
        <span className='sdoc-file-text-link' style={style}>
          <a href={getUrl(element.doc_uuid)}
            onClick={(e) => e.preventDefault()}
            onDragStart={e => e.preventDefault()}
            title={element.title}>{children}
          </a>
        </span>
      </span>
      {(isShowInsertHoverMenu &&
        <HoverMenu
          editor={editor}
          menuPosition={menuPosition}
          element={element}
          onUnwrapFileLinkNode={onUnwrapFileLinkNode}
          onHideInsertHoverMenu={onHideInsertHoverMenu}
        />
      )}
    </span>
  );
};

const renderFileLink = (props, editor) => {
  return (
    <FileLink {...props} editor={editor} />
  );
};

export default renderFileLink;
