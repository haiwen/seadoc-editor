import { context } from '@seafile/sdoc-editor';
import DateUtils from './date-utils';

export const getDirPath = (path) => {
  let dir = path.slice(0, path.lastIndexOf('/'));
  if (dir === '') {
    return '/';
  } else {
    return dir;
  }
};

export const getImageFileNameWithTimestamp = () => {
  var d = Date.now();
  return 'image-' + d.toString() + '.png';
};

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

export const resetWebTitle = (t) => {
  const isSdocRevision = context.getSetting('isSdocRevision');
  const originFilename = context.getSetting('originFilename');
  if (!isSdocRevision) return;
  window.document.getElementsByTagName('title')[0].innerText = `${t('Revision')} - ${originFilename}`;
};

/**
 * Check if UA includes Seafile Android/iOS 3.0
 * @returns {boolean} - If it is a Seafile client, return true; otherwise, return false
 */
export const isSeafileClient = () => {
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';

  return /Seafile (Android|iOS)\/3\.0/.test(userAgent);
};

export {
  DateUtils,
};
