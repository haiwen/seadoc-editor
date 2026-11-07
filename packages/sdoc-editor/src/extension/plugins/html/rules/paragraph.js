import slugid from 'slugid';
import { PARAGRAPH } from '../../../constants';

const paragraphRule = (element, parseChild) => {
  const { nodeName, childNodes } = element;
  if (nodeName === 'P' && element.parentElement.nodeName !== 'LI') {
    const children = parseChild(childNodes);
    const align = element.style.textAlign || element.getAttribute('align');
    return {
      id: slugid.nice(),
      type: PARAGRAPH,
      ...(['left', 'center', 'right'].includes(align) && { align }),
      children: children.length > 0 ? children : [{ id: slugid.nice(), text: '' }]
    };
  }
  return;
};

export default paragraphRule;
