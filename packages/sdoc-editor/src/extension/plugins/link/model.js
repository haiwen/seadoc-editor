import { LINK as LINKTRENAME } from '../../constants';

class Link {

  constructor(options) {
    this.type = options.type || LINKTRENAME;
    this.children = options.children || [{ text: '' }];
    this.href = options.href || '';
    this.title = options.title || '';
  }

}

export default Link;
