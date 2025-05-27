import { FILE_LINK } from '../../constants';
import FileLinkMenu from './menu';
import withFileLink from './plugin';
import renderFileLink from './render-elem';

const FileLinkPlugin = {
  type: FILE_LINK,
  editorMenus: [FileLinkMenu],
  editorPlugin: withFileLink,
  renderElements: [renderFileLink],
};

export default FileLinkPlugin;
