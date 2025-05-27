import { WIKI_LINK } from '../../constants/element-type';
import withSdocLink from '../sdoc-link/plugin';
import renderWikiLink from '../sdoc-link/render/render-elem';

const WikiLinkPlugin = {
  type: WIKI_LINK,
  editorPlugin: withSdocLink,
  renderElements: [renderWikiLink],
};

export default WikiLinkPlugin;
