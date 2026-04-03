import slugid from 'slugid';
import { DIVIDER } from '../../../constants';

const hrRule = (element) => {
  if (element.nodeName !== 'HR') return;

  return {
    id: slugid.nice(),
    type: DIVIDER,
    children: [{ id: slugid.nice(), text: '' }],
  };
};

export default hrRule;
