import React, { useState, useCallback, useRef, useEffect } from 'react';
import { withTranslation } from 'react-i18next';
import { Transforms, Editor } from '@seafile/slate';
import { ReactEditor, useSelected, useReadOnly } from '@seafile/slate-react';
import classNames from 'classnames';
import imagePlaceholder from '../../../assets/images/image-placeholder.png';
import Tooltip from '../../../components/tooltip';
import { INTERNAL_EVENT, WIKI_EDITOR } from '../../../constants';
import context from '../../../context';
import { useScrollContext } from '../../../hooks/use-scroll-context';
import EventBus from '../../../utils/event-bus';
import { ADDED_STYLE, DELETED_STYLE, IMAGE_BLOCK } from '../../constants';
import { IMAGE_BORDER_TYPE } from './constants';
import Svg from './copy-image-error-svg';
import ImagePreviewer from './dialogs/image-previewer';
import { getImageURL, handleBase64Image, isCommentEditor, isImageUrlIsFromCopy, selectImageWhenSelectPartial, updateImage } from './helpers';
import ImageHoverMenu from './hover-menu';
import ImageLoader from './image-loader';
import { isCurrentServerUrl, normalizeWebUrl } from './link-helpers';
import useCopyImage from './use-copy-image';
import useUploadImage from './use-upload-image';

const Image = ({ element, editor, style, className, attributes, children, isSelected, t, parentImageBlockId }) => {
  const { data, border_type = IMAGE_BORDER_TYPE[0].type } = element;
  const { show_caption = false, column_key } = data;
  const path = ReactEditor.findPath(editor, element);
  const nodeEntry = Editor.node(editor, [path[0]]);
  const imageStyle = { border: IMAGE_BORDER_TYPE.find((item) => item.type === border_type).value };
  const readOnly = useReadOnly();
  const imageRef = useRef(null);
  const imageHoverMenuRef = useRef(null);
  const urlRef = useRef(element?.data);
  const resizerRef = useRef(null);
  const imageCaptionInputRef = useRef(null);
  const scrollRef = useScrollContext();
  const [movingWidth, setMovingWidth] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const [isShowImagePlaceholder, setIsShowImagePlaceholder] = useState(false);
  const [isShowImageHoverMenu, setIsShowImageHoverMenu] = useState(false);
  const [isShowReadOnlyImagePreview, setIsShowReadOnlyImagePreview] = useState(false);
  const [menuPosition, setMenuPosition] = useState({});
  const [caption, setCaption] = useState(data?.caption || '');
  const { isCopyImageLoading, isCopyImageError, setCopyImageLoading } = useCopyImage({ editor, element });
  const { isUploadLoading, isUploadError } = useUploadImage({ editor, element });
  const [canEditable, setCanEditable] = useState(true);

  const registerEvent = useCallback((eventList) => {
    eventList.forEach(element => {
      document.addEventListener(element.eventName, element.event);
    });
  }, []);

  const unregisterEvent = useCallback((eventList) => {
    eventList.forEach(element => {
      document.removeEventListener(element.eventName, element.event);
    });
  }, []);

  const onMouseMove = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    const changeX = event.clientX - resizerRef.current?.getBoundingClientRect().left - 5;
    const imageWidth = imageRef.current.width + changeX;
    if (imageWidth < 20) return;
    imageRef.current.width = imageWidth;
    setMovingWidth(imageWidth);
  }, []);

  const onResizeEnd = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    unregisterEvent([
      {
        'eventName': 'mousemove',
        'event': onMouseMove
      },
      {
        'eventName': 'mouseup',
        'event': onResizeEnd
      },
    ]);

    const newData = { ...element.data, width: imageRef.current.width };
    updateImage(editor, newData);

    // Reset hover menu position
    setTimeout(() => {
      setIsResizing(false);
      setIsShowImageHoverMenu(true);
      setPosition();
    }, 100);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, element.data, imageRef.current]);

  const onResizeStart = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsShowImageHoverMenu(false);
    setIsResizing(true);
    registerEvent([
      {
        'eventName': 'mousemove',
        'event': onMouseMove
      },
      {
        'eventName': 'mouseup',
        'event': onResizeEnd
      },
    ]);
  }, [onMouseMove, onResizeEnd, registerEvent]);

  const getImageStyle = useCallback(() => {
    let imageWidth = element.data.width || '';
    if (movingWidth) imageWidth = movingWidth;
    return { width: imageWidth };
  }, [element.data, movingWidth]);

  const onScroll = useCallback(() => {
    setPosition();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onHideImageHoverMenu = useCallback((e) => {
    if (isResizing) return;
    const imagePreviewer = document.getElementsByClassName('sf-editor-image-previewer');
    const isCaptionInput = e.target.id === 'sdoc-image-caption-input';
    const isHoverMenu = imageHoverMenuRef.current?.contains(e.target);
    if (e.target === imageRef.current || imagePreviewer[0]?.contains(e.target) || isCaptionInput || isHoverMenu) return;
    setIsShowImageHoverMenu(false);
  }, [isResizing]);

  useEffect(() => {
    let observerRefValue = null;
    let resizeObserver = null;

    if (isShowImageHoverMenu) {
      registerEvent([{ 'eventName': 'mousedown', 'event': onHideImageHoverMenu }]);
      scrollRef.current && scrollRef.current.addEventListener('scroll', onScroll);
      observerRefValue = scrollRef.current;

      resizeObserver = new ResizeObserver(() => {
        if (resizeObserver) {
          onScroll();
        }
      });

      resizeObserver.observe(scrollRef.current);
    } else {
      unregisterEvent([{ 'eventName': 'mousedown', 'event': onHideImageHoverMenu }]);
      scrollRef.current && scrollRef.current.removeEventListener('scroll', onScroll);
    }
    return () => {
      unregisterEvent([{ 'eventName': 'mousedown', 'event': onHideImageHoverMenu }]);
      if (observerRefValue) {
        observerRefValue.removeEventListener('scroll', onScroll);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShowImageHoverMenu, onHideImageHoverMenu]);

  const onImageColumnToggle = useCallback(() => {
    // Handle switching to empty data and switching back
    setIsShowImagePlaceholder(false);
  }, []);

  useEffect(() => {
    let unsubscribeImageColumnToggle = null;
    if (column_key) {
      const eventBus = EventBus.getInstance();
      unsubscribeImageColumnToggle = eventBus.subscribe(INTERNAL_EVENT.IMAGE_COLUMN_TOGGLE, onImageColumnToggle);
    }
    return () => {
      unsubscribeImageColumnToggle && unsubscribeImageColumnToggle();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [column_key]);

  const setPosition = useCallback(() => {
    if (imageRef.current) {
      const { top, left } = imageRef.current.getBoundingClientRect();
      setMenuPosition({ top: top - 42, left: left - 3 });
    }
  }, []);

  const imageHref = normalizeWebUrl(data.href);

  const onClickImage = useCallback(() => {
    if (readOnly) return;
    setPosition();
    setIsShowImageHoverMenu(true);
  }, [readOnly, setPosition]);

  const isWikiPageLink = Boolean(imageHref && data.linked_wiki_id && data.linked_wiki_page_id);
  const currentWikiId = context.getSetting('wikiId');
  const linkedWikiPage = isWikiPageLink && data.linked_wiki_id === currentWikiId
    ? (context.getSetting('navConfig')?.pages || []).find(page => page.id === data.linked_wiki_page_id)
    : null;
  const imageLinkName = linkedWikiPage?.name || imageHref.replace(/^https?:\/\/(?:www\.)?/i, '');
  const isInternalLink = !isWikiPageLink && isCurrentServerUrl(imageHref);
  const readOnlyFullscreenTargetId = `sdoc_image_readonly_fullscreen_${element.id}`;
  const isCurrentWikiPageLink = isWikiPageLink
    && editor.editorType === WIKI_EDITOR
    && data.linked_wiki_id === currentWikiId
    && isCurrentServerUrl(imageHref);

  const onOpenLinkedWikiPage = useCallback((event) => {
    if (!isCurrentWikiPageLink) return;
    event.preventDefault();
    event.stopPropagation();
    const eventBus = EventBus.getInstance();
    eventBus.dispatch('open_wiki_page_id_link', { page_id: data.linked_wiki_page_id });
  }, [data.linked_wiki_page_id, isCurrentWikiPageLink]);

  const onLinkedWikiPageKeyDown = useCallback((event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    onOpenLinkedWikiPage(event);
  }, [onOpenLinkedWikiPage]);

  const reloadImage = useCallback(() => {
    setIsShowImagePlaceholder(false);
  }, []);

  const onImageLoaded = useCallback(() => {
    const src = data?.src || '';
    if (isImageUrlIsFromCopy(src) && !isCommentEditor(editor)) {
      setCopyImageLoading(true);
    }
  }, [data?.src, editor, setCopyImageLoading]);

  const onImageLoadError = useCallback(() => {
    const src = data?.src || '';
    // Check is due to the image is pasted from the clipboard in base64
    if (src.startsWith('data:image/jpeg;base64')) {
      return handleBase64Image(editor, path, data);
    }

    setIsShowImagePlaceholder(true);
    // External network images do not reload after failure to load
    if (!src.startsWith('http')) {
      const eventBus = EventBus.getInstance();
      eventBus.subscribe(INTERNAL_EVENT.RELOAD_IMAGE, reloadImage);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (urlRef.current !== element?.data) {
      urlRef.current = element?.data;
      setIsShowImagePlaceholder(false);
    }
  }, [element?.data]);

  const onSetFocus = useCallback(() => {
    setCanEditable(false);
  }, []);

  const onSetCaption = useCallback((e) => {
    const path = ReactEditor.findPath(editor, element);
    const newData = { ...data, caption: e.target.value.trim() };
    if (path) {
      Transforms.setNodes(editor, { data: newData }, { at: path });
    }
    setCanEditable(true);
  }, [data, editor, element]);

  const image = (
    <img
      ref={imageRef}
      className={classNames({ 'image-selected': !readOnly && isSelected })}
      onClick={onClickImage}
      src={getImageURL(data, editor)}
      style={getImageStyle()}
      draggable={false}
      onLoad={onImageLoaded}
      onError={onImageLoadError}
      alt=''
    />
  );

  const preventImageLinkNavigation = useCallback((event) => {
    if (!readOnly) event.preventDefault();
  }, [readOnly]);

  return (
    <>
      {isShowImagePlaceholder && (
        <span
          className={classNames('sdoc-image-wrapper', className)}
          {...attributes}
          style={{ ...style }}
          onMouseOver={(e) => selectImageWhenSelectPartial(e, editor, element, isSelected)}
          data-src={getImageURL(data, editor)}
          contentEditable='false'
          suppressContentEditableWarning
        >
          <img
            ref={imageRef}
            src={imagePlaceholder}
            style={getImageStyle()}
            draggable={false}
            alt=''
          />
          {children}
        </span>
      )}
      {isCopyImageError && (
        <span
          className={classNames('sdoc-image-wrapper', className)}
          {...attributes}
          style={{ ...style }}
          onMouseOver={(e) => selectImageWhenSelectPartial(e, editor, element, isSelected)}
          data-src={data.src}
          contentEditable='false'
          suppressContentEditableWarning
        >
          <Svg
            t={t}
            isSelected={isSelected}
            imageRef={imageRef}
          />
          {children}
        </span>
      )}
      {!isShowImagePlaceholder && !isCopyImageError && (
        <>
          <span
            data-id={element.id}
            data-parent-id={parentImageBlockId}
            className={classNames('sdoc-image-wrapper', className)}
            {...attributes}
            contentEditable={!readOnly && canEditable}
            suppressContentEditableWarning
            style={{ ...style }}
            onMouseOver={(e) => selectImageWhenSelectPartial(e, editor, element, isSelected)}
          >
            <span className='sdoc-image-inner'>
              <span className={classNames('sdoc-image-content', { 'upload-error': isUploadError })}>
                <span className='sdoc-image-visual' style={imageStyle}>
                  {isWikiPageLink ? (
                    <a
                      className='sdoc-image-page-link'
                      href={imageHref}
                      onClick={readOnly ? onOpenLinkedWikiPage : preventImageLinkNavigation}
                      onKeyDown={readOnly ? onLinkedWikiPageKeyDown : undefined}
                    >
                      {image}
                    </a>
                  ) : isInternalLink ? (
                    <a href={imageHref} onClick={preventImageLinkNavigation}>{image}</a>
                  ) : imageHref ? (
                    <a href={imageHref} target='_blank' rel='noopener noreferrer' onClick={preventImageLinkNavigation}>{image}</a>
                  ) : image}
                  {readOnly && imageHref && (
                    <span className='sdoc-image-readonly-link-indicator'>
                      <i className='sdocfont sdoc-link-file'/>
                      <span className='sdoc-image-readonly-link-name'>{imageLinkName}</span>
                    </span>
                  )}
                  {readOnly && (
                    <span className='sdoc-image-hover-menu-container sdoc-image-readonly-fullscreen-container'>
                      <span className='hover-menu-container'>
                        <span className='op-group-item'>
                          <span
                            aria-label={t('Full_screen_mode')}
                            className='op-item'
                            id={readOnlyFullscreenTargetId}
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              setIsShowReadOnlyImagePreview(true);
                            }}
                            role='button'
                            tabIndex={0}
                          >
                            <i className='sdocfont sdoc-fullscreen'/>
                            <Tooltip target={readOnlyFullscreenTargetId} placement='top' fade={true}>
                              {t('Full_screen_mode')}
                            </Tooltip>
                          </span>
                        </span>
                      </span>
                    </span>
                  )}
                  {(isCopyImageLoading || isUploadLoading) && <ImageLoader copyright={t('Image_is_uploading')}/>}
                  {(isUploadError) && <ImageLoader copyright={t('Image_is_upload_error')} isError={true} />}
                  {!readOnly && isSelected && (
                    <span className='image-resizer' ref={resizerRef} onMouseDown={onResizeStart}></span>
                  )}
                  {isResizing && (
                    <span className='image-size'>
                      <span>{t('Width')}{':'}{parseInt(movingWidth || imageRef.current?.clientWidth)}</span>
                      <span>&nbsp;&nbsp;</span>
                      <span>{t('Height')}{':'}{imageRef.current.clientHeight}</span>
                    </span>
                  )}
                </span>
                {nodeEntry[0].type === IMAGE_BLOCK && show_caption && (
                  <input
                    id='sdoc-image-caption-input'
                    ref={imageCaptionInputRef}
                    className='sdoc-image-caption-input-wrapper'
                    style={{ width: data?.width || imageRef.current?.clientWidth }}
                    placeholder={t('Caption')}
                    autoComplete='off'
                    value={caption}
                    disabled={readOnly}
                    onBlur={onSetCaption}
                    onFocus={onSetFocus}
                    onChange={(e) => {
                      setCaption(e.target.value);
                    }}
                    onCompositionStart={(e) => {
                      e.stopPropagation();
                    }}
                  />
                )}
              </span>
            </span>
            {children}
          </span>
          {(!readOnly && isShowImageHoverMenu &&
            <ImageHoverMenu
              editor={editor}
              menuRef={imageHoverMenuRef}
              menuPosition={menuPosition}
              element={element}
              parentNodeEntry={nodeEntry}
              imageCaptionInputRef={imageCaptionInputRef}
              readonly={readOnly}
              onHideImageHoverMenu={() => {
                setIsShowImageHoverMenu(false);
              }}
            />
          )}
          {isShowReadOnlyImagePreview && (
            <ImagePreviewer
              imageUrl={getImageURL(data, editor)}
              editor={editor}
              toggleImagePreviewer={() => setIsShowReadOnlyImagePreview(false)}
              t={t}
            />
          )}
        </>
      )}
    </>
  );
};

const SdocImage = withTranslation('sdoc-editor')(Image);

export function renderImage(props, editor) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const isSelected = useSelected();

  // decorate diff-viewer
  const { element, leaf } = props;
  let style = { ...props.style };
  const diffImageClassName = classNames(props.className, {
    'sdoc-diff-image-added': !!element.add,
    'sdoc-diff-image-deleted': !!element.delete,
  });

  if (leaf && leaf.computed_background_color) {
    style['backgroundColor'] = leaf.computed_background_color;
  }

  if (element.add || element.delete) {
    style = Object.assign({}, style, element.add ? ADDED_STYLE : DELETED_STYLE);
    if (style.computed_background_color) {
      style['backgroundColor'] = style.computed_background_color;
    }
  }

  return <SdocImage {...props} style={style} className={diffImageClassName} editor={editor} isSelected={isSelected} />;
}

export function renderImageBlock(props, editor) {
  const { element, children, attributes } = props;
  const { align } = element;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const isSelected = useSelected();

  let justifyContent = '';
  if (align) {
    justifyContent = (align === 'left' ? 'start' : align === 'right' ? 'end' : align);
  }

  return (
    <div
      className='sdoc-image-block-wrapper'
      style={{ display: 'flex', justifyContent: `${justifyContent}` }}
      {...attributes}
      onMouseOver={(e) => selectImageWhenSelectPartial(e, editor, element, isSelected)}
      contentEditable='true'
      suppressContentEditableWarning
    >
      {children}
    </div>
  );
}
