import { SEARCH_REPLACE } from '../../constants/menus-config';
import SearchReplaceMenu from './menu';
import withSearchReplace from './plugin';

const SearchReplacePlugin = {
  type: SEARCH_REPLACE,
  editorMenus: [SearchReplaceMenu],
  editorPlugin: withSearchReplace,
  renderElements: [],
};

export default SearchReplacePlugin;
