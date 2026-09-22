export const SEADOC_VIDEO_SIZE_LIMIT = 5 * 1024 * 1024;

export const getSeadocVideoSizeLimit = (sizeLimit) => {
  const parsedSizeLimit = Number(sizeLimit);
  return Number.isFinite(parsedSizeLimit) && parsedSizeLimit > 0 ? parsedSizeLimit : SEADOC_VIDEO_SIZE_LIMIT;
};

export const ONE_GB = 1000 * 1000 * 1000;
export const ONE_MB = 1000 * 1000;
export const ONE_KB = 1000;
