import slugid from 'slugid';
import { DIVIDER } from '../../../extension/constants';


const hrRule = (element) => {
  if (element.nodeName === 'HR') {
    return {
      id: slugid.nice(),
      type: DIVIDER,
      children: [{ id: slugid.nice(), text: '' }],
    };
  }
  return;
};

export default hrRule;
