import slugid from 'slugid';
import { PARAGRAPH } from '../../../constants';

const paragraphRule = (element, parseChild) => {
  const { nodeName, childNodes } = element;
  if (nodeName === 'P' && element.parentElement.nodeName !== 'LI') {
    const children = parseChild(childNodes);
    return {
      id: slugid.nice(),
      type: PARAGRAPH,
      children: children.length > 0 ? children : [{ id: slugid.nice(), text: '' }]
    };
  }
  return;
};

export default paragraphRule;
