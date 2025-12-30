import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation, withTranslation } from 'react-i18next';
import { Range, Transforms, Node } from '@seafile/slate';
import { ReactEditor, useReadOnly } from '@seafile/slate-react';
import { useScrollContext } from '../../../hooks/use-scroll-context';
import { getVideoURL, formatFileSize, videoFileIcon, updateVideo } from './helpers';
import HoverMenu from './hover-menu';

import './index.css';

const Video = ({ element, editor }) => {
  const { data } = element;
  const videoRef = useRef(null);
  const wrapperRef = useRef(null);
  const resizerRef = useRef(null);
  const resizeStartXRef = useRef(0);
  const resizeStartWidthRef = useRef(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [videoStates, setVideoStates] = useState({});
  const [menuPosition, setMenuPosition] = useState({});
  const [isResizing, setIsResizing] = useState(false);
  const [movingWidth, setMovingWidth] = useState(null);
  const scrollRef = useScrollContext();

  const videoName = data?.name || data?.src;
  const videoSize = data?.size;
  const isEmbeddableLink = data?.is_embeddable_link;
  const readOnly = useReadOnly();
  const { t } = useTranslation('sdoc-editor');

  const handlePlay = () => {
    setVideoStates(prev => ({ ...prev, [element.id]: false }));
  };

  const handlePause = () => {
    setVideoStates(prev => ({ ...prev, [element.id]: true }));
  };

  const isPaused = videoStates[element.id] ?? true;

  const handleVideoLoad = () => {
    setIsLoaded(true);
  };

  const onClickVideo = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSelected(true);
  }, [editor, element]);

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
    setPosition(videoRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getIframePointerEvents = useCallback(() => {
    if (readOnly) return 'auto';
    if (isResizing) return 'none';
    return isSelected ? 'auto' : 'none';
  }, [isResizing, isSelected, readOnly]);

  const getVideoWidthStyle = useCallback(() => {
    const videoWidth = movingWidth || element.data.width || '100%';
    return { width: videoWidth };
  }, [element.data.width, movingWidth]);

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
    const deltaX = event.clientX - resizeStartXRef.current;
    const nextWidth = resizeStartWidthRef.current + deltaX;

    if (nextWidth < 150) return;

    if (wrapperRef.current) {
      wrapperRef.current.style.width = `${nextWidth}px`;
    }
    setMovingWidth(nextWidth);
  }, []);

  const onResizeEnd = useCallback((event) => {
    event?.preventDefault();
    event?.stopPropagation();
    unregisterEvent([
      { eventName: 'mousemove', event: onMouseMove },
      { eventName: 'mouseup', event: onResizeEnd },
    ]);

    const finalWidth =
    movingWidth ||
    wrapperRef.current?.getBoundingClientRect().width;

    const newData = { ...element.data, width: finalWidth };
    updateVideo(editor, newData, element.id);

    setIsResizing(false);
    setTimeout(() => setPosition(wrapperRef.current), 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, element.id, movingWidth, onMouseMove, registerEvent]);

  const onResizeStart = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setMenuPosition(null);
    setIsResizing(true);

    resizeStartXRef.current = event.clientX;
    resizeStartWidthRef.current =
      wrapperRef.current?.getBoundingClientRect().width ||
      element.data.width ||
      0;

    registerEvent([
      { eventName: 'mousemove', event: onMouseMove },
      { eventName: 'mouseup', event: onResizeEnd },
    ]);
  }, [element.data.width, onMouseMove, onResizeEnd, registerEvent]);

  const onClickOutside = useCallback((e) => {
    e.stopPropagation();
    if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
      onResizeEnd();
      setIsSelected(false);
    }
  }, [onResizeEnd]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.addEventListener('loadeddata', handleVideoLoad);
    }
    document.addEventListener('click', onClickOutside);
    return () => {
      if (videoElement) {
        videoElement.removeEventListener('loadeddata', handleVideoLoad);
      }
      document.removeEventListener('click', onClickOutside);
    };
  }, [onClickOutside]);

  useEffect(() => {
    let observerRefValue = null;
    let resizeObserver = null;

    if (isSelected) {
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
  }, [isSelected]);

  return (
    <>
      {!isLoaded && (
        <div className='video-loading-placeholder'>
          <img className='video-file-icon' src={videoFileIcon()} alt='' />
          <div className='video-file-info'>
            <div>{videoName}</div>
            <div className='file-size'>
              <span>{formatFileSize(videoSize)} — </span>
              <div className='loading-spinner'>
                <div className='spinner'></div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div
        data-id={element.id}
        className='sdoc-video-wrapper'
        contentEditable={false}
        style={{ display: isLoaded ? 'flex' : 'none' }}
        onClick={onClickVideo}
      >
        <div
          className='sdoc-video-inner'
          ref={wrapperRef}
          style={{ visibility: isLoaded ? 'visible' : 'hidden', ...getVideoWidthStyle() }}
        >
          {!isEmbeddableLink && (
            <>
              <video
                className='sdoc-video-element'
                ref={videoRef}
                src={getVideoURL(data, editor)}
                controls
                controlsList={ readOnly ? 'nofullscreen' : undefined }
                draggable={false}
                onPlay={handlePlay}
                onPause={handlePause}
                onCanPlay={handleVideoLoad}
                style={{
                  boxShadow: isSelected ? '0 0 0 2px #007bff' : 'none',
                  pointerEvents: getIframePointerEvents(),
                }}
              />
              <div className='sdoc-video-play sdocfont sdoc-play'
                style={{ visibility: isPaused ? 'visible' : 'hidden' }}
                contentEditable='false'
              >
              </div>
            </>
          )}
          {isEmbeddableLink && (
            <iframe
              className='sdoc-video-element'
              ref={videoRef}
              title={data.src}
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
              allowFullScreen
              src={getVideoURL(data, editor)}
              onLoad={handleVideoLoad}
              style={{
                height: '100%',
                border: 'none',
                boxShadow: isSelected ? '0 0 0 2px #007bff' : 'none',
                pointerEvents: getIframePointerEvents(),
              }}
            >
            </iframe>
          )}
          {!readOnly && isSelected && (
            <span className='image-resizer' ref={resizerRef} onMouseDown={onResizeStart}></span>
          )}
          {isResizing && (
            <span className='image-size'>
              <span>{t('Width')}{':'}{parseInt(movingWidth || videoRef.current?.clientWidth)}</span>
              <span>&nbsp;&nbsp;</span>
              <span>{t('Height')}{':'}{videoRef.current.clientHeight}</span>
            </span>
          )}
        </div>
      </div>
      {(isSelected && !isEmbeddableLink && (!readOnly && editor.selection && Range.isCollapsed(editor.selection)) &&
        <HoverMenu
          editor={editor}
          menuPosition={menuPosition}
          element={element}
          videoRef={videoRef}
          setIsSelected={setIsSelected}
        />
      )}
    </>
  );
};

const SdocVideo = withTranslation('sdoc-editor')(Video);

export function renderVideo(props, editor) {
  const { element, children, attributes } = props;

  return (
    <div
      className='sdoc-video-outer-wrapper'
      {...attributes}
      contentEditable='true'
      suppressContentEditableWarning
    >
      <div
        className='sdoc-video-children-wrapper'
        contentEditable='false'
        suppressContentEditableWarning
        style={{
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        {children}
      </div>
      <SdocVideo
        element={element}
        editor={editor}
      />
    </div>
  );
}
