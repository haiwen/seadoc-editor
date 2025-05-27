import React, { useCallback } from 'react';
import { INTERNAL_EVENT } from '../../../../constants';
import EventBus from '../../../../utils/event-bus';
import { ELEMENT_TYPE } from '../../../constants';
import MenuItem from './menu-item';

import './style.css';

export default function AIContextMenu({ isRichEditor }) {

  const onAiClick = useCallback((event) => {
    const eventBus = EventBus.getInstance();
    eventBus.dispatch(INTERNAL_EVENT.INSERT_ELEMENT, { type: ELEMENT_TYPE.ASK_AI, slateNode: null });
  }, []);

  const aiProps = {
    id: 'context-toolbar-ai',
    isRichEditor,
    className: 'menu-group-item sdoc-ask-ai-menu-container',
    disabled: false,
    isActive: false,
    onMouseDown: onAiClick,
    'iconClass': 'sdocfont sdoc-ask-ai',
    'text': 'Ask_AI',
    'ariaLabel': 'Ask_AI',
    'type': 'sdoc-ask-ai'
  };

  return (
    <>
      <div className='sdoc-context-menu-divider'></div>
      <MenuItem {...aiProps} />
    </>
  );
}
