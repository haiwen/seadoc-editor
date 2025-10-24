import React, { useEffect, useState, useImperativeHandle, forwardRef, useMemo, useCallback } from 'react';
import { Editor, Text } from '@seafile/slate';
import deepCopy from 'deep-copy';
import isHotkey from 'is-hotkey';
import PropTypes from 'prop-types';
import { registerTitleBarEventHandler } from '../android/editor-title-bar';
import jsBridge from '../android/js-bridge';
import { registerOutlineEventHandler, updateOutlineValue } from '../android/outline-module';
import FileLoading from '../components/file-loading';
import { INTERNAL_EVENT, PAGE_EDIT_AREA_WIDTH } from '../constants';
import context from '../context';
import { createDefaultEditor, HeaderToolbar } from '../extension';
import InsertElementDialog from '../extension/commons/insert-element-dialog';
import { focusEditor } from '../extension/core';
import { removeMarks } from '../extension/plugins/ai/ai-module/helpers';
import { ColorProvider } from '../hooks/use-color-context';
import { EditorContainer, EditorContent } from '../layout';
import withNodeId from '../node-id';
import { withSocketIO } from '../socket';
import { isMobile } from '../utils/common-utils';
import EventBus from '../utils/event-bus';
import ReadOnlyArticle from '../views/readonly-article';
import EditableArticle from './editable-article';

const SdocEditor = forwardRef(({ editor: propsEditor, document, isReloading, showComment, isShowHeaderToolbar = true, showOutline = true }, ref) => {
  const [showFullScreen, setShowFullScreen] = useState(false);

  const validEditor = useMemo(() => {
    if (propsEditor) return propsEditor;
    const defaultEditor = createDefaultEditor();
    const editorConfig = context.getEditorConfig();
    const newEditor = withNodeId(withSocketIO(defaultEditor, { document, config: editorConfig }));
    const { cursors } = document;
    newEditor.cursors = cursors || {};
    newEditor.width = PAGE_EDIT_AREA_WIDTH; // default width
    return newEditor;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [slateValue, setSlateValue] = useState(document.elements);
  const [isEdit, setIsEdit] = useState(false);

  // Fix: The editor's children are not updated when the document is updated in revision
  // In revision mode, the document is updated, but the editor's children are not updated,as onValueChange override the new document.elements. This unexpected action cause the editor to display the old content
  useEffect(() => {
    setSlateValue(document.elements);
  }, [document.elements]);

  useEffect(() => {
    validEditor.readonly = false;
    return () => {
      validEditor.selection = null;
    };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // useMount: init socket connection
  useEffect(() => {
    if (propsEditor) return;
    validEditor.openConnection();
    return () => {
      validEditor.closeConnection();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useMount: focus editor
  useEffect(() => {
    const timer = setTimeout(() => {
      const [firstNode] = validEditor.children;
      if (firstNode) {
        const [firstNodeFirstChild] = firstNode.children;

        if (firstNodeFirstChild) {
          const endOfFirstNode = Editor.end(validEditor, [0, 0]);
          const range = {
            anchor: endOfFirstNode,
            focus: endOfFirstNode,
          };
          focusEditor(validEditor, range);
        }
      }
    }, 300);
    return () => {
      clearTimeout(timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const mobileLogin = context.getSetting('mobileLogin');
    if (mobileLogin) {
      jsBridge.init();
      registerOutlineEventHandler();
      registerTitleBarEventHandler();
      updateOutlineValue(document.elements);
    }

    return () => {
      jsBridge.finishPage();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefreshDocument = useCallback(() => {
    window.location.reload();
  }, []);

  // useMount: refresh document
  useEffect(() => {
    const eventBus = EventBus.getInstance();
    eventBus.subscribe(INTERNAL_EVENT.REFRESH_DOCUMENT, onRefreshDocument);

    // Remove Marks on special conditions like unexpected exit or refresh page using AI or context comment
    const hasSpecialMark = !Editor.nodes(validEditor, {
      at: [],
      match: n => Text.isText(n) && (n.sdoc_ai === true || n.comment === true),
    }).next().done;

    if (hasSpecialMark) {
      removeMarks(validEditor);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onRefreshDocument]);

  // Handle presentation fullscreen mode
  const handleFullScreenPresentation = useCallback(({ isShowFullScreen }) => {
    if (isShowFullScreen) {
      // Boundary situation
      removeMarks(validEditor);

      setShowFullScreen(true);
    }
  }, [validEditor]);

  useEffect(() => {
    const eventBus = EventBus.getInstance();
    const unsubscribePresentationFullScreen = eventBus.subscribe(INTERNAL_EVENT.TOGGLE_PRESENTATION_MODE, handleFullScreenPresentation);
    return () => {
      unsubscribePresentationFullScreen();
    };
  }, [handleFullScreenPresentation]);

  const handleEditToggle = useCallback(({ isEdit }) => {
    setIsEdit(isEdit);
  }, []);

  useEffect(() => {
    const eventBus = EventBus.getInstance();
    const unsubscribeViewOrEdit = eventBus.subscribe('ViewOrEdit', handleEditToggle);
    return () => {
      unsubscribeViewOrEdit();
    };
  }, [handleEditToggle]);

  useEffect(() => {
    const handleExit = (e) => {
      if (isHotkey('esc', e)) {
        e.preventDefault();
        if (window.document.fullscreenElement) {
          window.document.exitFullscreen();
        }
      }
      if (isHotkey('mod+s', e)) {
        e.preventDefault();
      }
    };

    const onFullscreenChange = () => {
      if (!window.document.fullscreenElement) {
        setShowFullScreen(false);
      }
    };

    window.addEventListener('keydown', handleExit);
    window.document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      window.removeEventListener('keydown', handleExit);
      window.document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The parent component can call the method of this component through ref
  useImperativeHandle(ref, () => ({

    setSlateValue: (document) => {
      // Force update of editor's child elements
      validEditor.children = document.elements;
      setSlateValue([...document.elements]);
    },

    updateDocumentVersion: (document) => {
      validEditor.updateDocumentVersion(document);
    },

    // get value
    getSlateValue: () => {
      return deepCopy({ ...document, elements: slateValue });
    },

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [document, validEditor, slateValue]);

  const onValueChange = (value) => {
    const eventBus = EventBus.getInstance();
    setSlateValue(value);
    // After the content is updated, update the search content
    setTimeout(() => {
      eventBus.dispatch(INTERNAL_EVENT.UPDATE_SEARCH_REPLACE_HIGHLIGHT, value);
    }, 0);
    if (isMobile) {
      updateOutlineValue(value);
    }
  };

  const isFreezed = context.getSetting('isFreezed');

  if (isReloading) {
    return (
      <div className="h-100 w-100 d-flex align-items-center justify-content-center">
        <FileLoading />
      </div>
    );
  }

  if ((isMobile && !isEdit) || showFullScreen) {
    return (
      <EditorContainer editor={validEditor} readonly={true} fullscreen={showFullScreen}>
        <ColorProvider>
          <EditorContent docValue={slateValue} readonly={true} showOutline={false} editor={validEditor} showComment={false}>
            <ReadOnlyArticle editor={validEditor} slateValue={slateValue} showComment={false} />
          </EditorContent>
        </ColorProvider>
      </EditorContainer>
    );
  }

  if (isFreezed) {
    return (
      <EditorContainer editor={validEditor} readonly={isFreezed}>
        <ColorProvider>
          {isShowHeaderToolbar && <HeaderToolbar editor={validEditor} readonly={isFreezed} />}
          <EditorContent docValue={slateValue} showOutline={true} readonly={isFreezed} editor={validEditor} showComment={true}>
            <ReadOnlyArticle editor={validEditor} slateValue={slateValue} showComment={true} />
          </EditorContent>
        </ColorProvider>
      </EditorContainer>
    );
  }

  const isShowComment = typeof showComment === 'boolean' ? showComment : true;

  if (isMobile && isEdit) {
    return (
      <>
        <EditorContainer editor={validEditor}>
          <ColorProvider>
            <EditorContent docValue={slateValue} showOutline={false} editor={validEditor} showComment={false}>
              <EditableArticle editor={validEditor} slateValue={slateValue} updateSlateValue={onValueChange} showComment={false} />
            </EditorContent>
            {isShowHeaderToolbar && <HeaderToolbar editor={validEditor} isEdit={isEdit} />}
          </ColorProvider>
        </EditorContainer>
        <InsertElementDialog editor={validEditor} />
      </>
    );
  }

  return (
    <>
      <EditorContainer editor={validEditor}>
        <ColorProvider>
          {isShowHeaderToolbar && <HeaderToolbar editor={validEditor} />}
          <EditorContent docValue={slateValue} showOutline={showOutline ?? true} editor={validEditor} showComment={isShowComment}>
            <EditableArticle editor={validEditor} slateValue={slateValue} updateSlateValue={onValueChange} showComment={isShowComment} />
          </EditorContent>
        </ColorProvider>
      </EditorContainer>
      <InsertElementDialog editor={validEditor} />
    </>
  );
});

SdocEditor.propTypes = {
  isReloading: PropTypes.bool,
  document: PropTypes.object.isRequired,
  editor: PropTypes.object,
  showComment: PropTypes.bool,
};

export default SdocEditor;
