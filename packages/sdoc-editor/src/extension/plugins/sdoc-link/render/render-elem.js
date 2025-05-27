import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { Editor, Range } from '@seafile/slate';
import { ReactEditor, useReadOnly, useSelected } from '@seafile/slate-react';
import classnames from 'classnames';
import { useScrollContext } from '../../../../hooks/use-scroll-context';
import { DELETED_STYLE, ADDED_STYLE } from '../../../constants';
import { WIKI_LINK } from '../../../constants/element-type';
import { focusEditor } from '../../../core';
import { getWikiUrl } from '../../wiki-link/helpers';
import { SDOC_LINK_TYPE } from '../constants';
import { unwrapLinkNode, getUrl, getSdocFileIcon } from '../helpers';
import HoverMenu from '../hover-menu';

import './render-elem.css';

const SdocFileLink = ({ editor, element, children, attributes }) => {
  const { icon, isDir } = element;
  const sdocFileRef = useRef(null);
  const scrollRef = useScrollContext();
  const [isShowInsertHoverMenu, setIsShowInsertHoverMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({});
  const readOnly = useReadOnly();
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
    setPosition(sdocFileRef.current);
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
      if (element.type === WIKI_LINK) {
        window.open(getWikiUrl(element.wiki_repo_id, element.page_id, readOnly));
        return;
      } else {
        window.open(getUrl(element.doc_uuid));
        return;
      }
    }

    if (isShowInsertHoverMenu) {
      e.stopPropagation();
    }

    const path = ReactEditor.findPath(editor, element);
    const focusPoint = Editor.end(editor, path);
    focusEditor(editor, focusPoint);

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

  const url = useMemo(() => {
    return element.type === WIKI_LINK
      ? getWikiUrl(element.wiki_repo_id, element.page_id, readOnly)
      : getUrl(element.doc_uuid);
  }, [element.doc_uuid, element.page_id, element.type, element.wiki_repo_id, readOnly]);

  return (
    <span
      {...attributes}
      data-id={element.id}
      contentEditable={false}
      className={`sdoc-file-render ${isSelected ? 'sdoc-file-link-selected' : ''} ${element.display_type === SDOC_LINK_TYPE.CARD_LINK ? 'sdoc-file-card-link' : ''}`}
      onClick={onClickFile}
      style={element.display_type === SDOC_LINK_TYPE.CARD_LINK ? style : {}}
    >
      <span ref={sdocFileRef}>
        {[SDOC_LINK_TYPE.ICON_LINK, SDOC_LINK_TYPE.CARD_LINK].includes(element.display_type) && (
          <span className='sdoc-file-link-icon' style={style}>
            {element.type !== WIKI_LINK && (
              <img className='file-link-img' src={getSdocFileIcon()} alt='' />
            )}
            {element.type === WIKI_LINK && (
              <>
                {icon && (
                  <span>{icon}</span>
                )}
                {!icon && (
                  <>
                    {isDir ? <span className='sf3-font sf3-font-files2'/> : <span className='sf3-font sf3-font-file'/>}
                  </>
                )}
              </>
            )}
          </span>
        )}
        <span className={classnames('sdoc-file-text-link', { 'sdoc-no-file-link-icon': ![SDOC_LINK_TYPE.ICON_LINK, SDOC_LINK_TYPE.CARD_LINK].includes(element.display_type) })} style={style}>
          <a href={url}
            onClick={(e) => e.preventDefault()}
            onDragStart={e => e.preventDefault()}
            title={element.title}>{children}
          </a>
        </span>
      </span>
      {(isShowInsertHoverMenu && (!readOnly && editor.selection && Range.isCollapsed(editor.selection)) &&
        <HoverMenu
          url={url}
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

const renderSdocLink = (props, editor) => {
  return (
    <SdocFileLink {...props} editor={editor} />
  );
};

export default renderSdocLink;
