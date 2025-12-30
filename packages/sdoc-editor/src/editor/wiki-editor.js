import React, { useEffect, useState, useImperativeHandle, forwardRef, useMemo, useCallback, Fragment } from 'react';
import { Editor, Text } from '@seafile/slate';
import classNames from 'classnames';
import deepCopy from 'deep-copy';
import PropTypes from 'prop-types';
import FileLoading from '../components/file-loading';
import { INTERNAL_EVENT, WIKI_EDITOR_EDIT_AREA_WIDTH } from '../constants';
import context from '../context';
import { createDefaultEditor } from '../extension';
import InsertElementDialog from '../extension/commons/insert-element-dialog';
import { RECENT_COPY_CONTENT } from '../extension/constants';
import { removeMarks } from '../extension/plugins/ai/ai-module/helpers';
import { ColorProvider } from '../hooks/use-color-context';
import { ScrollContext } from '../hooks/use-scroll-context';
import { EditorContainer } from '../layout';
import withNodeId from '../node-id';
import WikiOutline from '../outline/wiki-outline';
import { withSocketIO } from '../socket';
import { isMobile } from '../utils/common-utils';
import EventBus from '../utils/event-bus';
import LocalStorage from '../utils/local-storage-utils';
import ReadOnlyArticle from '../views/readonly-article';
import EditableArticle from './editable-article';

const WikiEditor = forwardRef(({ editor: propsEditor, document, isReloading, isWikiReadOnly, scrollRef, showComment, isShowRightPanel }, ref) => {

  const validEditor = useMemo(() => {
    if (propsEditor) return propsEditor;
    const defaultEditor = createDefaultEditor();
    const editorConfig = context.getEditorConfig();
    const newEditor = withNodeId(withSocketIO(defaultEditor, { document, config: editorConfig }));
    const { cursors } = document;
    newEditor.cursors = cursors || {};
    newEditor.width = WIKI_EDITOR_EDIT_AREA_WIDTH; // default width
    return newEditor;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [slateValue, setSlateValue] = useState(document.elements);

  // Fix: The editor's children are not updated when the document is updated in revision
  // In revision mode, the document is updated, but the editor's children are not updated,as onValueChange override the new document.elements. This unexpected action cause the editor to display the old content
  useEffect(() => {
    validEditor.children = document.elements;
    setSlateValue(document.elements);
  }, [document.elements, validEditor]);

  useEffect(() => {
    validEditor.readonly = false;
    return () => {
      validEditor.selection = null;
      LocalStorage.removeItem(RECENT_COPY_CONTENT);
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

  useEffect(() => {
    if (scrollRef) {
      scrollRef.current.id = 'sdoc-scroll-container';
    }
  }, [scrollRef]);

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
    // After the content is updated, update the search content
    setTimeout(() => {
      eventBus.dispatch(INTERNAL_EVENT.UPDATE_SEARCH_REPLACE_HIGHLIGHT, value);
    }, 0);
    setSlateValue(value);
  };

  if (isReloading) {
    return (
      <div className="h-100 w-100 d-flex align-items-center justify-content-center">
        <FileLoading />
      </div>
    );
  }

  if (isMobile || isWikiReadOnly) {
    return (
      <EditorContainer editor={validEditor} readonly={true}>
        <ColorProvider>
          <div className='sdoc-content-wrapper'>
            <ScrollContext.Provider value={{ scrollRef }}>
              <div className='sdoc-editor-content readonly'>
                <ReadOnlyArticle editor={validEditor} slateValue={slateValue} showComment={false} />
              </div>
              {(!isMobile && isWikiReadOnly) && <WikiOutline doc={slateValue} />}
            </ScrollContext.Provider>
          </div>
        </ColorProvider>
      </EditorContainer>
    );
  }

  return (
    <>
      <EditorContainer editor={validEditor}>
        <ColorProvider>
          <div className='sdoc-content-wrapper'>
            <ScrollContext.Provider value={{ scrollRef }}>
              <div className={classNames('sdoc-editor-content', { 'readonly': isWikiReadOnly })}>
                <EditableArticle editor={validEditor} slateValue={slateValue} updateSlateValue={onValueChange} showComment={showComment} />
              </div>
              <WikiOutline doc={slateValue} />
            </ScrollContext.Provider>
          </div>
        </ColorProvider>
      </EditorContainer>
      <InsertElementDialog editor={validEditor} />
    </>
  );
});

WikiEditor.propTypes = {
  document: PropTypes.object.isRequired,
  docUuid: PropTypes.string,
  editor: PropTypes.object,
  isWikiReadOnly: PropTypes.bool,
};

export default WikiEditor;
