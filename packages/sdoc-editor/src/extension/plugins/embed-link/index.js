import { EMBED_LINK } from '../../constants/element-type';
import withEmbedLink from './plugin';
import { renderEmbedLink } from './render-elem';

const EmbedLinkPlugin = {
  type: EMBED_LINK,
  editorPlugin: withEmbedLink,
  renderElements: [renderEmbedLink],
};

export default EmbedLinkPlugin;
