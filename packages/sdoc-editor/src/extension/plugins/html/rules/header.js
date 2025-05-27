
import slugid from 'slugid';
const HEADER_LIST = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
const HEADER_TYPE_MAP = {
  H1: 'header1',
  H2: 'header2',
  H3: 'header3',
  H4: 'header4',
  H5: 'header5',
  H6: 'header6',
};

const headerRule = (element, parseChild) => {
  const { nodeName, childNodes } = element;
  if (nodeName && HEADER_LIST.includes(nodeName)) {
    return {
      id: slugid.nice(),
      type: HEADER_TYPE_MAP[nodeName],
      children: parseChild(childNodes)
    };
  }
  return;
};

export default headerRule;
