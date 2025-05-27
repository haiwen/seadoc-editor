import { QUICK_INSERT } from '../../constants';
import withQuickInsert from './plugin';
import renderQuickInsert from './render-elem';

const QuickInsertPlugin = {
  type: QUICK_INSERT,
  editorPlugin: withQuickInsert,
  renderElements: [renderQuickInsert]
};

export default QuickInsertPlugin;
