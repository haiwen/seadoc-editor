import React, { useEffect, useRef, useImperativeHandle, forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { PAGE_EDIT_AREA_WIDTH } from '../constants';
import context from '../context';
import { createDefaultEditor } from '../extension';
import withNodeId from '../node-id';
import { withSocketIO } from '../socket';
import { RevisionDiffViewer } from '../views';
import SdocEditor from './sdoc-editor';

const RevisionEditor = forwardRef(({ isShowChanges, isReloading, document, revisionContent, didMountCallback }, ref) => {

  const editorRef = useRef(null);
  const editor = useMemo(() => {
    const defaultEditor = createDefaultEditor();
    const editorConfig = context.getEditorConfig();
    const newEditor = withNodeId(withSocketIO(defaultEditor, { document, config: editorConfig }));
    const { cursors } = document;
    newEditor.cursors = cursors || {};
    newEditor.width = PAGE_EDIT_AREA_WIDTH; // default width
    return newEditor;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useMount: init socket connection
  useEffect(() => {
    editor.openConnection();
    return () => {
      editor.closeConnection();
    };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The parent component can call the method of this component through ref
  useImperativeHandle(ref, () => ({

    setSlateValue: (document) => {
      return editorRef.current.setSlateValue(document);
    },

    updateDocumentVersion: (document) => {
      return editorRef.current.updateDocumentVersion(document);
    },

    // get value
    getSlateValue: () => {
      return editorRef.current.getSlateValue();
    },

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [editorRef]);

  if (isShowChanges) {
    return (<RevisionDiffViewer editor={editor} revisionContent={revisionContent} didMountCallback={didMountCallback} />);
  }

  return (<SdocEditor ref={editorRef} editor={editor} isReloading={isReloading} document={document} showComment={true} />);
});

RevisionEditor.propTypes = {
  isShowChanges: PropTypes.bool,
  isReloading: PropTypes.bool,
  document: PropTypes.object,
  revisionContent: PropTypes.object,
  didMountCallback: PropTypes.func,
};

export default RevisionEditor;
