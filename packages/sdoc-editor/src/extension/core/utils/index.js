import slugid from 'slugid';
import { PARAGRAPH } from '../../constants';

export const match = (node, path, predicate) => {
  if (!predicate) return true;

  if (typeof predicate === 'object') {
    return Object.entries(predicate).every(([key, value]) => {
      if (value && !Array.isArray(value)) {
        return node[key] === value;
      }

      value = value ? value : [];
      return value.includes(node[key]);
    });
  }

  return predicate(node, path);
};

export const generateDefaultText = (text) => {
  return { id: slugid.nice(), text: text || '' };
};

export const generateDefaultParagraph = () => {
  return { id: slugid.nice(), type: PARAGRAPH, children: [generateDefaultText()] };
};

export const generateEmptyElement = (type, props = {}, text) => {
  return { id: slugid.nice(), type, ...props, children: [generateDefaultText(text)] };
};
