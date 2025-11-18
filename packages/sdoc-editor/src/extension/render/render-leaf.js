import React, { useCallback, useEffect } from 'react';
import { useSlateStatic } from '@seafile/slate-react';
import { INTERNAL_EVENT } from '../../constants';
import useForceUpdate from '../../hooks/use-force-update';
import EventBus from '../../utils/event-bus';
import { TextPlugin } from '../plugins';

const CustomLeaf = (props) => {
  const editor = useSlateStatic();
  const forceUpdate = useForceUpdate();

  const updateRender = useCallback(() => {
    forceUpdate();
  }, [forceUpdate]);

  useEffect(() => {
    const eventBus = EventBus.getInstance();
    const unsubscribeReloadComment = eventBus.subscribe(INTERNAL_EVENT.RELOAD_COMMENT, updateRender);
    return () => {
      unsubscribeReloadComment();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [renderText] = TextPlugin.renderElements;
  return renderText(props, editor);
};

const renderLeaf = (props) => {
  return <CustomLeaf {...props} />;
};

export default renderLeaf;

