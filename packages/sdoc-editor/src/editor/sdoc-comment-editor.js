import React, { useEffect, useState, useImperativeHandle, forwardRef, useMemo, useRef } from 'react';
import { Editor } from '@seafile/slate';
import deepCopy from 'deep-copy';
import PropTypes from 'prop-types';
import FileLoading from '../components/file-loading';
import { COMMENT_EDITOR_EDIT_AREA_WIDTH } from '../constants';
import context from '../context';
import { createCommentEditor } from '../extension';
import { focusEditor } from '../extension/core';
import CommentEditorToolbar from '../extension/toolbar/comment-editor-toolbar';
import { CollaboratorsProvider } from '../hooks/use-collaborators';
import { ScrollContext } from '../hooks/use-scroll-context';
import { EditorContainer } from '../layout';
import withNodeId from '../node-id';
import { withSocketIO } from '../socket';
import CommentArticle from './comment-article';

const SdocCommentEditor = forwardRef(({ editor: propsEditor, document, isReloading, type, onSubmit, submitBtnText, onCancel }, ref) => {

  const [slateValue, setSlateValue] = useState(document.elements);
  const commentEditorContainerRef = useRef(null);

  const validEditor = useMemo(() => {
    if (propsEditor) return propsEditor;
    const defaultEditor = createCommentEditor();
    const editorConfig = context.getEditorConfig();
    const newEditor = withNodeId(withSocketIO(defaultEditor, { document, config: editorConfig }));
    const { cursors } = document;
    newEditor.cursors = cursors || {};
    newEditor.width = COMMENT_EDITOR_EDIT_AREA_WIDTH; // default width

    return newEditor;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // useMount: focus editor
  useEffect(() => {
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
      // Force refresh to fix comment list
      setSlateValue([...validEditor.children]);
    }
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

  if (isReloading) {
    return (
      <div className="h-100 w-100 d-flex align-items-center justify-content-center">
        <FileLoading />
      </div>
    );
  }

  const handleFocusEditor = (e) => {
    if (e.target === commentEditorContainerRef.current) {
      const focusPoint = Editor.end(validEditor, []);
      focusEditor(validEditor, focusPoint);
    }
  };

  return (
    <EditorContainer editor={validEditor}>
      <CollaboratorsProvider>
        <div className="sdoc-comment-editor-wrapper">
          <div ref={commentEditorContainerRef} className='article sdoc-comment-editor' onClick={handleFocusEditor} >
            <ScrollContext.Provider value={{ scrollRef: commentEditorContainerRef }}>
              <CommentArticle type={type} editor={validEditor} slateValue={slateValue} updateSlateValue={setSlateValue} />
            </ScrollContext.Provider>
          </div>
          <CommentEditorToolbar
            editor={validEditor}
            onSubmit={onSubmit}
            submitBtnText={submitBtnText}
            onCancel={onCancel}
          />
        </div>
      </CollaboratorsProvider>
    </EditorContainer>
  );
});

SdocCommentEditor.propTypes = {
  isReloading: PropTypes.bool,
  document: PropTypes.object.isRequired,
  editor: PropTypes.object,
  type: PropTypes.oneOf(['comment', 'reply']),
  onSubmit: PropTypes.func,
  submitBtnText: PropTypes.string,
  onCancel: PropTypes.func
};

export default SdocCommentEditor;
