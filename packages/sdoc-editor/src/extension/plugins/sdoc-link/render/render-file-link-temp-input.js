import React, { useEffect } from 'react';
import { INTERNAL_EVENT } from '../../../../constants';
import EventBus from '../../../../utils/event-bus';
import { FILE_LINK_INSET_INPUT_TEMP } from '../../../constants';

import './render-elem.css';

const RenderFileLinkTempInput = ({ element, attributes, children }) => {
  const eventBus = EventBus.getInstance();

  useEffect(() => {
    eventBus.dispatch(INTERNAL_EVENT.INSERT_ELEMENT, {
      type: FILE_LINK_INSET_INPUT_TEMP,
      slateNode: element,
    });

    return () => {
      eventBus.dispatch(INTERNAL_EVENT.CLOSE_FILE_INSET_DIALOG);
    };
  }, [element, eventBus]);

  return (
    <span {...attributes} className='sdoc-file-name-insert-collector' >
      {children}
    </span>
  );
};

export default RenderFileLinkTempInput;
