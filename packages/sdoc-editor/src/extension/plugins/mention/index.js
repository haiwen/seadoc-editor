import { MENTION } from '../../constants/element-type';
import withMention from './plugin';
import { renderMention, renderMentionTemporaryInput } from './render-elem';

const MentionPlugin = {
  type: MENTION,
  nodeType: 'element',
  editorPlugin: withMention,
  renderElements: [renderMention, renderMentionTemporaryInput],
};

export default MentionPlugin;
