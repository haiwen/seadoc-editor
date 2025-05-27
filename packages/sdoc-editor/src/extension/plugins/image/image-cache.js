class ImageCache {

  constructor() {
    this.imageCache = null;
  }

  static saveImage(key, item) {
    if (!this.imageCache) {
      this.imageCache = new Map();
    }
    this.imageCache.set(key, item);
  }

  static getImage(key) {
    if (!this.imageCache) {
      this.imageCache = new Map();
    }
    return this.imageCache.get(key);
  }

  static deleteImage(key) {
    if (!this.imageCache) {
      this.imageCache = new Map();
    }
    this.imageCache.delete(key);
  }
}

export default ImageCache;
