import { IMAGE } from '../../constants';
import ImageMenu from './menu';
import Image from './model';
import withImage from './plugin';
import { renderImage, renderImageBlock } from './render-elem';

const ImagePlugin = {
  type: IMAGE,
  nodeType: 'element',
  model: Image,
  editorMenus: [ImageMenu],
  editorPlugin: withImage,
  renderElements: [renderImage, renderImageBlock],
};

export default ImagePlugin;
