import { SDOC_LINK } from '../../constants';
import SdocLinkMenu from './menu';
import withSdocLink from './plugin';
import renderSdocLink from './render/render-elem';
import renderFileLinkTempInput from './render/render-file-link-temp-input';

const SdocLinkPlugin = {
  type: SDOC_LINK,
  editorMenus: [SdocLinkMenu],
  editorPlugin: withSdocLink,
  renderElements: [renderSdocLink, renderFileLinkTempInput],
};

export default SdocLinkPlugin;
