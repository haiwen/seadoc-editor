import { WHITEBOARD } from '../../constants';
import WhiteboardMenu from './menu';
import withWhiteboard from './plugin';
import { renderWhiteboard } from './render-elem';

import './index.css';

const WhiteboardPlugin = {
  type: WHITEBOARD,
  nodeType: 'element',
  editorMenus: [WhiteboardMenu],
  editorPlugin: withWhiteboard,
  renderElements: [renderWhiteboard],
};

export default WhiteboardPlugin;
