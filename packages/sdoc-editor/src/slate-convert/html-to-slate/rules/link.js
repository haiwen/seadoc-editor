import slugid from 'slugid';
import { getOnlyImageChild, normalizeWebUrl } from '../../../extension/plugins/image/link-helpers';
import { IMAGE, LINK } from '../constants';

const linkRule = (element, parseChild) => {
  const { nodeName } = element;
  if (nodeName === 'A') {
    const content = [
      element.textContent,
      element.getAttribute('title'),
      element.getAttribute('href'),
    ].find(value => value?.trim());
    const image = getOnlyImageChild(element);
    if (image) {
      const src = image.getAttribute('src');
      if (!src || !src.trim()) return { id: slugid.nice(), text: '' };

      const href = normalizeWebUrl(element.getAttribute('href'));
      return {
        id: slugid.nice(),
        type: IMAGE,
        data: {
          src,
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
          if (!child.text) return child;
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
    if (!content) return { id: slugid.nice(), text: '' };
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
