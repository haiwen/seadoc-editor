import { TOGGLE_HEADER } from '../../constants';
import withToggleHeader from './plugin';
import { renderToggleHeader, renderToggleHeaderTitle, renderToggleHeaderContent } from './render-elem';

const ToggleHeaderPlugin = {
  type: TOGGLE_HEADER,
  nodeType: 'element',
  editorPlugin: withToggleHeader,
  renderElements: [renderToggleHeader, renderToggleHeaderTitle, renderToggleHeaderContent],
};

export default ToggleHeaderPlugin;
