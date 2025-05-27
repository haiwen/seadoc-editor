import slugid from 'slugid';
import { PARAGRAPH } from '../constants';

const paragraphRule = (element, parseChild) => {
  const { nodeName, childNodes } = element;
  if (nodeName === 'P' && element.parentElement.nodeName !== 'LI') {
    if (childNodes.length === 0) {
      return {
        id: slugid.nice(),
        type: PARAGRAPH,
        children: [
          {
            id: slugid.nice(),
            text: '',
          }
        ]
      };
    }
    return {
      id: slugid.nice(),
      type: PARAGRAPH,
      children: parseChild(childNodes)
    };
  }
  return;
};

export default paragraphRule;
