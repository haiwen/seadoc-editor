import slugid from 'slugid';
import { PARAGRAPH } from '../../../constants';

const paragraphRule = (element, parseChild) => {
  const { nodeName, childNodes } = element;
  if (nodeName === 'P' && element.parentElement.nodeName !== 'LI') {
    return {
      id: slugid.nice(),
      type: PARAGRAPH,
      children: parseChild(childNodes)
    };
  }
  return;
};

export default paragraphRule;
