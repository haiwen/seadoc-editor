import { useEffect, useState } from 'react';
import { Transforms } from '@seafile/slate';
import { HistoryEditor } from '@seafile/slate-history';
import { ReactEditor } from '@seafile/slate-react';
import toaster from '../../../components/toast';
import context from '../../../context';
import { getErrorMsg } from '../../../utils/common-utils';
import VideoCache from './video-cache';

const updateVideoInsertOperation = (editor, element, data) => {
  const insertOperation = editor.history.undos
    .flatMap(batch => batch.operations)
    .find(operation => operation.type === 'insert_node' && operation.node?.id === element.id);

  if (insertOperation) {
    // Keep redo from restoring the pending-upload state.
    insertOperation.node = { ...insertOperation.node, data };
  }
};

const useUploadVideo = ({ editor, element }) => {
  const { data } = element;
  const [isLoading, setIsLoading] = useState(() => Boolean(data.file_uuid && VideoCache.getVideo(data.file_uuid)));
  const [isUploadComplete, setIsUploadComplete] = useState(false);

  useEffect(() => {
    const { file_uuid } = data;
    const file = VideoCache.getVideo(file_uuid);
    if (!file) return;

    let isMounted = true;
    let uploadComplete = false;
    const uploadVideo = async () => {
      try {
        const uploadedUrls = await context.uploadLocalVideo([file]);
        if (uploadedUrls && uploadedUrls[0]) {
          try {
            const nodePath = ReactEditor.findPath(editor, element);
            const newData = { ...data, src: uploadedUrls[0] };
            delete newData.file_uuid;
            HistoryEditor.withoutSaving(editor, () => {
              Transforms.setNodes(editor, { data: newData }, { at: nodePath });
            });
            updateVideoInsertOperation(editor, element, newData);
            uploadComplete = true;
          } catch {
            // The video node may have been removed while the upload was in progress.
          }
        } else {
          throw new Error('Video upload returned no file URL.');
        }
      } catch (error) {
        const errorMessage = error.response ? getErrorMsg(error) : error.message;
        toaster.danger(errorMessage);
        try {
          const nodePath = ReactEditor.findPath(editor, element);
          Transforms.removeNodes(editor, { at: nodePath });
        } catch {
          // The video node may have been removed while the upload was in progress.
        }
      } finally {
        VideoCache.deleteVideo(file_uuid);
        if (isMounted) {
          setIsLoading(false);
          setIsUploadComplete(uploadComplete);
        }
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

  return { isUploadLoading: isLoading, isUploadComplete };
};

export default useUploadVideo;
