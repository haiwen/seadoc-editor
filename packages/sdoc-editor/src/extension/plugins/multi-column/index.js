import { MULTI_COLUMN } from '../../constants';
import withMultiColumn from './plugin';
import { renderMultiColumn, renderColumn } from './render-elem';

const MultiColumnPlugin = {
  type: MULTI_COLUMN,
  nodeType: 'element',
  editorPlugin: withMultiColumn,
  renderElements: [renderMultiColumn, renderColumn]
};

export default MultiColumnPlugin;
