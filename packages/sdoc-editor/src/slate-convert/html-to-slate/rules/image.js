import slugid from 'slugid';
import { IMAGE } from '../constants';

const imageRule = (element, parseChild) => {
  const { nodeName } = element;

  if (nodeName === 'IMG') {
    return {
      id: slugid.nice(),
      type: IMAGE,
      data: { src: element.getAttribute('src') },
      children: [{ text: '', id: slugid.nice() }]
    };
  }
  return;
};

export default imageRule;
