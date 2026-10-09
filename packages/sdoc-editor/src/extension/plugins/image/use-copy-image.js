import { useEffect, useState } from 'react';
import { Transforms } from '@seafile/slate';
import { ReactEditor } from '@seafile/slate-react';
import context from '../../../context';
import LocalStorage from '../../../utils/local-storage-utils';
import { RECENT_COPY_CONTENT } from '../../constants';
import { isImageUrlIsFromCopy, getImageURL, isCommentEditor } from './helpers';

const updateImageNode = async (editor, element, newUrl, isError = false) => {
  const url = isCommentEditor(editor) ? getImageURL({ src: newUrl }, editor) : newUrl;
  const nodePath = ReactEditor.findPath(editor, element);
  const newData = { ...element.data, src: url, is_copy_error: isError };
  Transforms.setNodes(editor, { data: newData }, { at: nodePath });
};

// Prevent SSRF: block requests to loopback, link-local (incl. cloud metadata) and private network ranges
const isForbiddenImageUrl = (urlString) => {
  try {
    const { protocol, hostname } = new URL(urlString);
    if (protocol !== 'http:' && protocol !== 'https:') return true;
    if (hostname === 'localhost' || hostname === '::1') return true;
    const ipv4 = hostname.match(/^(\d{1,3})\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/);
    if (ipv4) {
      const first = parseInt(ipv4[1], 10);
      const second = parseInt(ipv4[2], 10);
      if (first === 127 || first === 10 || first === 0) return true;
      if (first === 169 && second === 254) return true;
      if (first === 172 && second >= 16 && second <= 31) return true;
      if (first === 192 && second === 168) return true;
    }
    return false;
  } catch (e) {
    return true;
  }
};

const useCopyImage = ({ editor, element }) => {
  const { data } = element;
  const { is_copy_error = false } = data;
  const [isLoading, setIsLoading] = useState();
  const [isCopyError, setIsCopyError] = useState(is_copy_error);

  useEffect(() => {
    const { src: url } = data;
    if (isCopyError) return;
    if (!isImageUrlIsFromCopy(url)) return;

    // not md convert to sdoc
    if (url.indexOf('/file/images/auto-upload/') < 0) {
      const cacheContent = LocalStorage.getItem(RECENT_COPY_CONTENT);
      // sync content from another user's copy
      if (!cacheContent || JSON.stringify(cacheContent).indexOf(url) === -1) return;
    }

    const downloadAndUploadImages = async (url) => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const blob = await response.blob();
          const file = new File([blob], 'downloaded_image.png', { type: blob.type });
          const imageUrl = await context.uploadLocalImage([file]);
          if (imageUrl && imageUrl[0]) {
            updateImageNode(editor, element, imageUrl[0]);
          }
        } else {
          throw new Error(`HTTP error status: ${response.status}`);
        }
      } catch (error) {
        console.error(error);
        updateImageNode(editor, element, url, true);
        setIsCopyError(true);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };

    downloadAndUploadImages(url);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isImageUrlIsFromCopy(data.src)) {
      setIsLoading(false);
      setIsCopyError(false);
    }

    if (isImageUrlIsFromCopy(data.src) && data.is_copy_error === true) {
      setIsLoading(false);
      setIsCopyError(true);
    }
  }, [data.is_copy_error, data.src]);

  return {
    isCopyImageLoading: isLoading,
    setCopyImageLoading: setIsLoading,
    isCopyImageError: isCopyError,
  };
};

export default useCopyImage;
