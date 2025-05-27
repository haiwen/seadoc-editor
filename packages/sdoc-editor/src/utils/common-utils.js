export const isEnglish = (str) => {
  const pattern = new RegExp('[A-Za-z]+');
  if (pattern.test(str)){
    return true;
  }
  return false;
};

export const getMaximumCapacity = (files) => {
  const containerMaxHeight = 350;
  const containerTop = 40;
  const containerBottom = 32;
  const containerMore = 32;
  const availableHeight = containerMaxHeight - containerTop - containerBottom - containerMore;

  let allHeight = 0;
  const newFiles = [];
  files.forEach(file => {
    const itemHeight = file?.path ? 51 : 32;
    allHeight = allHeight + itemHeight;
    if (allHeight <= availableHeight) {
      newFiles.push(file);
    }
  });
  return newFiles;
};

export const getLocalStorageFiles = (files) => {
  const wikiRepoId = window.wiki.config.wikiId;
  const newFiles = [];
  files.forEach((item) => {
    if (item?.wikiRepoId === wikiRepoId) {
      newFiles.push(item);
    }
  });
  return newFiles;
};

export const isMac = () => {
  const platform = navigator.platform;
  return (platform === 'Mac68K') || (platform === 'MacPPC') || (platform === 'Macintosh') || (platform === 'MacIntel');
};

export const isMobile = (typeof (window) !== 'undefined') && (window.innerWidth < 768 || navigator.userAgent.toLowerCase().match(/(ipod|ipad|iphone|android|coolpad|mmp|smartphone|midp|wap|xoom|symbian|j2me|blackberry|wince)/i) != null);

export const getErrorMsg = (error) => {
  let errorMsg = '';
  if (error.response) {
    if (error.response.status === 403) {
      errorMsg = 'Permission_denied';
    } else if (error.response.data &&
      error.response.data['error_msg']) {
      errorMsg = error.response.data['error_msg'];
    } else {
      errorMsg = 'Error';
    }
  } else {
    errorMsg = 'Please_check_the_network';
  }
  return errorMsg;
};
