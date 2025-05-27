import React, { useCallback } from 'react';
import { INTERNAL_EVENT } from '../../../../constants';
import EventBus from '../../../../utils/event-bus';
import DropdownMenuItem from '../../../commons/dropdown-menu-item';
import { ELEMENT_TYPE } from '../../../constants';

export default function AIDropdownMenu({ slateNode }) {

  const onAiClick = useCallback(() => {
    const eventBus = EventBus.getInstance();
    eventBus.dispatch(INTERNAL_EVENT.INSERT_ELEMENT, { type: ELEMENT_TYPE.ASK_AI, slateNode });
  }, [slateNode]);

  const aiProps = {
    id: 'side-toolbar-ai',
    'iconClass': 'sdocfont sdoc-ask-ai',
    'text': 'Ask_AI',
    'type': 'sdoc-ask-ai'
  };

  return (
    <DropdownMenuItem
      menuConfig={aiProps}
      onClick={onAiClick}
    />
  );
}
