import { useEffect, useState } from 'react';
import { Transforms } from '@seafile/slate';
import { ReactEditor } from '@seafile/slate-react';
import context from '../../../context';
import LocalStorage from '../../../utils/local-storage-utils';
import { RECENT_PASTE_HTML_CONTENT } from '../../constants/font';
import { isImageUrlIsFromCopy, getImageURL, isCommentEditor } from './helpers';

const updateImageNode = async (editor, element, newUrl, isError = false) => {
  const url = isCommentEditor(editor) ? getImageURL({ src: newUrl }, editor) : newUrl;
  const nodePath = ReactEditor.findPath(editor, element);
  const newData = { ...element.data, src: url, is_copy_error: isError };
  Transforms.setNodes(editor, { data: newData }, { at: nodePath });
};

const useCopyImage = ({ editor, element }) => {
  const { data } = element;
  const { is_copy_error = false, is_comment: isComment } = data;
  const [isLoading, setIsLoading] = useState();
  const [isCopyError, setIsCopyError] = useState(is_copy_error);

  useEffect(() => {
    const { src: url } = data;
    if (isCopyError) return;
    if (isComment) return;
    if (!isImageUrlIsFromCopy(url)) return;

    const cacheContent = LocalStorage.getItem(RECENT_PASTE_HTML_CONTENT);
    if (!cacheContent || JSON.stringify(cacheContent).indexOf(url) === -1) return;

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
