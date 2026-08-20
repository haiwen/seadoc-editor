import slugid from 'slugid';
import { IMAGE } from '../../../constants';

const imageRule = (element, parseChild) => {
  const { nodeName } = element;

  if (nodeName === 'IMG') {
    const src = element.getAttribute('src');
    if (!src || !src.trim()) return null;

    return {
      id: slugid.nice(),
      type: IMAGE,
      data: { src },
      children: [{ text: '', id: slugid.nice() }]
    };
  }
  return;
};

export default imageRule;
