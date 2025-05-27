import slugid from 'slugid';
import { TABLE, TABLE_CELL, TABLE_ROW } from '../constants';

const tableRule = (element, parseChild) => {
  const { nodeName, childNodes } = element;
  if (nodeName === 'TABLE') {
    return {
      id: slugid.nice(),
      type: TABLE,
      children: parseChild(childNodes)
    };
  }

  if (nodeName === 'THEAD' || nodeName === 'TBODY') {
    return parseChild(childNodes);
  }

  if (nodeName === 'TR' && childNodes.length > 0) {
    // patch
    const children = Array.from(childNodes);
    const hasTdOrTh = children.some(item => item.nodeName === 'TH' || item.nodeName === 'TD');
    if (!hasTdOrTh) return;
    return {
      id: slugid.nice(),
      type: TABLE_ROW,
      children: parseChild(childNodes)
    };
  }

  if (nodeName === 'TH' || nodeName === 'TD') {
    return {
      id: slugid.nice(),
      type: TABLE_CELL,
      children: parseChild(childNodes)
    };
  }

  return;
};

export default tableRule;
