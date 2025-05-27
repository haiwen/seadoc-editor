import slugid from 'slugid';
import { LINK } from '../constants';

const linkRule = (element, parseChild) => {
  const { nodeName } = element;
  const content = element.textContent || element.getAttribute('title') || element.getAttribute('href');
  if (nodeName === 'A') {
    return {
      id: slugid.nice(),
      type: LINK,
      href: element.getAttribute('href'),
      title: element.getAttribute('title'),
      children: [
        {
          id: slugid.nice(),
          text: content,
        }
      ]
    };
  }
  return;
};

export default linkRule;
