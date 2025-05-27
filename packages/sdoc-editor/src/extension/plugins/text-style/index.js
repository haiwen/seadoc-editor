import withTextStyle from './plugin';
import renderText from './render-elem';

const TextPlugin = {
  type: 'text',
  editorPlugin: withTextStyle,
  renderElements: [renderText]
};

export default TextPlugin;
