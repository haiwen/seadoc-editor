import React, { useEffect, useMemo, Fragment } from 'react';
import { withTranslation } from 'react-i18next';
import { context, WIKI_EDITOR, WIKI_EDITOR_EDIT_AREA_WIDTH, WikiEditor, createWikiEditor, withNodeId, withSocketIO, CollaboratorsProvider, PluginsProvider, CommentContextProvider, EventBus } from '@seafile/sdoc-editor';
import { Editor, Text, Transforms } from '@seafile/slate';
import { ReactEditor } from '@seafile/slate-react';
import PropTypes from 'prop-types';
import ErrorBoundary from '../components/error-boundary';

import '../assets/css/simple-viewer.css';

const propTypes = {
  document: PropTypes.object.isRequired,
  docUuid: PropTypes.string.isRequired,
  isWikiReadOnly: PropTypes.bool,
  scrollRef: PropTypes.object.isRequired
};

const SdocWikiEditor = ({ document, docUuid, isWikiReadOnly, scrollRef, collaborators, showComment, isShowRightPanel, setEditor }) => {

  context.initApi();

  const validEditor = useMemo(() => {
    const defaultEditor = createWikiEditor();
    // getEditorConfig cashe the config, so we need to update the uuid,for wiki editor
    docUuid && context.updateConfigUuid(docUuid);
    const editorConfig = context.getEditorConfig();
    let newEditor = null;
    if (!isWikiReadOnly) {
      newEditor = withNodeId(withSocketIO(defaultEditor, { document, config: editorConfig }));
    } else {
      newEditor = withNodeId(defaultEditor);
    }
    const { cursors } = document;
    newEditor.cursors = cursors || {};
    newEditor.width = WIKI_EDITOR_EDIT_AREA_WIDTH; // default width
    newEditor.editorType = WIKI_EDITOR;
    return newEditor;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docUuid]);

  useEffect(() => {
    if (setEditor && validEditor) {
      validEditor.editorType = WIKI_EDITOR;
      setEditor(validEditor);
    }
  }, [setEditor, validEditor]);

  useEffect(() => {
    if (isWikiReadOnly) return;
    validEditor.openConnection();
    return () => {
      validEditor.closeConnection();
    };
  }, [isWikiReadOnly, validEditor]);

  const focusEditor = ({ key }) => {
    if (['ArrowRight', 'ArrowDown'].includes(key)) {
      ReactEditor.focus(validEditor);

      const [nodeEntry] = Editor.nodes(validEditor, {
        universal: true,
        match: n => Text.isText(n)
      });
      if (!nodeEntry) return;
      const [, path] = nodeEntry;
      Transforms.select(validEditor, Editor.start(validEditor, path));
    }
  };

  useEffect(() => {
    const eventBus = EventBus.getInstance();
    const unsubscribe = eventBus.subscribe('wiki_editor_focus_internal', focusEditor);
    return () => {
      unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If you don't display comment, use Fragment to replace CommentProvider
  const WithCommentProvider = showComment ? CommentContextProvider : Fragment;

  return (
    <ErrorBoundary>
      <CollaboratorsProvider collaborators={collaborators}>
        <PluginsProvider plugins={[]} showComment={showComment}>
          <WithCommentProvider {...(showComment && { editor: validEditor })}>
            <WikiEditor
              document={document}
              docUuid={docUuid}
              editor={validEditor}
              isWikiReadOnly={isWikiReadOnly}
              scrollRef={scrollRef}
              showComment={showComment}
              isShowRightPanel={isShowRightPanel}
            />
          </WithCommentProvider>
        </PluginsProvider>
      </CollaboratorsProvider>
    </ErrorBoundary>
  );
};

SdocWikiEditor.propTypes = propTypes;

export default withTranslation('sdoc-editor')(SdocWikiEditor);
