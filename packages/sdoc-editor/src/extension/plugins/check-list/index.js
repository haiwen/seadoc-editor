import { CHECK_LIST_ITEM } from '../../constants';
import withCheckList from './plugin';
import { renderCheckListItem } from './render-elem';

const CheckListPlugin = {
  type: CHECK_LIST_ITEM,
  editorPlugin: withCheckList,
  renderElements: [renderCheckListItem]
};

export default CheckListPlugin;
