import { BLOCKQUOTE } from '../../constants';
import QuoteMenu from './menu';
import Blockquote from './model';
import withBlockquote from './plugin';
import renderBlockquote from './render-elem';

const BlockquotePlugin = {
  type: BLOCKQUOTE,
  nodeType: 'element',
  model: Blockquote,
  editorMenus: [QuoteMenu],
  editorPlugin: withBlockquote,
  renderElements: [renderBlockquote],
};

export default BlockquotePlugin;
