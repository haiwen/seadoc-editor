import slugid from 'slugid';
import { INLINE_LEVEL_TYPES, LIST_ITEM, ORDERED_LIST, PARAGRAPH, UNORDERED_LIST } from '../../../constants';

const PARAGRAPH_TAGS = ['DIV', 'P'];
const LIST_TYPES = [ORDERED_LIST, UNORDERED_LIST];

const createParagraphNode = (children = []) => {
  return {
    id: slugid.nice(),
    type: PARAGRAPH,
    children
  };
};

const normalizeListItemChildren = (nodes = []) => {
  const nextChildren = [];
  let paragraphChildren = [];

  nodes.forEach(node => {
    if (node.type === PARAGRAPH) {
      if (paragraphChildren.length > 0) {
        nextChildren.push(createParagraphNode(paragraphChildren));
        paragraphChildren = [];
      }
      nextChildren.push(node);
      return;
    }

    if (node.type && !INLINE_LEVEL_TYPES.includes(node.type) && !LIST_TYPES.includes(node.type)) {
      if (paragraphChildren.length > 0) {
        nextChildren.push(createParagraphNode(paragraphChildren));
        paragraphChildren = [];
      }
      nextChildren.push(node);
      return;
    }

    if (LIST_TYPES.includes(node.type)) {
      if (paragraphChildren.length > 0) {
        nextChildren.push(createParagraphNode(paragraphChildren));
        paragraphChildren = [];
      }
      nextChildren.push(node);
      return;
    }

    paragraphChildren.push(node);
  });

  if (paragraphChildren.length > 0) {
    nextChildren.push(createParagraphNode(paragraphChildren));
  }

  if (nextChildren.length === 0) {
    nextChildren.push(createParagraphNode([{ id: slugid.nice(), text: '' }]));
  }

  return nextChildren;
};

const listRule = (element, parseChild) => {
  const { nodeName, childNodes } = element;
  if (nodeName === 'UL') {
    const validChildNodes = Array.from(childNodes).filter(item => item.nodeName === 'LI');
    return {
      id: slugid.nice(),
      type: UNORDERED_LIST,
      children: parseChild(validChildNodes)
    };
  }
  if (nodeName === 'OL') {
    const validChildNodes = Array.from(childNodes).filter(item => item.nodeName === 'LI');
    return {
      id: slugid.nice(),
      type: ORDERED_LIST,
      children: parseChild(validChildNodes)
    };
  }
  if (nodeName === 'LI' && element.firstChild && PARAGRAPH_TAGS.includes(element.firstChild.nodeName)) {
    return {
      id: slugid.nice(),
      type: LIST_ITEM,
      children: parseChild(childNodes)
    };
  }

  if (nodeName === 'LI') {
    const parsedChildren = parseChild(childNodes);
    return {
      id: slugid.nice(),
      type: LIST_ITEM,
      children: normalizeListItemChildren(parsedChildren)
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
