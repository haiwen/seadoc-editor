import ListMenu from './menu';
import withList from './plugin';
import { renderList, renderListItem, renderListLic } from './render-elem';

const ListPlugin = {
  type: 'list',
  nodeType: 'element',
  editorMenus: [ListMenu],
  editorPlugin: withList,
  renderElements: [renderList, renderListItem, renderListLic]
};

export default ListPlugin;
