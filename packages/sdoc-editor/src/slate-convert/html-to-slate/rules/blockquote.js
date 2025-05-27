import slugid from 'slugid';
import { BLOCKQUOTE } from '../constants';

const blockquoteRule = (element, parseChild) => {
  const { nodeName, childNodes } = element;
  if (nodeName === 'BLOCKQUOTE') {
    return {
      id: slugid.nice(),
      type: BLOCKQUOTE,
      children: parseChild(childNodes)
    };
  }
  return;
};

export default blockquoteRule;
