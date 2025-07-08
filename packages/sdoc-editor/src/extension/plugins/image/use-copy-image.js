import { useEffect, useState } from 'react';
import { Transforms } from '@seafile/slate';
import { ReactEditor } from '@seafile/slate-react';
import context from '../../../context';
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
    if (!isImageUrlIsFromCopy(data.url)) {
      setIsCopyError(false);
    }
  }, [data.url]);

  return {
    isCopyImageLoading: isLoading,
    setCopyImageLoading: setIsLoading,
    isCopyImageError: isCopyError,
  };
};

export default useCopyImage;
