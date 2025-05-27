import slugid from 'slugid';
import { LIST_ITEM, ORDERED_LIST, PARAGRAPH, UNORDERED_LIST } from '../constants';

const PARAGRAPH_TAGS = ['DIV', 'P'];

const listRule = (element, parseChild) => {
  const { nodeName, childNodes } = element;
  if (nodeName === 'UL') {
    return {
      id: slugid.nice(),
      type: UNORDERED_LIST,
      children: parseChild(childNodes)
    };
  }
  if (nodeName === 'OL') {
    return {
      id: slugid.nice(),
      type: ORDERED_LIST,
      children: parseChild(childNodes)
    };
  }
  if (nodeName === 'LI' && PARAGRAPH_TAGS.includes(element.firstChild.nodeName)) {
    return {
      id: slugid.nice(),
      type: LIST_ITEM,
      children: parseChild(childNodes)
    };
  }

  if (nodeName === 'LI' && !PARAGRAPH_TAGS.includes(element.firstChild.nodeName)) {
    return {
      id: slugid.nice(),
      type: LIST_ITEM,
      children: [{
        id: slugid.nice(),
        type: PARAGRAPH,
        children: parseChild(childNodes)
      }]
    };
  }

  if (PARAGRAPH_TAGS.includes(nodeName) && element.parentElement.nodeName === 'LI') {
    return {
      id: slugid.nice(),
      type: PARAGRAPH,
      children: parseChild(childNodes)
    };
  }
  return;
};

export default listRule;
