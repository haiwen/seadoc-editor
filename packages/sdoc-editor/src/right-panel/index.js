import React, { useCallback, useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { PLUGIN_DISPLAY_TYPE, INTERNAL_EVENT, SDOC_STORAGE } from '../constants';
import { usePlugins } from '../hooks/use-plugins';
import EventBus from '../utils/event-bus';
import LocalStorage from '../utils/local-storage-utils';
import ResizeWidth from './resize-width';

import './index.css';

const MIN_PANEL_WIDTH = 360;
const MAX_PANEL_WIDTH = 620;

const RightPanel = ({ editor }) => {
  const { plugins, displayPluginName, closePlugin } = usePlugins();
  const [width, setWidth] = useState(MIN_PANEL_WIDTH);

  const panelWrapperStyle = useMemo(() => {
    if (!displayPluginName) return null;
    let style = {
      width,
      zIndex: 101,
    };
    if (!style.width || style.width < MIN_PANEL_WIDTH) {
      style.width = MIN_PANEL_WIDTH;
    } else if (style.width > MAX_PANEL_WIDTH) {
      style.width = MAX_PANEL_WIDTH;
    }
    return style;
  }, [width, displayPluginName]);

  const resizeWidth = useCallback((width) => {
    setWidth(width);
  }, []);

  const resizeWidthEnd = useCallback((width) => {
    const settings = LocalStorage.getItem(SDOC_STORAGE) || {};
    LocalStorage.setItem(SDOC_STORAGE, JSON.stringify({ ...settings, panelWidth: width }));
    const eventBus = EventBus.getInstance();
    eventBus.dispatch(INTERNAL_EVENT.RESIZE_ARTICLE);
  }, []);

  useEffect(() => {
    const settings = LocalStorage.getItem(SDOC_STORAGE) || {};
    const { panelWidth } = settings;
    const width = Math.max(MIN_PANEL_WIDTH, Math.min(parseInt(panelWidth, 10) || MIN_PANEL_WIDTH, MAX_PANEL_WIDTH));
    setWidth(width);
  }, []);

  useEffect(() => {
    const isShowGlobalComments = displayPluginName === 'sdoc-comment' ? true : false;
    const commentBox = document.querySelector('.sdoc-content-right-panel-wrapper');
    if (isShowGlobalComments){
      const editorEl = document.querySelector('#sdoc-scroll-container');
      commentBox?.classList.add('with-comment');
      const commentWidth = commentBox?.offsetWidth;
      editorEl.scrollTo({
        left: commentWidth + 36,
        behavior: 'smooth'
      });
    } else {
      commentBox?.classList.remove('with-comment');
    }
    const settings = LocalStorage.getItem(SDOC_STORAGE) || {};
    LocalStorage.setItem(SDOC_STORAGE, { ...settings, isShowGlobalComments });
    const eventBus = EventBus.getInstance();
    eventBus.dispatch(INTERNAL_EVENT.RESIZE_ARTICLE);
  }, [displayPluginName]);

  if (!displayPluginName) return null;
  const plugin = plugins.find(p => p.name === displayPluginName);
  if (!plugin) return null;
  if (plugin.display_type && plugin.display_type !== PLUGIN_DISPLAY_TYPE.RIGHT_PANEL) return null;
  const Component = plugin.component;
  if (!Component) return null;

  return (
    <div className="sdoc-content-right-panel-wrapper" style={panelWrapperStyle}>
      {plugin.resizable_width && (
        <ResizeWidth minWidth={MIN_PANEL_WIDTH} maxWidth={MAX_PANEL_WIDTH} resizeWidth={resizeWidth} resizeWidthEnd={resizeWidthEnd} />
      )}
      <div className="sdoc-content-right-panel" id="sdoc-content-right-panel">
        {<Component editor={editor} type="global" onClose={closePlugin} width={width} />}
      </div>
    </div>
  );
};

RightPanel.propTypes = {
  editor: PropTypes.object,
};

export default RightPanel;
