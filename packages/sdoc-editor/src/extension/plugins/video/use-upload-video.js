import { useEffect, useState } from 'react';
import { Transforms } from '@seafile/slate';
import { HistoryEditor } from '@seafile/slate-history';
import { ReactEditor } from '@seafile/slate-react';
import toaster from '../../../components/toast';
import context from '../../../context';
import { getErrorMsg } from '../../../utils/common-utils';
import VideoCache from './video-cache';

const updateVideoNodeInHistory = (node, videoId, data) => {
  if (node?.id === videoId) {
    return { ...node, data };
  }

  if (!Array.isArray(node?.children)) return node;

  let hasUpdatedChild = false;
  const children = node.children.map(child => {
    const updatedChild = updateVideoNodeInHistory(child, videoId, data);
    hasUpdatedChild = hasUpdatedChild || updatedChild !== child;
    return updatedChild;
  });

  return hasUpdatedChild ? { ...node, children } : node;
};

const updateVideoInsertOperation = (editor, element, data) => {
  for (const operation of editor.history.undos.flatMap(batch => batch.operations)) {
    if (operation.type === 'insert_node') {
      const node = updateVideoNodeInHistory(operation.node, element.id, data);
      if (node !== operation.node) {
        // Keep redo from restoring a pending video, including one nested in a wrapper.
        operation.node = node;
        return;
      }
    } else if (operation.type === 'set_node') {
      const newProperties = updateVideoNodeInHistory(operation.newProperties, element.id, data);
      if (newProperties !== operation.newProperties) {
        operation.newProperties = newProperties;
        return;
      }
    }
  }
};

const useUploadVideo = ({ editor, element }) => {
  const { data } = element;
  const [isLoading, setIsLoading] = useState(() => Boolean(data.file_uuid && VideoCache.getVideo(data.file_uuid)));
  const [isUploadComplete, setIsUploadComplete] = useState(() => Boolean(data.is_upload_complete));

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
            const newData = { ...data, src: uploadedUrls[0], is_upload_complete: true };
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
