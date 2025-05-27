import slugid from 'slugid';
import { LIST_ITEM, PARAGRAPH, UNORDERED_LIST } from '../../constants';
import { generateEmptyElement } from '../../core';

class List {

  constructor(options) {
    this.type = options.type || UNORDERED_LIST;
    this.children = options.children || [{ text: '' }];
  }

}

export default List;

export const generateEmptyListItem = () => {
  return {
    id: slugid.nice(),
    type: LIST_ITEM,
    children: []
  };
};

export const generateListItem = () => {
  return {
    id: slugid.nice(),
    type: LIST_ITEM,
    children: [
      generateEmptyListContent()
    ]
  };
};

export const generateEmptyListContent = () => {
  return generateEmptyElement(PARAGRAPH);
};

export const generateEmptyList = (type) => {
  return {
    id: slugid.nice(),
    type: type,
    children: []
  };
};
