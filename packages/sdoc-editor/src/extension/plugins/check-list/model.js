import { CHECK_LIST_ITEM } from '../../constants';

class CheckListItem {

  constructor(options) {
    this.type = options.type || CHECK_LIST_ITEM;
    this.checked = options.checked || false;
    this.children = options.children || [{ text: '' }];
  }

}

export default CheckListItem;
