import { ELEMENT_TYPE } from '../../constants';
import { renderGroup } from './render-elem';

const GroupPlugin = {
  type: ELEMENT_TYPE.GROUP,
  renderElements: [renderGroup]
};

export default GroupPlugin;
