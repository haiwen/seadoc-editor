import React, { useCallback, useMemo } from 'react';
import { Editor, Node } from '@seafile/slate';
import { Editable, ReactEditor, Slate } from '@seafile/slate-react';
import isHotkey from 'is-hotkey';
import PropTypes from 'prop-types';
import scrollIntoView from 'scroll-into-view-if-needed';
import { INTERNAL_EVENT } from '../constants';
import { useCursors } from '../cursor/use-cursors';
import { usePipDecorate } from '../decorates';
import { renderLeaf } from '../extension';
import { IMAGE, IMAGE_BLOCK } from '../extension/constants';
import RenderCommentEditorCustomRenderElement from '../extension/render/render-comment-editor-element';
import EventBus from '../utils/event-bus';
import EventProxy from '../utils/event-handler';

const CommentArticle = ({
  editor,
  slateValue,
  updateSlateValue,
  type,
}) => {
  const { cursors } = useCursors(editor);
  const decorate = usePipDecorate(editor);
  // init eventHandler
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const eventProxy = useMemo(() => new EventProxy(editor), []);

  const onMouseDown = useCallback((event) => {
    if (event.button === 0) {
      // Compatible with the editor which unload table plugin
      editor.reSetTableSelectedRange && editor.reSetTableSelectedRange();
      const eventBus = EventBus.getInstance();
      eventBus.dispatch(INTERNAL_EVENT.CANCEL_TABLE_SELECT_RANGE);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScrollIntoView = useCallback((editor, domRange) => {
    try {
      const { selection } = editor;
      // Do not scroll into view, when focus on image
      const [imageNodeEntry] = Editor.nodes(editor, {
        match: n => [IMAGE, IMAGE_BLOCK].includes(n.type),
        at: selection
      });
      if (imageNodeEntry) return;
      const focusedNode = Node.get(editor, selection.focus.path);
      const domNode = ReactEditor.toDOMNode(editor, focusedNode);
      if (!domNode) return;
      scrollIntoView(domNode, { 'scrollMode': 'if-needed' });
    } catch (error) {
      //
    }
  }, []);

  const onKeyDown = useCallback((event) => {
    if (isHotkey('enter', event)) {
      event.preventDefault();
      const eventBus = EventBus.getInstance();
      eventBus.dispatch(INTERNAL_EVENT.COMMENT_EDITOR_POST_COMMENT, event);
      return;
    }

    if (isHotkey('shift+enter', event)) {
      event.preventDefault();
      Editor.insertBreak(editor);
      return;
    }

    eventProxy.onKeyDown(event);

  }, [eventProxy, editor]);

  return (
    <Slate editor={editor} value={slateValue} onChange={updateSlateValue}>
      <Editable
        id='sdoc-editor'
        scrollSelectionIntoView={handleScrollIntoView}
        cursors={cursors}
        renderElement={(props) => RenderCommentEditorCustomRenderElement({ ...props, commentType: type })}
        renderLeaf={renderLeaf}
        onMouseDown={onMouseDown}
        decorate={decorate}
        onCut={eventProxy.onCut}
        onCopy={eventProxy.onCopy}
        onCompositionStart={eventProxy.onCompositionStart}
        onCompositionUpdate={eventProxy.onCompositionUpdate}
        onCompositionEnd={eventProxy.onCompositionEnd}
        onKeyDown={onKeyDown}
        onBeforeInput={eventProxy.onBeforeInput}
      />
    </Slate>
  );
};

CommentArticle.propTypes = {
  editor: PropTypes.object,
  slateValue: PropTypes.array,
  updateSlateValue: PropTypes.func,
  type: PropTypes.oneOf(['comment', 'reply'])
};

export default CommentArticle;
