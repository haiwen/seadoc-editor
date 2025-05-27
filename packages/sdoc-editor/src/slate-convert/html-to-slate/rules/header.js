
import slugid from 'slugid';
import { HEADER_LIST, HEADER_TYPE_MAP } from '../constants';


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
