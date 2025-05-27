import { PARAGRAPH } from '../../constants';
import withParagraph from './plugin';
import { renderParagraph } from './render-elem';

const ParagraphPlugin = {
  type: PARAGRAPH,
  editorPlugin: withParagraph,
  renderElements: [renderParagraph]
};

export default ParagraphPlugin;
