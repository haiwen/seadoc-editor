class VideoCache {

  constructor() {
    this.videoCache = null;
  }

  static saveVideo(key, item) {
    if (!this.videoCache) {
      this.videoCache = new Map();
    }
    this.videoCache.set(key, item);
  }

  static getVideo(key) {
    if (!this.videoCache) {
      this.videoCache = new Map();
    }
    return this.videoCache.get(key);
  }

  static deleteVideo(key) {
    if (!this.videoCache) {
      this.videoCache = new Map();
    }
    this.videoCache.delete(key);
  }
}

export default VideoCache;
