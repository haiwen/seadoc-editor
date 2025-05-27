import React, { useState, useCallback, useRef, useEffect } from 'react';
import { withTranslation } from 'react-i18next';
import { Transforms } from '@seafile/slate';
import { ReactEditor, useReadOnly } from '@seafile/slate-react';
import { getVideoURL, formatFileSize, videoFileIcon } from './helpers';

import './index.css';

const Video = ({ element, editor }) => {
  const { data } = element;
  const videoRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [videoStates, setVideoStates] = useState({});
  const videoName = data?.name || data?.src;
  const videoSize = data?.size;
  const isEmbeddableLink = data?.is_embeddable_link;
  const readonly = useReadOnly();

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
    e.stopPropagation();
    const path = ReactEditor.findPath(editor, element);
    Transforms.select(editor, path);
    setIsSelected(true);
  }, [editor, element]);

  const onClickOutside = useCallback((e) => {
    e.stopPropagation();
    if (videoRef.current && !videoRef.current.contains(e.target)) {
      setIsSelected(false);
    }
  }, []);

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
        style={{ display: isLoaded ? 'block' : 'none' }}
      >
        <div className='sdoc-video-inner' style={{ visibility: isLoaded ? 'visible' : 'hidden' }}>
          {!isEmbeddableLink && (
            <>
              <video
                className='sdoc-video-element'
                ref={videoRef}
                src={getVideoURL(data)}
                controls
                controlsList={readonly && 'nofullscreen'}
                onClick={onClickVideo}
                draggable={false}
                onPlay={handlePlay}
                onPause={handlePause}
                onCanPlay={handleVideoLoad}
                style={{
                  boxShadow: isSelected ? '0 0 0 2px #007bff' : 'none',
                }}
              />
              <div className='sdoc-video-play sdocfont sdoc-play icon-font'
                style={{ visibility: isPaused ? 'visible' : 'hidden' }}
                contentEditable='false'
              >
              </div>
            </>
          )}
          {isEmbeddableLink && (
            <iframe
              className='sdoc-video-element'
              title={data.src}
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
              allowFullScreen
              src={getVideoURL(data)}
              onLoad={handleVideoLoad}
              style={{ width: '100%', height: '100%', border: 'none' }}
            >
            </iframe>
          )}
        </div>
      </div>
    </>
  );
};

const SdocVideo = withTranslation('sdoc-editor')(Video);

export function renderVideo(props, editor) {
  const { element, children, attributes } = props;

  return (
    <div
      className='sdoc-video-wrapper'
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
