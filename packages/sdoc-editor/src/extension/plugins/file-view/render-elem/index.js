import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileView } from '@seafile/seafile-database';
import { useReadOnly, useSelected, useSlateStatic } from '@seafile/slate-react';
import classNames from 'classnames';
import toaster from '../../../../components/toast';
import context from '../../../../context';
import { useScrollContext } from '../../../../hooks/use-scroll-context';
import { getErrorMsg } from '../../../../utils/common-utils';
import LocalStorage from '../../../../utils/local-storage-utils';
import { RECENT_COPY_CONTENT } from '../../../constants';
import { calculateSize, updateFileView } from '../helpers';

import './index.css';

const FileViewPlugin = ({ element, children, attributes }) => {
  const { data } = element;

  const scrollRef = useScrollContext();
  const editor = useSlateStatic();
  const isSelected = useSelected();
  const { readOnly } = useReadOnly();

  const wrapperRef = useRef(null);
  const resizerRef = useRef(null);
  const databaseRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);
  const [movingSize, setMovingSize] = useState(null);
  const { t } = useTranslation('sdoc-editor');

  const viewSettings = useMemo(() => {
    const settings = context.getFileViewSetting();
    const viewSettings = {
      ...settings,
      view_data: {
        wiki_id: data.wiki_id,
        file_view_id: data.file_view_id,
        height: data.height,
        width: data.width,
      },
    };
    return viewSettings;
  }, [data.file_view_id, data.height, data.width, data.wiki_id]);


  useEffect(() => {
    const copyContent = LocalStorage.getItem(RECENT_COPY_CONTENT);
    const wikiId = context.getSetting('wikiId');
    if (wikiId !== data.wiki_id) return;
    if (!copyContent) return;
    const stringContent = JSON.stringify(copyContent);
    if (stringContent.indexOf(data.wiki_id) > -1 && stringContent.indexOf(data.file_view_id) > -1) {
      context.duplicateFileView(data.file_view_id).then(res => {
        const { file_view: fileView } = res.data;
        const newData = { ...data, file_view_id: fileView.id };
        updateFileView(newData, editor, element);
      }).catch(error => {
        const errorMessage = getErrorMsg(error);
        toaster.danger(errorMessage);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    const wrapperElement = wrapperRef.current;
    const { left, right, top, bottom } = wrapperElement.getBoundingClientRect();
    const size = calculateSize(event, { left, right, top, bottom });

    const { style } = wrapperElement;
    style.width = size.width + 'px';
    style.height = size.height + 'px';

    const { style: databaseStyle } = databaseRef.current.getFileBaseElement();
    databaseStyle.width = (size.width - 4) + 'px';
    databaseStyle.height = (size.height - 4) + 'px';

    setMovingSize(size);
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

    const { style } = wrapperRef.current;
    const newData = {
      ...element.data,
      width: parseFloat(style.width),
      height: parseFloat(style.height),
    };

    updateFileView(newData, editor, element);
    // Reset hover menu position
    setTimeout(() => {
      setIsResizing(false);
    }, 100);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, element.data, wrapperRef.current]);

  const onResizeStart = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
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

  const style = useMemo(() => {
    const { width, height } = data;
    if (width && height) {
      return {
        width,
        height,
      };
    }
    return null;
  }, [data]);

  return (
    <div data-id={element.id} {...attributes} className="sdoc-file-view-container" contentEditable='false' suppressContentEditableWarning>
      <div className={classNames('sdoc-file-view-content', { 'is-selected': isSelected })} ref={wrapperRef} style={style}>
        <FileView settings={viewSettings} ref={databaseRef} scrollRef={scrollRef}/>
        {!readOnly && isSelected && (
          <span className='file-view-resizer' ref={resizerRef} onMouseDown={onResizeStart}></span>
        )}
        {isResizing && movingSize && (
          <span className='image-size'>
            <span>{t('Width')}{':'}{parseInt(movingSize.width)}</span>
            <span>&nbsp;&nbsp;</span>
            <span>{t('Height')}{':'}{parseInt(movingSize.height)}</span>
          </span>
        )}
      </div>
      {children}
    </div>
  );
};

export const renderFileView = (props) => {
  return <FileViewPlugin {...props} />;
};
