import React, { useState, useCallback, useRef, useEffect } from 'react';
import { withTranslation } from 'react-i18next';
import { Transforms, Editor } from '@seafile/slate';
import { ReactEditor, useSelected, useReadOnly } from '@seafile/slate-react';
import classNames from 'classnames';
import imagePlaceholder from '../../../assets/images/image-placeholder.png';
import { INTERNAL_EVENT } from '../../../constants';
import { useScrollContext } from '../../../hooks/use-scroll-context';
import EventBus from '../../../utils/event-bus';
import { ADDED_STYLE, DELETED_STYLE, IMAGE_BLOCK } from '../../constants';
import { IMAGE_BORDER_TYPE } from './constants';
import Svg from './copy-image-error-svg';
import { getImageURL, handleBase64Image, isCommentEditor, isImageUrlIsFromCopy, selectImageWhenSelectPartial, updateImage } from './helpers';
import ImageHoverMenu from './hover-menu';
import ImageLoader from './image-loader';
import useCopyImage from './use-copy-image';
import useUploadImage from './use-upload-image';

const Image = ({ element, editor, style, className, attributes, children, isSelected, t }) => {
  const { data, border_type = IMAGE_BORDER_TYPE[0].type } = element;
  const { show_caption = false, column_key } = data;
  const path = ReactEditor.findPath(editor, element);
  const nodeEntry = Editor.node(editor, [path[0]]);
  const imageStyle = { border: IMAGE_BORDER_TYPE.find((item) => item.type === border_type).value };
  const readOnly = useReadOnly();
  const imageRef = useRef(null);
  const urlRef = useRef(element?.data);
  const resizerRef = useRef(null);
  const imageCaptionInputRef = useRef(null);
  const scrollRef = useScrollContext();
  const [movingWidth, setMovingWidth] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const [isShowImagePlaceholder, setIsShowImagePlaceholder] = useState(false);
  const [isShowImageHoverMenu, setIsShowImageHoverMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({});
  const [caption, setCaption] = useState(data?.caption || '');
  const { isCopyImageLoading, isCopyImageError, setCopyImageLoading } = useCopyImage({ editor, element });
  const { isUploadLoading, isUploadError } = useUploadImage({ editor, element });

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
    if (e.target === imageRef.current || imagePreviewer[0]?.contains(e.target) || isCaptionInput) return;
    setIsShowImageHoverMenu(false);
  }, [isResizing]);

  useEffect(() => {
    let observerRefValue = null;
    if (isShowImageHoverMenu) {
      registerEvent([{ 'eventName': 'click', 'event': onHideImageHoverMenu }]);
      scrollRef.current && scrollRef.current.addEventListener('scroll', onScroll);
      observerRefValue = scrollRef.current;
    } else {
      unregisterEvent([{ 'eventName': 'click', 'event': onHideImageHoverMenu }]);
      scrollRef.current && scrollRef.current.removeEventListener('scroll', onScroll);
    }
    return () => {
      unregisterEvent([{ 'eventName': 'click', 'event': onHideImageHoverMenu }]);
      if (observerRefValue) {
        observerRefValue.removeEventListener('scroll', onScroll);
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

  const onClickImage = useCallback((e) => {
    setPosition();
    setIsShowImageHoverMenu(true);
  }, [setPosition]);

  const reloadImage = useCallback(() => {
    setIsShowImagePlaceholder(false);
  }, []);

  const onImageLoaded = useCallback(() => {
    if (isImageUrlIsFromCopy(data.src) && !isCommentEditor(editor)) {
      setCopyImageLoading(true);
    }
  }, [data.src, editor, setCopyImageLoading]);

  const onImageLoadError = useCallback(() => {
    // Check is due to the image is pasted from the clipboard in base64
    if (data.src.startsWith('data:image/jpeg;base64')) {
      return handleBase64Image(editor, path, data);
    }

    setIsShowImagePlaceholder(true);
    // External network images do not reload after failure to load
    if (!data.src.startsWith('http')) {
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

  const onSetCaption = useCallback((e) => {
    const path = ReactEditor.findPath(editor, element);
    const newData = { ...data, caption: e.target.value.trim() };
    if (path) {
      Transforms.setNodes(editor, { data: newData }, { at: path });
    }
  }, [data, editor, element]);

  return (
    <>
      {isShowImagePlaceholder && (
        <span
          className={classNames('sdoc-image-wrapper', className)}
          {...attributes} style={{ ...style }}
          onMouseOver={(e) => selectImageWhenSelectPartial(e, editor, element, isSelected)}
          contentEditable='false'
          data-src={getImageURL(data, editor)}
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
          {...attributes} style={{ ...style }}
          onMouseOver={(e) => selectImageWhenSelectPartial(e, editor, element, isSelected)}
          contentEditable='false'
          data-src={data.src}
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
            className={classNames('sdoc-image-wrapper', className)}
            {...attributes} style={{ ...style }}
            onMouseOver={(e) => selectImageWhenSelectPartial(e, editor, element, isSelected)}
            contentEditable='false'
            suppressContentEditableWarning
          >
            <span className='sdoc-image-inner'>
              <span className={classNames('sdoc-image-content', { 'upload-error': isUploadError })}>
                <span style={imageStyle}>
                  <img
                    ref={imageRef}
                    className={classNames({ 'image-selected': isSelected })}
                    onClick={onClickImage}
                    src={getImageURL(data, editor)}
                    style={getImageStyle()}
                    draggable={false}
                    onLoad={onImageLoaded}
                    onError={onImageLoadError}
                    alt=''
                  />
                  {(isCopyImageLoading || isUploadLoading) && <ImageLoader copyright={t('Image_is_uploading')}/>}
                  {(isUploadError) && <ImageLoader copyright={t('Image_is_upload_error')} isError={true} />}
                  {isSelected && (
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
          {(isShowImageHoverMenu &&
            <ImageHoverMenu
              editor={editor}
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

  if (leaf && leaf.computed_background_color) {
    style['backgroundColor'] = leaf.computed_background_color;
  }

  if (element.add || element.delete) {
    style = Object.assign({}, style, element.add ? ADDED_STYLE : DELETED_STYLE);
    if (style.computed_background_color) {
      style['backgroundColor'] = style.computed_background_color;
    }
  }

  return <SdocImage {...props} style={style} editor={editor} isSelected={isSelected} />;
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
      contentEditable='false'
      suppressContentEditableWarning
    >
      {children}
    </div>
  );
}
