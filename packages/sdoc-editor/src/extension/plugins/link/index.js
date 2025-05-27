import { LINK } from '../../constants';
import LinkMenu from './menu';
import Link from './model';
import withLink from './plugin';
import renderLink from './render-elem';

const LinkPlugin = {
  type: LINK,
  nodeType: 'element',
  model: Link,
  editorMenus: [LinkMenu],
  editorPlugin: withLink,
  renderElements: [renderLink],
};

export default LinkPlugin;
