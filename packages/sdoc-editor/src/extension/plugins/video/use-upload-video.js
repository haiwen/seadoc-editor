import { useEffect, useState } from 'react';
import { Transforms } from '@seafile/slate';
import { ReactEditor } from '@seafile/slate-react';
import context from '../../../context';
import VideoCache from './video-cache';

const useUploadVideo = ({ editor, element }) => {
  const { data } = element;
  const [isLoading, setIsLoading] = useState(() => Boolean(data.file_uuid && VideoCache.getVideo(data.file_uuid)));

  useEffect(() => {
    const { file_uuid } = data;
    const file = VideoCache.getVideo(file_uuid);
    if (!file) return;

    let isMounted = true;
    const uploadVideo = async () => {
      try {
        const uploadedUrls = await context.uploadLocalVideo([file]);
        if (uploadedUrls && uploadedUrls[0]) {
          try {
            const nodePath = ReactEditor.findPath(editor, element);
            const newData = { ...data, src: uploadedUrls[0] };
            delete newData.file_uuid;
            Transforms.setNodes(editor, { data: newData }, { at: nodePath });
          } catch {
            // The video node may have been removed while the upload was in progress.
          }
        } else {
          throw new Error('Video upload returned no file URL.');
        }
      } catch (error) {
        console.error(error.message);
        try {
          const nodePath = ReactEditor.findPath(editor, element);
          Transforms.removeNodes(editor, { at: nodePath });
        } catch {
          // The video node may have been removed while the upload was in progress.
        }
      } finally {
        VideoCache.deleteVideo(file_uuid);
        if (isMounted) setIsLoading(false);
      }
    };

    let uploadTimeoutId;
    const animationFrameId = requestAnimationFrame(() => {
      uploadTimeoutId = window.setTimeout(uploadVideo, 0);
    });
    return () => {
      isMounted = false;
      cancelAnimationFrame(animationFrameId);
      if (uploadTimeoutId !== undefined) {
        window.clearTimeout(uploadTimeoutId);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isUploadLoading: isLoading };
};

export default useUploadVideo;
