export const SEADOC_VIDEO_SIZE_LIMIT = 100 * 1024 * 1024;

export const formatSeadocVideoSizeLimit = (sizeLimit = SEADOC_VIDEO_SIZE_LIMIT) => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let formattedSize = sizeLimit;
  let unitIndex = 0;

  while (formattedSize >= 1024 && unitIndex < units.length - 1) {
    formattedSize /= 1024;
    unitIndex += 1;
  }

  const displaySize = Number.isInteger(formattedSize) ? formattedSize : formattedSize.toFixed(1);
  return `${displaySize} ${units[unitIndex]}`;
};

export const ONE_GB = 1000 * 1000 * 1000;
export const ONE_MB = 1000 * 1000;
export const ONE_KB = 1000;
