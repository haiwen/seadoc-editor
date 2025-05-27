import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import toaster from '../../../components/toast';
import { INTERNAL_EVENT, WIKI_EDITOR } from '../../../constants';
import context from '../../../context';
import EventBus from '../../../utils/event-bus';
import { ELEMENT_TYPE, INSERT_POSITION, LOCAL_IMAGE, LOCAL_VIDEO } from '../../constants';
import AIModule from '../../plugins/ai/ai-module/index.js';
import { generateImageInfos, insertImage } from '../../plugins/image/helpers';
import AddLinkDialog from '../../plugins/link/dialog/add-link-dialog';
import { CustomTableSizeDialog, SplitCellSettingDialog } from '../../plugins/table/dialogs';
import { VIDEO_MAX_SIZE_5MB } from '../../plugins/video/constants/index.js';
import AddVideoLinkDialog from '../../plugins/video/dialog/add-video-link-dialog/index.js';
import { insertVideo } from '../../plugins/video/helpers';
import FileLinkInsertDialog from '../file-insert-dialog/index.js';
import SelectFileDialog from '../select-file-dialog/index.js';
import WikiFileLinkInsertDialog from '../wiki-file-insert-dialog/index.js';

const InsertElementDialog = ({ editor }) => {
  const [dialogType, setDialogType] = useState('');
  const [element, setElement] = useState('');
  const [insertPosition, setInsertPosition] = useState(INSERT_POSITION.CURRENT);
  const [slateNode, setSlateNode] = useState(null);
  const [insertLinkCallback, setInsertLinkCallback] = useState(null);
  const [insertVideoCallback, setInsertVideoCallback] = useState(null);
  const [validEditor, setValidEditor] = useState(editor);
  const [linkTitle, setLinkTitle] = useState('');
  const [handleSubmit, setHandleSubmit] = useState(() => void 0);
  const [data, setData] = useState({});
  const { t } = useTranslation('sdoc-editor');

  const uploadLocalImageInputRef = useRef();
  const uploadLocalVideoInputRef = useRef();

  const onFileChanged = useCallback((event) => {
    const imgInfos = generateImageInfos(event.target.files);
    insertImage(validEditor, imgInfos, validEditor.selection, insertPosition);
    if (uploadLocalImageInputRef.current) {
      uploadLocalImageInputRef.current.value = '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validEditor, uploadLocalImageInputRef, insertPosition, slateNode]);

  const handleDisplayAlert = useCallback(() => {
    setTimeout(() => {
      toaster.warning(`${t('The_current_version_does_not_support_>5MB_video_file')}`, { duration: 3 });
    }, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onVideoFileChanged = useCallback((event) => {
    const files = event.target.files;
    // Show warning for 3s and no further insertion if video file is more than 5MB
    if (files[0].size > VIDEO_MAX_SIZE_5MB) {
      handleDisplayAlert();
      event.target.value = null;
      return;
    }

    context.uploadLocalVideo(files).then(fileUrl => {
      insertVideo(validEditor, files, fileUrl, validEditor.selection, insertPosition);
      if (uploadLocalVideoInputRef.current) {
        uploadLocalVideoInputRef.current.value = '';
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validEditor, uploadLocalImageInputRef, insertPosition, slateNode]);

  useEffect(() => {
    const eventBus = EventBus.getInstance();
    const toggleDialogSubscribe = eventBus.subscribe(INTERNAL_EVENT.INSERT_ELEMENT, toggleDialog);
    return () => {
      toggleDialogSubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleDialog = useCallback(({
    type,
    element,
    insertPosition = INSERT_POSITION.CURRENT,
    slateNode,
    insertFileLinkCallback,
    insertSdocFileLinkCallback,
    insertVideo,
    editor: paramEditor,
    linkTitle, // link shortcut wrapping link
    handleSubmit,
    data,
  }) => {
    setInsertPosition(insertPosition);
    setSlateNode(slateNode);
    setElement(element);
    setDialogType(type);
    setInsertLinkCallback({
      insertSdocFileLinkCallback,
      insertFileLinkCallback
    });
    setInsertVideoCallback({ insertVideo });
    setLinkTitle(linkTitle);
    setHandleSubmit(handleSubmit);
    // Apply for comment editor, as it has a different editor instance
    setValidEditor(paramEditor || editor);
    setData(data);
    if (type === LOCAL_IMAGE) {
      setTimeout(() => {
        uploadLocalImageInputRef.current && uploadLocalImageInputRef.current.click();
      }, 0);
    }
    if (type === LOCAL_VIDEO) {
      setTimeout(() => {
        uploadLocalVideoInputRef.current && uploadLocalVideoInputRef.current.click();
      }, 0);
    }
  }, [editor]);

  const closeDialog = useCallback(() => {
    setInsertPosition(INSERT_POSITION.CURRENT);
    setSlateNode(null);
    setElement('');
    setDialogType('');
    setInsertLinkCallback(null);
    setInsertVideoCallback(null);
    setValidEditor(null);
    setLinkTitle('');
    setData('');
  }, []);

  const props = {
    insertPosition,
    slateNode,
    editor: validEditor,
    element,
    closeDialog,
    linkTitle,
    handleSubmit,
    data,
  };

  switch (dialogType) {
    case ELEMENT_TYPE.TABLE: {
      return (<CustomTableSizeDialog {...props} />);
    }
    case ELEMENT_TYPE.TABLE_CELL: {
      return (<SplitCellSettingDialog {...props} />);
    }
    case ELEMENT_TYPE.LINK: {
      return (<AddLinkDialog {...props} />);
    }
    case ELEMENT_TYPE.SDOC_LINK: {
      const sdocLinkProps = {
        editor: validEditor,
        dialogType,
        insertLinkCallback,
        closeDialog,
      };
      return (<SelectFileDialog {...sdocLinkProps} />);
    }
    case ELEMENT_TYPE.FILE_LINK: {
      const fileLinkProps = {
        editor: validEditor,
        dialogType,
        insertLinkCallback,
        closeDialog,
      };
      return (<SelectFileDialog {...fileLinkProps} />);
    }
    case ELEMENT_TYPE.VIDEO: {
      const videoProps = {
        editor: validEditor,
        dialogType,
        insertVideoCallback,
        closeDialog,
      };
      return (<SelectFileDialog {...videoProps} />);
    }
    case ELEMENT_TYPE.VIDEO_LINK: {
      return (<AddVideoLinkDialog {...props} />);
    }
    case LOCAL_IMAGE: {
      return (<input onClick={e => e.stopPropagation()} ref={uploadLocalImageInputRef} type="file" multiple={true} accept='image/*' style={{ display: 'none' }} onChange={onFileChanged} />);
    }
    case LOCAL_VIDEO: {
      return (<input onClick={e => e.stopPropagation()} ref={uploadLocalVideoInputRef} type="file" accept='video/*' style={{ display: 'none' }} onChange={onVideoFileChanged} />);
    }
    case ELEMENT_TYPE.FILE_LINK_INSET_INPUT_TEMP : {
      if (editor.editorType === WIKI_EDITOR) {
        return <WikiFileLinkInsertDialog element={slateNode} editor={editor} closeDialog={closeDialog} />;
      }
      return <FileLinkInsertDialog element={slateNode} editor={editor} closeDialog={closeDialog} />;
    }
    case ELEMENT_TYPE.ASK_AI: {
      return <AIModule element={slateNode} editor={editor} closeModule={closeDialog} />;
    }
    default: {
      return null;
    }
  }
};

export default InsertElementDialog;
