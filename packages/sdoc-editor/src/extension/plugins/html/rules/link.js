import slugid from 'slugid';
import { IMAGE, LINK } from '../../../constants';
import { getOnlyImageChild, normalizeWebUrl } from '../../image/link-helpers';

const linkRule = (element, parseChild) => {
  const { nodeName } = element;
  const content = element.textContent || element.getAttribute('title') || element.getAttribute('href');
  if (nodeName === 'A') {
    const image = getOnlyImageChild(element);
    if (image) {
      const href = normalizeWebUrl(element.getAttribute('href'));
      return {
        id: slugid.nice(),
        type: IMAGE,
        data: {
          src: image.getAttribute('src'),
          ...(href && { href }),
        },
        children: [{ text: '', id: slugid.nice() }]
      };
    }
    if (element.querySelector('img')) {
      const href = normalizeWebUrl(element.getAttribute('href'));
      return parseChild(element.childNodes).map((child) => {
        if (!href) return child;
        if (child.type === IMAGE) return { ...child, data: { ...child.data, href } };
        if (typeof child.text === 'string') {
          return {
            id: slugid.nice(),
            type: LINK,
            href,
            title: element.getAttribute('title'),
            children: [child],
          };
        }
        return child;
      });
    }
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
