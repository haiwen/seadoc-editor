import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { Editor, Range } from '@seafile/slate';
import { ReactEditor, useReadOnly, useSelected } from '@seafile/slate-react';
import classnames from 'classnames';
import { INTERNAL_EVENT } from '../../../../constants';
import { usePlugins } from '../../../../hooks/use-plugins';
import { useScrollContext } from '../../../../hooks/use-scroll-context';
import { isMac } from '../../../../utils/common-utils';
import EventBus from '../../../../utils/event-bus';
import { DELETED_STYLE, ADDED_STYLE } from '../../../constants';
import { SDOC_LINK, WIKI_LINK } from '../../../constants/element-type';
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
  const { updateDisplayPlugin } = usePlugins();

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
    let resizeObserver = null;

    if (isShowInsertHoverMenu) {
      scrollRef.current && scrollRef.current.addEventListener('scroll', onScroll);
      observerRefValue = scrollRef.current;

      resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          if (resizeObserver) {
            onScroll();
          }
        }
      });

      resizeObserver.observe(scrollRef.current);
    } else {
      scrollRef.current && scrollRef.current.removeEventListener('scroll', onScroll);
    }
    return () => {
      if (observerRefValue) {
        observerRefValue.removeEventListener('scroll', onScroll);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShowInsertHoverMenu]);

  const onClickFile = useCallback((e) => {
    const isModClick = isMac() ? e.metaKey : e.ctrlKey;
    if (isModClick) {
      if (element.type === WIKI_LINK) {
        window.open(getWikiUrl(element.wiki_repo_id, element.page_id, readOnly), '_blank', 'noreferrer');
        return;
      } else {
        window.open(getUrl(element.doc_uuid), '_blank', 'noreferrer');
        return;
      }
    }

    if (readOnly) {
      if (element.type === WIKI_LINK) {
        window.open(getWikiUrl(element.wiki_repo_id, element.page_id, readOnly));
        return;
      } else {
        window.open(getUrl(element.doc_uuid));
        return;
      }
    }

    if (isShowInsertHoverMenu && [SDOC_LINK, WIKI_LINK].includes(element.type)) {
      e.stopPropagation();
      element.type === SDOC_LINK && updateDisplayPlugin('sdoc-file-preview', true);
      const { doc_uuid, title, type } = element;
      let data = { doc_uuid, title, type };
      if (element.type === WIKI_LINK) {
        data = element;
      }

      const eventBus = EventBus.getInstance();
      eventBus.dispatch(INTERNAL_EVENT.TRANSFER_PREVIEW_FILE_ID, data);
      setTimeout(() => {
        onHideInsertHoverMenu();
      }, 0);
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
                {icon && (<span>{icon}</span>)}
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
          <a href={url} onClick={(e) => e.preventDefault()} onDragStart={e => e.preventDefault()} title={element.title}>
            {element.title}
          </a>
        </span>
      </span>
      {children}
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
