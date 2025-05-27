import React from 'react';
import { REBASE_MARK_KEY } from '../../constants';
import CustomElement from './custom-element';
import { RebaseDecorate } from './element-decorate';

const RenderElement = (props) => {
  const { element } = props;
  const rebaseType = element[REBASE_MARK_KEY.REBASE_TYPE];
  if (rebaseType) {
    return (<RebaseDecorate element={element}><CustomElement {...props} /></RebaseDecorate>);
  }

  return (<CustomElement {...props} />);
};

export default RenderElement;
