import { IMAGE } from '../../constants';

class Image {

  constructor(options) {
    this.type = options.type || IMAGE;
    this.data = options.data || { src: '' };
    this.children = options.children || [{ text: '' }];
  }

}

export default Image;
