import { BLOCKQUOTE } from '../../constants';

class Blockquote {

  constructor(options) {
    this.type = options.type || BLOCKQUOTE;
    this.children = options.children || [{ text: '' }];
  }

}

export default Blockquote;
