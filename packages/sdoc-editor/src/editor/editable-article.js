import React, { useCallback, useMemo, Fragment, useEffect } from 'react';
import { Editor, Node, Range, Transforms } from '@seafile/slate';
import { Editable, ReactEditor, Slate } from '@seafile/slate-react';
import PropTypes from 'prop-types';
import scrollIntoView from 'scroll-into-view-if-needed';
import CommentWrapper from '../comment';
import { INTERNAL_EVENT } from '../constants';
import { useCursors } from '../cursor/use-cursors';
import { usePipDecorate } from '../decorates';
import { renderLeaf, renderElement, ContextToolbar, SideToolbar } from '../extension';
import { IMAGE, IMAGE_BLOCK, CODE_LINE } from '../extension/constants';
import { getAboveBlockNode, getNextNode, getPrevNode, isSelectionAtBlockEnd, isSelectionAtBlockStart, getCurrentNode, isCurrentLineEmpty, isCurrentLineHasText } from '../extension/core';
import { isPreventResetTableSelectedRange } from '../extension/plugins/table/helpers';
import { SetNodeToDecorations } from '../highlight';
import useForceUpdate from '../hooks/use-force-update';
import { useScrollContext } from '../hooks/use-scroll-context';
import { ArticleContainer } from '../layout';
import { isMobile } from '../utils/common-utils';
import { getCursorPosition, getDomHeight, getDomMarginTop } from '../utils/dom-utils';
import EventBus from '../utils/event-bus';
import EventProxy from '../utils/event-handler';

const EditableArticle = ({
  showComment = true,
  editor,
  slateValue,
  updateSlateValue
}) => {
  const { cursors } = useCursors(editor);
  const decorate = usePipDecorate(editor);
  const forceUpdate = useForceUpdate();

  // init eventHandler
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const eventProxy = useMemo(() => new EventProxy(editor), []);

  const onMouseDown = useCallback((event) => {
    if (event.button === 0) {
      const isPreventReset = isPreventResetTableSelectedRange(event);
      if (!isPreventReset) {
        editor.reSetTableSelectedRange();
        const eventBus = EventBus.getInstance();
        eventBus.dispatch(INTERNAL_EVENT.CANCEL_TABLE_SELECT_RANGE);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollRef = useScrollContext();

  const onReloadComment = () => {
    forceUpdate();
  };

  useEffect(() => {
    const eventBus = EventBus.getInstance();
    const unsubscribeReloadComment = eventBus.subscribe(INTERNAL_EVENT.RELOAD_COMMENT, onReloadComment);
    return () => {
      unsubscribeReloadComment();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onKeyDown = useCallback((event) => {

    const { scrollTop, clientHeight } = scrollRef.current;

    eventProxy.onKeyDown(event);

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      Transforms.move(editor, { unit: 'offset', reverse: true });
      if (!isSelectionAtBlockStart(editor)) return;
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      if (scrollTop === 0) return;
      let prevNode = getPrevNode(editor);

      if (!prevNode) return;
      const domNode = ReactEditor.toDOMNode(editor, prevNode[0]);
      const domHeight = getDomHeight(domNode);

      const isScrollUp = true;
      const { y } = getCursorPosition(isScrollUp);
      if (y >= domHeight) return;
      scrollRef.current.scroll(0, Math.max(0, scrollTop - domHeight));
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      Transforms.move(editor, { unit: 'offset' });
      if (!isSelectionAtBlockEnd(editor)) return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      let nextNode = getNextNode(editor);
      if (!nextNode) return;
      const domNode = ReactEditor.toDOMNode(editor, nextNode[0]);
      const domHeight = getDomHeight(domNode);
      const isScrollUp = false;
      const { y } = getCursorPosition(isScrollUp);
      if ((clientHeight - y) >= domHeight) return;
      scrollRef.current.scroll(0, Math.max(0, scrollTop + domHeight));
      return;
    }

    if (event.key === 'Backspace') {
      const [currentNode] = getCurrentNode(editor);
      let prevNode = null;
      let prevPath = null;
      if (getPrevNode(editor)) {
        [prevNode, prevPath] = getPrevNode(editor);
      }
      // If the cursor is collapsed at the beginning, and the current line is not empty, is not a CODE_LINE, and the previous line is a CODE_LINE.
      const isCursorCollapsed = Range.isCollapsed(editor.selection);
      if (isCursorCollapsed && prevNode && isSelectionAtBlockStart(editor) && !isCurrentLineEmpty(editor) && prevNode.type === CODE_LINE && currentNode.type !== CODE_LINE) {
        if (!isCurrentLineHasText(currentNode)) {
          const prevNodeText = Node.string(prevNode);
          Transforms.removeNodes(editor, { at: prevPath });
          Transforms.insertText(editor, prevNodeText);
          event.preventDefault();
        } else {
          const path = prevPath;
          path[path.length] = 0;
          const end = prevNode.children[0].text.length;
          const range = { anchor: { path, offset: end }, focus: { path, offset: end } };
          Transforms.select(editor, range);
          event.preventDefault();
        }
      }


      const { y } = getCursorPosition();

      // above viewport
      if (y < 0) {
        const newY = Math.abs(y);
        if (isSelectionAtBlockStart(editor)) {
          const prevNode = getPrevNode(editor);
          if (!prevNode) return;
          const domNode = ReactEditor.toDOMNode(editor, prevNode[0]);
          const domHeight = getDomHeight(domNode);
          const node = getAboveBlockNode(editor);
          if (!node) return;
          const currentDomNode = ReactEditor.toDOMNode(editor, node[0]);
          const marginTop = getDomMarginTop(currentDomNode);
          scrollRef.current.scroll(0, Math.max(0, scrollTop - (newY + domHeight + marginTop)));
        } else {
          scrollRef.current.scroll(0, Math.max(0, scrollTop - newY));
        }
        return;
      }

      // insider viewport
      if (y >= 0 && y <= clientHeight) {
        if (isSelectionAtBlockStart(editor)) {
          const prevNode = getPrevNode(editor);
          if (!prevNode) return;
          const domNode = ReactEditor.toDOMNode(editor, prevNode[0]);
          const domHeight = getDomHeight(domNode);
          if (y >= domHeight) return;
          // Scroll up the height of the previous block
          scrollRef.current.scroll(0, Math.max(0, scrollTop - domHeight));
          return;
        }
      }

      // below viewport
      if (y > clientHeight) {
        if (isSelectionAtBlockStart(editor)) {
          // y: text top border
          scrollRef.current.scroll(0, Math.max(0, scrollTop + (y - clientHeight)));
        } else {
          const marginBottom = 11.2;
          const { y: newY } = getCursorPosition(false);
          const rectBottom = newY + marginBottom; // text bottom border
          scrollRef.current.scroll(0, Math.max(0, scrollTop + (rectBottom - clientHeight)));
        }
        return;
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollRef]);

  const onCompositionEnd = useCallback((event) => {
    if (event.data && isMobile) {
      editor.insertText(event.data);
    }
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

  return (
    <Slate editor={editor} value={slateValue} onChange={updateSlateValue}>
      <ArticleContainer editor={editor}>
        <Fragment>
          {!isMobile && <ContextToolbar />}
          <SetNodeToDecorations />
          <Editable
            scrollSelectionIntoView={handleScrollIntoView}
            cursors={cursors}
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            onKeyDown={onKeyDown}
            onMouseDown={onMouseDown}
            decorate={decorate}
            onCut={eventProxy.onCut}
            onCopy={eventProxy.onCopy}
            onCompositionStart={eventProxy.onCompositionStart}
            onCompositionEnd={onCompositionEnd}
            id='sdoc-editor'
            aria-label='textbox'
          />
        </Fragment>
        <SideToolbar />
        {showComment && (<CommentWrapper editor={editor} type="editor" />)}
      </ArticleContainer>
    </Slate>
  );
};

EditableArticle.propTypes = {
  showComment: PropTypes.bool,
  editor: PropTypes.object,
  slateValue: PropTypes.array,
  updateSlateValue: PropTypes.func,
};

export default EditableArticle;
