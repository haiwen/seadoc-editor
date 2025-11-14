import { FILE_VIEW } from '../../constants';
import withFileView from './plugin';
import { renderFileView } from './render-elem';

const FileViewPlugin = {
  type: FILE_VIEW,
  nodeType: 'element',
  editorPlugin: withFileView,
  renderElements: [renderFileView],
};

export default FileViewPlugin;
