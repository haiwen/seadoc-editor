import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip, usePlugins, PLUGIN_BTN_POSITION } from '@seafile/sdoc-editor';
import classnames from 'classnames';

const PluginsOperations = () => {
  const { plugins, updateDisplayPlugin } = usePlugins();
  const { t } = useTranslation('sdoc-editor');
  const iconIdMap = {
    'sdoc-info': 'sdoc_info',
    'sdoc-comment': 'sdoc_comment',
  };

  const onClick = useCallback((event, pluginName) => {
    event.stopPropagation();
    event.nativeEvent && event.nativeEvent.stopImmediatePropagation && event.nativeEvent.stopImmediatePropagation();
    updateDisplayPlugin(pluginName);
  }, [updateDisplayPlugin]);

  if (plugins.length === 0) return null;

  return plugins.filter(plugin => (!plugin.position || plugin.position === PLUGIN_BTN_POSITION.DEFAULT) && plugin.icon).map(plugin => {
    const { name, icon } = plugin;
    let iconDom = '';
    if (typeof icon !== 'string') {
      iconDom = icon;
    } else {
      iconDom = (<i className={classnames('sdocfont', icon)}></i>);
    }

    return (
      <span className="op-item sdoc-plugin-operation-btn-container" id={iconIdMap[name]} onClick={(e) => onClick(e, name)} key={name}>
        {iconDom}
        {name === 'sdoc-info' && (
          <Tooltip target={iconIdMap[name]}>
            {t('Property')}
          </Tooltip>)
        }
        {name === 'sdoc-comment' && (
          <Tooltip target={iconIdMap[name]}>
            {t('Comment_list')}
          </Tooltip>)
        }
      </span>
    );
  });
};

export default PluginsOperations;
