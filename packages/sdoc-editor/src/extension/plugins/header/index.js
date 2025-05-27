import { HEADER } from '../../constants';
import withHeader from './plugin';
import { renderTitle, renderHeader, renderSubtitle } from './render-elem';

const HeaderPlugin = {
  type: HEADER,
  nodeType: 'element',
  editorPlugin: withHeader,
  renderElements: [renderTitle, renderSubtitle, renderHeader],
};

export default HeaderPlugin;
