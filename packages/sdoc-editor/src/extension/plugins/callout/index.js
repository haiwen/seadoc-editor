import { CALL_OUT } from '../../constants';
import CalloutMenu from './menu';
import withCallout from './plugin';
import renderCallout from './render-elem';

const CalloutPlugin = {
  type: CALL_OUT,
  nodeType: 'element',
  editorMenus: [CalloutMenu],
  editorPlugin: withCallout,
  renderElements: [renderCallout]
};

export default CalloutPlugin;
