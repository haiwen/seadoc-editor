import { VIDEO } from '../../constants';
import VideoMenu from './menu';
import withVideo from './plugin';
import { renderVideo } from './render-elem';
import './index.css';

const VideoPlugin = {
  type: VIDEO,
  nodeType: 'element',
  editorMenus: [VideoMenu],
  editorPlugin: withVideo,
  renderElements: [renderVideo],
};

export default VideoPlugin;
