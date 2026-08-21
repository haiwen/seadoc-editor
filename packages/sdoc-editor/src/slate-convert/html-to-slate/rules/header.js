
import slugid from 'slugid';
import { HEADER_LIST, HEADER_TYPE_MAP } from '../constants';


const headerRule = (element, parseChild) => {
  const { nodeName, childNodes } = element;
  if (nodeName && HEADER_LIST.includes(nodeName)) {
    const children = parseChild(childNodes);
    return {
      id: slugid.nice(),
      type: HEADER_TYPE_MAP[nodeName],
      children: children.length > 0 ? children : [{ id: slugid.nice(), text: '' }]
    };
  }
  return;
};

export default headerRule;
