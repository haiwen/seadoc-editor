import slugid from 'slugid';
import { CHECK_LIST_ITEM } from '../constants';

const checkListRule = (element, parseChild) => {
  const { nodeName } = element;
  if (nodeName === 'INPUT' && element.getAttribute('type') === 'checkbox') {
    return {
      id: slugid.nice(),
      type: CHECK_LIST_ITEM,
      checked: element.getAttribute('checked') !== null,
      children: [
        {
          id: slugid.nice(),
          text: '',
        }
      ]
    };
  }
  return;
};

export default checkListRule;
