import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import CommentWrapper from '../comment';
import CommentsOperation from '../comment/components/comment-operation';
import { PLUGIN_DISPLAY_TYPE } from '../constants';
import FilePreviewWrapper from '../extension/commons/file-link-preview';

const PluginsContext = React.createContext(null);

export const PluginsProvider = ({ showComment, plugins: propsPlugins, children, setIsShowRightPanel }) => {
  const [displayName, setDisplayName] = useState('');

  const closePlugin = useCallback(() => {
    setDisplayName('');
    // Deal with comment component in wiki
    setIsShowRightPanel && setIsShowRightPanel(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const plugins = useMemo(() => {
    const allPlugins = propsPlugins;
    allPlugins.push({
      name: 'sdoc-file-preview',
      resizable_width: true,
      display_type: PLUGIN_DISPLAY_TYPE.RIGHT_PANEL,
      component: FilePreviewWrapper

    });
    if (showComment) {
      allPlugins.push({
        name: 'sdoc-comment',
        icon: <CommentsOperation />,
        resizable_width: true,
        display_type: PLUGIN_DISPLAY_TYPE.RIGHT_PANEL,
        component: CommentWrapper
      });
    }
    return allPlugins;
  }, [showComment, propsPlugins]);

  const updateDisplayPlugin = useCallback((name, isFilePreview = false) => {
    if ((!name || displayName === name) && !isFilePreview) {
      setDisplayName('');
      return;
    }
    const plugin = plugins.find(plugin => plugin.name === name);
    if (plugin?.display_type === PLUGIN_DISPLAY_TYPE.RIGHT_PANEL) {
      setDisplayName(name);
    }
  }, [displayName, plugins]);

  return (
    <PluginsContext.Provider value={{ plugins, displayPluginName: displayName, updateDisplayPlugin, closePlugin }}>
      {children}
    </PluginsContext.Provider>
  );
};

export const usePlugins = () => {
  const context = useContext(PluginsContext);
  if (!context) {
    throw new Error('\'PluginsContext\' is null');
  }

  return context;
};

