import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Editor, Path, Transforms, Node } from '@seafile/slate';
import { ReactEditor, useSlateStatic } from '@seafile/slate-react';
import classnames from 'classnames';
import { INTERNAL_EVENT, WIKI_EDITOR } from '../../../constants';
import { useScrollContext } from '../../../hooks/use-scroll-context';
import { isMobile } from '../../../utils/common-utils';
import EventBus from '../../../utils/event-bus';
import { CODE_BLOCK, TABLE, BLOCKQUOTE, CHECK_LIST_ITEM, CALL_OUT, TABLE_DRAG_KEY, LIST_ITEM, MULTI_COLUMN, ORDERED_LIST, UNORDERED_LIST, PARAGRAPH, IMAGE_BLOCK, VIDEO, WHITEBOARD, FORMULA, COLUMN } from '../../constants';
import { findPath, focusEditor } from '../../core';
import { getCalloutEntry } from '../../plugins/callout/helper';
import { insertImageFiles } from '../../plugins/image/helpers';
import { addLastColumnInMultiColumn, addMiddleColumnInMultiColumn, updateColumnWidthOnDeletion } from '../../plugins/multi-column/helper';
import { DRAG_SDOC_EDITOR_ELEMENT } from './event';
import { setSelection, getNodeEntry, isBlockquote, isList, onWrapListItem, getTopValue, createDragPreviewContainer, deleteNodesFromBack, isListItem, onWrapMultiListItem, onWrapMultiListItemToNonListTypeTarget, isInMultiColumnNode, onWrapListItemFromMultiColumn, isMultiColumn, clearDragClass, wrapIntoMultiColumn } from './helpers';
import SideMenu from './side-menu';

import './index.css';

// Keep the visual drop indicator narrow, but make the invisible hit area easier to reach.
const HORIZONTAL_DROP_ZONE_WIDTH = 72;

const getSafeNodeEntry = (editor, element) => {
  try {
    return getNodeEntry(editor, element);
  } catch (error) {
    return [];
  }
};

const SideToolbar = () => {

  const editor = useSlateStatic();
  const scrollRef = useScrollContext();
  const menuRef = useRef(null);
  const sideToolbarContainerRef = useRef(null);
  const sourceElementRef = useRef(null);
  const isDraggingEditorElementRef = useRef(false);

  const getEditorContainer = useCallback(() => (
    sideToolbarContainerRef.current?.closest('.sdoc-article-container')
  ), []);

  const isEventInCurrentEditor = useCallback((event) => {
    const editorContainer = getEditorContainer();
    const eventTarget = event.target || event.currentTarget;
    return Boolean(editorContainer && eventTarget && editorContainer.contains(eventTarget));
  }, [getEditorContainer]);

  const isEditorDrag = useCallback(() => (
    isDraggingEditorElementRef.current
  ), []);
  const [slateNode, setSlateNode] = useState(null);
  const [sidePosition, setSidePosition] = useState({});
  const [isNodeEmpty, setNodeEmpty] = useState(false);
  const [isShowSideMenu, setShowSideMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({});
  const [isEnterMoreVertical, setIsEnterMoreVertical] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const sideMenuRef = useRef(null);
  const draggedSourcePaths = useRef(null);
  const selectedNodesRef = useRef(null);
  const showSelectedNodesRef = useRef(null);
  const draggedPreviewContainer = useRef(null);
  const activeDragElRef = useRef(null);
  const pendingSideDropRef = useRef(null);

  const onReset = useCallback(() => {
    setShowSideMenu(false);
    setMenuPosition({});
    setSlateNode(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = useCallback((e) => {
    if (!isShowSideMenu || !menuRef.current) return;
    const isClickSideTool = menuRef.current.contains(e.target);

    const sideAskAI = document.querySelector('#side-toolbar-ai');
    if (sideAskAI && sideAskAI.contains(e.target)) {
      setTimeout(() => {
        setShowSideMenu(!isShowSideMenu);
      }, 0);
      return;
    }

    if (isClickSideTool || !sideMenuRef.current) return;
    const { sideMenuDom } = sideMenuRef.current;
    if (!sideMenuDom) return;
    const isClickContainer = sideMenuDom.contains(e.target);
    if (!isClickContainer) onReset();
  }, [isShowSideMenu, onReset]);

  useEffect(() => {
    let observerRefValue;
    if (isShowSideMenu) {
      scrollRef.current.addEventListener('scroll', onReset);
      document.addEventListener('click', handleClick);
      observerRefValue = scrollRef.current;
    } else {
      scrollRef.current.removeEventListener('scroll', onReset);
      document.removeEventListener('click', handleClick);
      observerRefValue = null;
    }
    return () => {
      if (observerRefValue) {
        observerRefValue.removeEventListener('scroll', onReset);
        focusEditor(editor);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShowSideMenu]);

  useEffect(() => {
    const handleMouseEnter = (e) => {
      if (isShowSideMenu) return;
      let dom = e.target;
      while (dom?.dataset?.root !== 'true') {
        if (dom.className === 'column') {
          return;
        }
        if (!dom.parentNode) return;
        dom = dom.parentNode;
      }
      const node = ReactEditor.toSlateNode(editor, dom);
      const isEmpty = Editor.isEmpty(editor, node);

      const containerDom = scrollRef.current;
      const topValue = getTopValue(editor, dom, containerDom, node);
      if (topValue !== sidePosition.top) setIsMoving(true);

      let left = 20;
      if (editor.editorType === WIKI_EDITOR) {
        const { left: editorLeft } = document.querySelector('#sdoc-editor').getBoundingClientRect();
        const { left: containerLeft } = document.querySelector('.sdoc-editor-container').getBoundingClientRect();
        left = editorLeft - containerLeft - 40;
      }

      const path = findPath(editor, node);
      // Add side-tool-bar for paragraphs in multi_column
      if (path.length > 2 && isInMultiColumnNode(editor, node)) {
        let domLeft;
        domLeft = document.querySelector(`[data-id="${dom.dataset.id}"]`) && document.querySelector(`[data-id="${dom.dataset.id}"]`).getBoundingClientRect().left;
        const parentNode = Editor.node(editor, path.slice(0, 3))[0];
        if ([ORDERED_LIST, UNORDERED_LIST, BLOCKQUOTE].includes(parentNode.type)) {
          domLeft = document.querySelector(`[data-id="${parentNode.id}"]`) && document.querySelector(`[data-id="${parentNode.id}"]`).getBoundingClientRect().left;
        }

        if ([IMAGE_BLOCK].includes(node.type)) {
          const imageWrapperDomId = dom.querySelectorAll('span')[1]?.getAttribute('data-id');
          domLeft = document.querySelector(`[data-id="${imageWrapperDomId}"]`) && document.querySelector(`[data-id="${imageWrapperDomId}"]`).getBoundingClientRect().left;
        }

        const { left: containerLeft } = document.querySelector('.sdoc-editor__article').getBoundingClientRect();
        left = domLeft - containerLeft - 41;
      }

      setTimeout(() => {
        // wait animation
        setSidePosition({ top: topValue, left: left });
      }, 150);
      setSlateNode(node);
      setNodeEmpty(isEmpty);
    };

    const eventBus = EventBus.getInstance();
    const unSubscribeMouseEnter = eventBus.subscribe(INTERNAL_EVENT.ON_MOUSE_ENTER_BLOCK, handleMouseEnter);
    return unSubscribeMouseEnter;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, isShowSideMenu, scrollRef, sidePosition.top]);

  const onMouseDown = useCallback((e) => {
    e.stopPropagation();
    if (!editor.selection) setSelection(editor, slateNode);
    const domSelection = window.getSelection();
    if (domSelection.type !== 'Range' || !editor.selection || Path.equals(editor.selection.focus.path, editor.selection.anchor.path)) {
      draggedPreviewContainer.current = null;
      selectedNodesRef.current = null;
      showSelectedNodesRef.current = null;
      draggedSourcePaths.current = null;
      return;
    }
    // Bond when selecting more than more list_items nodes
    const dom = e.target;
    const domTop = dom.getBoundingClientRect().top;
    if (isListItem(editor)) {
      const { anchor, focus } = editor.selection;
      // Return if selecting only one line list_item
      if (Path.equals(anchor.path.slice(0, -1), focus.path.slice(0, -1))) return;

      const startPath = (Path.compare(anchor.path, focus.path) < 0 ? anchor.path : focus.path).slice(0, -2);
      // Remove unselected parent level list node when selecting child level list_item nodes
      const selectedDraggedPreviewNodes = Array.from(Editor.nodes(editor, {
        match: (node) => node.type === LIST_ITEM,
        at: editor.selection,
      })).filter(([, path]) => !Path.isAncestor(path, startPath));

      // Remove their all children level list_items when selecting parent level list nodes
      let selectedNodes = [];
      let lastAncestorPath = null;
      for (const [node, path] of selectedDraggedPreviewNodes) {
        if (lastAncestorPath && Path.isAncestor(lastAncestorPath, path)) {
          continue;
        }
        selectedNodes.push([node, path]);
        lastAncestorPath = path;
      }

      const topValues = selectedDraggedPreviewNodes.map(([node]) => {
        const domNode = ReactEditor.toDOMNode(editor, node);
        const rect = domNode.getBoundingClientRect();
        return rect.top;
      });

      const rangeStart = Math.min(...topValues) - 15;
      const rangeEnd = Math.max(...topValues) + 15;
      // Active only when the sideTool bar references to the selectedNodes
      if (selectedDraggedPreviewNodes.length > 1 && rangeStart < domTop && domTop < rangeEnd) {
        showSelectedNodesRef.current = selectedDraggedPreviewNodes;
        selectedNodesRef.current = selectedNodes;
      } else {
        draggedPreviewContainer.current = null;
        selectedNodesRef.current = null;
        showSelectedNodesRef.current = null;
        draggedSourcePaths.current = null;
      }
    }
  }, [editor, slateNode]);

  const onShowSideMenuToggle = useCallback(() => {
    setSelection(editor, slateNode);
    const { top, left } = menuRef.current.getBoundingClientRect();
    setShowSideMenu(!isShowSideMenu);
    setMenuPosition({ top, left });
  }, [editor, isShowSideMenu, slateNode]);

  const dragStart = useCallback((event) => {
    event.stopPropagation();
    sourceElementRef.current = null;
    isDraggingEditorElementRef.current = true;
    event.dataTransfer.effectAllowed = 'move';
    // Create the preview container when dragging more than one listNodes
    const noDrag = Path.equals(editor.selection.focus.path, editor.selection.anchor.path);
    if (showSelectedNodesRef.current && showSelectedNodesRef.current.length > 1 && !noDrag ) {

      if (!draggedPreviewContainer.current) {
        draggedPreviewContainer.current = createDragPreviewContainer();
      }

      draggedPreviewContainer.current.innerHTML = '';
      showSelectedNodesRef.current.forEach(([node, path]) => {
        const nodeElement = ReactEditor.toDOMNode(editor, node.children[0]);
        const clonedNode = nodeElement.cloneNode(true);
        draggedPreviewContainer.current.appendChild(clonedNode);
      });

      event.dataTransfer.setDragImage(draggedPreviewContainer.current, 0, 0);
      event.dataTransfer.setData(DRAG_SDOC_EDITOR_ELEMENT, true);
      draggedSourcePaths.current = showSelectedNodesRef.current.map(([, path]) => path);

      setTimeout(() => {
        if (draggedPreviewContainer.current) {
          draggedPreviewContainer.current.innerHTML = '';
          draggedPreviewContainer.current = null;
        }
      }, 0);
      return;
    }

    sourceElementRef.current = ReactEditor.toDOMNode(editor, slateNode);
    const path = ReactEditor.findPath(editor, slateNode);

    // Dragging the first element within the blockquote drags the entire blockquote by default.
    if (isBlockquote(editor, [path[0]]) && path.slice(1).every((p) => p === 0)) {
      const nodeEntry = Editor.node(editor, [path[0]]);
      sourceElementRef.current = ReactEditor.toDOMNode(editor, nodeEntry[0]);
    }

    event.dataTransfer.setDragImage(sourceElementRef.current, 0, 0);
    event.dataTransfer.setData(DRAG_SDOC_EDITOR_ELEMENT, true);
  }, [editor, slateNode]);

  const dragOver = useCallback((event) => {
    if (!isEventInCurrentEditor(event)) return;

    if (!isEditorDrag()) return;

    const overElement = event.currentTarget;
    if (!overElement.classList.contains('sdoc-dragging')) {
      overElement.classList.add('sdoc-dragging');
    }
  }, [isEditorDrag, isEventInCurrentEditor]);

  const dragLeave = useCallback((event) => {
    if (!isEventInCurrentEditor(event)) return;

    const leaveElement = event.currentTarget;
    leaveElement.classList.remove('sdoc-dragging');
  }, [isEventInCurrentEditor]);

  const drop = useCallback((event) => {
    if (!isEventInCurrentEditor(event)) return;
    const targetElement = event.currentTarget;
    targetElement.classList.remove('sdoc-dragging');
    const dragTypes = event.dataTransfer?.types || [];
    if (!isEditorDrag() && dragTypes[0] !== 'Files') return;

    // Prevent dragging table data to the editor
    if (dragTypes.includes(TABLE_DRAG_KEY)) return;

    // Drag local image files to sdoc
    if (event.dataTransfer.files.length > 0) {
      const [, targetPath] = getSafeNodeEntry(editor, targetElement);
      insertImageFiles(event.dataTransfer.files, editor, targetPath);
      return;
    }

    const [targetNode, targetPath] = getSafeNodeEntry(editor, targetElement);
    if (!targetNode || !targetPath) return;

    // Drag multiple list_items nodes
    if (draggedSourcePaths.current) {
      try {
        // Return if dragging items into themselves
        if (draggedSourcePaths.current.some(arr => JSON.stringify(arr) === JSON.stringify(targetPath))) return;

        const sortedPaths = [...draggedSourcePaths.current].sort(Path.compare);

        let currentTargetPath = Path.next(targetPath);
        const currentNode = Node.get(editor, targetPath);
        const parentNode = Node.parent(editor, targetPath);
        const topNode = Node.get(editor, [targetPath[0]]);

        // Drag into list nods in blockquote, callout or multi_column block node
        if ((topNode.type === CALL_OUT && parentNode.type === LIST_ITEM) || (topNode.type === MULTI_COLUMN && parentNode.type === LIST_ITEM)) {
          currentTargetPath = Path.next(targetPath.slice(0, -1));
          onWrapMultiListItem(editor, currentTargetPath, selectedNodesRef.current);
          deleteNodesFromBack(editor, sortedPaths);
          return;
        }
        if (topNode.type === BLOCKQUOTE && currentNode.type === LIST_ITEM) {
          onWrapMultiListItem(editor, currentTargetPath, selectedNodesRef.current);
          deleteNodesFromBack(editor, sortedPaths);
          return;
        }

        // Drag into other element nodes rather than blockquote, callout or multi_column block node
        if (Path.isAfter(targetPath, sortedPaths[0])) {
          if (currentNode.type === LIST_ITEM) {
            onWrapMultiListItem(editor, currentTargetPath, selectedNodesRef.current);
          } else {
            const listType = Editor.node(editor, [sortedPaths[0][0]])[0].type;
            onWrapMultiListItemToNonListTypeTarget(editor, targetPath, selectedNodesRef.current, listType);
          }
          deleteNodesFromBack(editor, sortedPaths);
          return;
        }

        if (Path.isBefore(targetPath, sortedPaths[0])) {
          const listType = Editor.node(editor, [sortedPaths[0][0]])[0].type;
          deleteNodesFromBack(editor, sortedPaths);
          if (currentNode.type === LIST_ITEM) {
            onWrapMultiListItem(editor, currentTargetPath, selectedNodesRef.current);
          } else {
            onWrapMultiListItemToNonListTypeTarget(editor, targetPath, selectedNodesRef.current, listType);
          }
          return;
        }
      } finally {
        selectedNodesRef.current = null;
        draggedSourcePaths.current = null;
        showSelectedNodesRef.current = null;
        draggedPreviewContainer.current = null;
        event.dataTransfer.clearData();
      }
    }

    const [sourceNode, sourcePath] = getSafeNodeEntry(editor, sourceElementRef.current);
    if (!sourceNode || !sourcePath) return;

    // Dragging into a quoteBlock is not supported
    if ([CODE_BLOCK, TABLE, BLOCKQUOTE].includes(sourceNode.type) && isBlockquote(editor, [targetPath[0]]) && targetPath.length > 1) {
      return;
    }

    // Dragging into a list is not supported
    if ([CALL_OUT, TABLE, BLOCKQUOTE, CHECK_LIST_ITEM].includes(sourceNode.type) && isList(editor, targetPath)) {
      return;
    }

    // Dragging into callout is not supported
    if ([CALL_OUT, CODE_BLOCK, TABLE].includes(sourceNode.type) && getCalloutEntry(editor, targetPath)) {
      return;
    }

    // Dragging multi_column's child into multi_column is not supported
    const isInMultiColumn = isInMultiColumnNode(editor, sourceNode);
    if (isInMultiColumn && isMultiColumn(editor, [targetPath[0]])) {
      return;
    }

    // Drag out codeblock from list into non-list nodes
    if (isList(editor, sourcePath) && sourceNode.type === CODE_BLOCK && !isList(editor, targetPath)) {
      const codeblockPath = findPath(editor, sourceNode);
      const toPath = Path.next(targetPath);
      Transforms.moveNodes(editor, { at: codeblockPath, to: toPath });
      return;
    }

    // Drag list
    if (isList(editor, sourcePath) && sourceNode !== CODE_BLOCK) {
      // ordinary list items
      if (!isBlockquote(editor, [sourcePath[0]])) {
        // Drag ordinary list items to places other than list and quoteBlock
        if (!isList(editor, targetPath) && !isBlockquote(editor, [targetPath[0]])) {
          onWrapListItem(editor, targetPath, sourcePath);
          return;
        }

        // Drag ordinary list items into the quoteBlock
        if (isBlockquote(editor, [targetPath[0]])) {
          // Drag and drop ordinary list items onto the list within the quoteBlock
          if (isList(editor, targetPath)) {
            Transforms.moveNodes(editor, { at: sourcePath, to: Path.next(targetPath) });
            return;
          }
          onWrapListItem(editor, targetPath, sourcePath);
          return;
        }
      }

      // quoteBlock list items
      if (isBlockquote(editor, [sourcePath[0]])) {
        // Drag quoteBlock list items to places other than list and quoteBlock
        if (!isList(editor, targetPath) && !isBlockquote(editor, [targetPath[0]])) {
          onWrapListItem(editor, targetPath, sourcePath);
          return;
        }

        // Drag quoteBlock list items into the quoteBlock
        if (isBlockquote(editor, [targetPath[0]])) {
          // Drag and drop ordinary list items onto the list within the quoteBlock
          if (isList(editor, targetPath)) {
            Transforms.moveNodes(editor, { at: sourcePath, to: Path.next(targetPath) });
            return;
          }
          onWrapListItem(editor, targetPath, sourcePath);
          return;
        }
      }
    }

    // Dragging element from multi_column to other nodes
    const currentSourceNode = Editor.node(editor, sourcePath.slice(0, 3))[0];
    if (isInMultiColumn && sourceNode.type === PARAGRAPH) {
      // Dragging list
      if ([ORDERED_LIST, UNORDERED_LIST].includes(currentSourceNode.type)) {
        // Drag ordinary list items to places other than list and quoteBlock
        if (!isList(editor, targetPath) && !isBlockquote(editor, [targetPath[0]])) {
          onWrapListItemFromMultiColumn(editor, targetPath, sourcePath);
        }

        // Drag ordinary list items to list
        if (isList(editor, targetPath)) {
          Transforms.moveNodes(editor, { at: sourcePath.slice(0, 4), to: Path.next(targetPath) });
        }

        // Drag ordinary list items into the quoteBlock
        if (isBlockquote(editor, [targetPath[0]])) {
          // Drag and drop ordinary list items onto the list within the quoteBlock
          if (isList(editor, targetPath)) {
            Transforms.moveNodes(editor, { at: sourcePath.slice(0, 4), to: Path.next(targetPath) });
          } else {
            onWrapListItemFromMultiColumn(editor, targetPath, sourcePath);
          }
        }
      }

      // Dragging quoteBlock's children element  from multi_column is not supported
      if (currentSourceNode.type === BLOCKQUOTE) {
        return;
      }
    }

    // Handling drag situations including non-multi_column or non-list item dragged from multiColumn
    if (!isInMultiColumn || (isInMultiColumn && ![ORDERED_LIST, UNORDERED_LIST].includes(currentSourceNode.type))) {
      // Special situation: drag codeblock into list nodes
      if (isList(editor, targetPath) && [CODE_BLOCK].includes(sourceNode.type)) {
        const childrenPath = findPath(editor, targetNode);
        const codeblockPath = findPath(editor, sourceNode);
        const toPath = Path.next(childrenPath);
        Transforms.moveNodes(editor, { at: codeblockPath, to: toPath });
        return;
      }

      // Drag backward
      if (Path.isAfter(targetPath, sourcePath)) {
        let toPath = targetPath.slice(0);

        // Drag elements outside the quoteBlock into the quoteBlock
        if (!isBlockquote(editor, [sourcePath[0]]) && isBlockquote(editor, [targetPath[0]]) && targetPath.length > 1) {
          toPath = Path.next(targetPath);
        }

        // Drag non-codeblock into list
        if (isList(editor, targetPath) && ![CODE_BLOCK].includes(currentSourceNode.type)) {
          toPath = Path.next(targetPath);
        }
        Transforms.moveNodes(editor, { at: sourcePath, to: toPath });
      }

      // Drag forward
      if (Path.isBefore(targetPath, sourcePath)) {
        const toPath = Path.next(targetPath);
        Transforms.moveNodes(editor, { at: sourcePath, to: toPath });
      }
    }

    let selectedSourcePath = sourcePath;
    // Handling drag forward situation for multi_column update
    if (Path.isBefore(targetPath, sourcePath)) {
      const targetNode = Editor.node(editor, [targetPath[0]])[0];
      if (![ORDERED_LIST, UNORDERED_LIST].includes(targetNode.type)) {
        selectedSourcePath[0] += 1;
      }
    }

    // Dragging childNodes from multi_column
    const nodeIndex = selectedSourcePath[0];
    const highestNode = editor.children[nodeIndex];
    const [parentNode,] = Editor.parent(editor, selectedSourcePath.slice(0, 3));
    if (selectedSourcePath.length > 1 && highestNode.type === MULTI_COLUMN && !parentNode.children[0]?.type) {
      if (highestNode.children.length <= 2) {
        Transforms.removeNodes(editor, { at: selectedSourcePath.slice(0, 2) });
        Transforms.unwrapNodes(editor, { at: [selectedSourcePath[0]] });
      } else {
        const topNodesColumnAttribute = highestNode.column;
        Transforms.removeNodes(editor, { at: selectedSourcePath.slice(0, 2) });
        const isDragged = true;
        updateColumnWidthOnDeletion(editor, selectedSourcePath, topNodesColumnAttribute, 'deleteBackward', isDragged);
      }
    }

    // reset
    sourceElementRef.current = null;
  }, [editor, isEditorDrag, isEventInCurrentEditor]);

  useEffect(() => {
    const eventBus = EventBus.getInstance();
    const unSubscribeDragOver = eventBus.subscribe(INTERNAL_EVENT.ON_DRAG_OVER_BLOCK, dragOver);
    const unSubscribeDragLeave = eventBus.subscribe(INTERNAL_EVENT.ON_DRAG_LEAVE_BLOCK, dragLeave);
    const unSubscribeDrop = eventBus.subscribe(INTERNAL_EVENT.ON_DRAG_DROP_BLOCK, drop);
    return () => {
      unSubscribeDragOver();
      unSubscribeDragLeave();
      unSubscribeDrop();
    };
  }, [dragLeave, dragOver, drop]);

  const onMouseEnter = useCallback(() => {
    setIsEnterMoreVertical(true);
  }, []);

  const onMouseLeave = useCallback(() => {
    setIsEnterMoreVertical(false);
  }, []);

  const clearAllDragStyles = useCallback(() => {
    clearDragClass(activeDragElRef.current);
    activeDragElRef.current = null;
    pendingSideDropRef.current = null;
  }, []);

  const resetDragState = useCallback(() => {
    clearAllDragStyles();
    sourceElementRef.current = null;
    isDraggingEditorElementRef.current = false;
  }, [clearAllDragStyles]);

  const handleDragover = useCallback((event) => {
    if (!isEditorDrag()) return;

    const [sourceNode, sourcePath] = getSafeNodeEntry(editor, sourceElementRef.current);
    if (!sourceNode || !sourcePath) {
      clearAllDragStyles();
      return;
    }

    // Not support node type in multi column
    if ([TABLE, VIDEO, CODE_BLOCK, WHITEBOARD, FORMULA].includes(sourceNode.type)) {
      clearAllDragStyles();
      return;
    }
    // Return if source node is from multi column
    const topNode = Node.get(editor, [sourcePath[0]]);
    if ([MULTI_COLUMN].includes(topNode.type)) {
      clearAllDragStyles();
      return;
    }

    // Cursor position
    const x = event.clientX;
    const y = event.clientY;

    const editorContainer = getEditorContainer();
    if (!editorContainer) {
      clearAllDragStyles();
      return;
    }
    const eventEditorContainer = event.target?.closest?.('.sdoc-article-container');
    if (eventEditorContainer && eventEditorContainer !== editorContainer) {
      clearAllDragStyles();
      return;
    }
    const containerRect = editorContainer.getBoundingClientRect();

    // Current visible area of editor container
    const visibleTop = Math.max(containerRect.top, 0);
    const visibleBottom = Math.min(containerRect.bottom, window.innerHeight);
    let target = null;

    // Get target element where cursor is close to
    for (const el of editorContainer.querySelectorAll('[data-root="true"]')) {
      const rect = el.getBoundingClientRect();

      if (rect.bottom < visibleTop) continue;
      if (rect.top > visibleBottom) break;

      if (y > rect.top && y < rect.bottom) {
        target = { el, rect };
        break;
      }
    }

    if (!target?.el) {
      clearAllDragStyles();
      return;
    }

    const prevEl = activeDragElRef.current;
    if (prevEl && prevEl !== target.el) {
      clearDragClass(prevEl);
    }

    if (target.el === sourceElementRef.current) {
      clearAllDragStyles();
      return;
    }

    const [targetNode, targetPath] = getSafeNodeEntry(editor, target.el);

    // Not support node type in multi column
    if (!targetNode || !targetPath || [TABLE, VIDEO, CODE_BLOCK, WHITEBOARD, FORMULA].includes(targetNode.type)) {
      clearAllDragStyles();
      return;
    }
    if (targetPath.length === 0 && ![ORDERED_LIST, UNORDERED_LIST].includes(targetNode.type)) {
      clearAllDragStyles();
      return;
    }

    // Stop if target node is multi column node with four columns
    if (targetNode.type === MULTI_COLUMN && targetNode.children.length === 4) {
      clearAllDragStyles();
      return;
    }

    // Add hover style for target node multi column children.
    // Only use a fixed-width zone around each column boundary so the drop
    // direction is predictable instead of depending on an arbitrary x value.
    if (targetNode.type === MULTI_COLUMN) {
      const multiColumnEl = target.el;
      const columnEls = Array.from(multiColumnEl.querySelectorAll('.sdoc-column-container'));
      if (!columnEls.length) {
        clearAllDragStyles();
        return;
      }

      columnEls.forEach(col =>
        col.classList.remove(
          'sdoc-dragging-left',
          'sdoc-dragging',
          'sdoc-dragging-right'
        )
      );

      let activeColumn = null;
      let activeDirection = null;
      let previousRect = null;

      columnEls.forEach((colEl, index) => {
        const rect = colEl.getBoundingClientRect();
        const leftZoneStart = index === 0
          ? rect.left - HORIZONTAL_DROP_ZONE_WIDTH
          : Math.max(previousRect.right, rect.left - HORIZONTAL_DROP_ZONE_WIDTH);

        if (x >= leftZoneStart && x < rect.left) {
          activeColumn = colEl;
          activeDirection = 'left';
        }

        if (index === columnEls.length - 1
          && x > rect.right
          && x <= rect.right + HORIZONTAL_DROP_ZONE_WIDTH) {
          activeColumn = colEl;
          activeDirection = 'right';
        }

        previousRect = rect;
      });

      if (activeColumn) {
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = 'move';
        activeColumn.classList.add(`sdoc-dragging-${activeDirection}`);
        activeDragElRef.current = activeColumn;
        pendingSideDropRef.current = {
          element: activeColumn,
          direction: activeDirection,
        };
      } else {
        clearAllDragStyles();
      }
      return;
    }

    // Add hover style for target node as non-multi column children.
    // The drop zones are placed immediately outside the left and right edges
    // of the target block, keeping the center area available for normal drag.
    const isLeftDropZone = x >= target.rect.left - HORIZONTAL_DROP_ZONE_WIDTH && x < target.rect.left;
    const isRightDropZone = x > target.rect.right && x <= target.rect.right + HORIZONTAL_DROP_ZONE_WIDTH;

    if (isLeftDropZone) {
      target.el.classList.add('sdoc-dragging-left');
      target.el.classList.remove('sdoc-dragging-right');
      target.el.classList.remove('sdoc-dragging');
      activeDragElRef.current = target.el;
      pendingSideDropRef.current = {
        element: target.el,
        direction: 'left',
      };
    } else if (isRightDropZone) {
      target.el.classList.add('sdoc-dragging-right');
      target.el.classList.remove('sdoc-dragging-left');
      target.el.classList.remove('sdoc-dragging');
      activeDragElRef.current = target.el;
      pendingSideDropRef.current = {
        element: target.el,
        direction: 'right',
      };
    } else {
      clearAllDragStyles();
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'move';
  }, [clearAllDragStyles, editor, getEditorContainer, isEditorDrag]);

  const handleDragLeave = useCallback((event) => {
    const editorContainer = event.currentTarget;
    const relatedTarget = event.relatedTarget;
    const pendingDropElement = pendingSideDropRef.current?.element;

    // Preserve a pending move within this editor until drop or dragend.
    if (pendingDropElement && editorContainer.contains(pendingDropElement)) return;

    // Ignore dragleave events from descendants. Some browsers report a null
    // relatedTarget when moving between block elements, so clearing here
    // would remove the active drop zone before the drop event arrives.
    const isLeavingEditor = event.target === editorContainer
      && (!relatedTarget || !editorContainer.contains(relatedTarget));
    if (isLeavingEditor) clearAllDragStyles();
  }, [clearAllDragStyles]);

  const handleDrop = useCallback(() => {
    const pendingDrop = pendingSideDropRef.current;
    const targetEl = pendingDrop?.element || activeDragElRef.current;
    const direction = pendingDrop?.direction
      || (targetEl?.classList.contains('sdoc-dragging-left') ? 'left' : null)
      || (targetEl?.classList.contains('sdoc-dragging-right') ? 'right' : null);
    if (!targetEl || !direction) return false;

    let [targetNode, targetPath] = getSafeNodeEntry(editor, targetEl);
    let [sourceNode, sourcePath] = getSafeNodeEntry(editor, sourceElementRef.current);
    if (!targetNode || !targetPath || !sourceNode || !sourcePath) return false;

    // When source node is list child, it is equal to drag top list node
    const topSourceNode = Node.get(editor, [sourcePath[0]]);
    if ([ORDERED_LIST, UNORDERED_LIST].includes(topSourceNode.type)) {
      sourceNode = topSourceNode;
    }

    // Drop non-multi column into multi column situation
    if (COLUMN === targetNode.type) {
      const topTargetNode = Node.get(editor, [targetPath[0]]); // Top multi column Node
      // Insert source node into last of multi column
      if (direction === 'right') {
        addLastColumnInMultiColumn(editor, topTargetNode, targetPath);
        Transforms.moveNodes(editor, { at: [sourcePath[0]], to: [targetPath[0], targetPath[1] + 1, 0] });
        return true;
      }
      // Insert source node into middle of multi column
      if (direction === 'left') {
        addMiddleColumnInMultiColumn(editor, topTargetNode, targetPath);
        Transforms.moveNodes(editor, { at: [sourcePath[0]], to: [targetPath[0], targetPath[1], 0] });
        return true;
      }
      return false;
    }

    // Drop non-multi column into non-multi column situation
    // When target node is list, get real list path
    if ([ORDERED_LIST, UNORDERED_LIST].includes(targetNode.type)) {
      targetPath = ReactEditor.findPath(editor, targetNode);
    }

    if (Path.equals([sourcePath[0]], [targetPath[0]])) return true;
    let leftNode = null;
    let rightNode = null;
    if (direction === 'left') {
      leftNode = sourceNode;
      rightNode = targetNode;
    } else if (direction === 'right') {
      leftNode = targetNode;
      rightNode = sourceNode;
    } else {
      return false;
    }

    // Form multi column first and then remove source and target node
    wrapIntoMultiColumn(editor, leftNode, rightNode, targetPath);
    Transforms.removeNodes(editor, { at: Path.next([targetPath[0]]) });
    Transforms.removeNodes(editor, { at: [sourcePath[0]] });

    return true;
  }, [editor]);

  const handleDropCapture = useCallback((event) => {
    if (!isEditorDrag()) return;

    // Recheck the final position and stop the normal block drop for side hits.
    handleDragover(event);
    if (!pendingSideDropRef.current) return;

    handleDrop();
    resetDragState();
  }, [handleDragover, handleDrop, isEditorDrag, resetDragState]);

  const handleDragEnd = useCallback(() => {
    // dragend also fires when the user cancels a drag or releases outside the
    // editor. Only a confirmed drop event may mutate the Slate document.
    if (!isDraggingEditorElementRef.current) return;
    resetDragState();
  }, [resetDragState]);

  useEffect(() => {
    const editorContainer = getEditorContainer();
    if (!editorContainer) return undefined;

    // Side hit areas can extend outside the editor container. Accept them at
    // document level, while the handlers still validate this editor's drag.
    const dragEventTarget = editorContainer.ownerDocument;
    dragEventTarget.addEventListener('dragover', handleDragover, true);
    editorContainer.addEventListener('dragend', handleDragEnd, true);
    editorContainer.addEventListener('dragleave', handleDragLeave, true);
    dragEventTarget.addEventListener('drop', handleDropCapture, true);

    return () => {
      dragEventTarget.removeEventListener('dragover', handleDragover, true);
      editorContainer.removeEventListener('dragend', handleDragEnd, true);
      editorContainer.removeEventListener('dragleave', handleDragLeave, true);
      dragEventTarget.removeEventListener('drop', handleDropCapture, true);
    };
  }, [getEditorContainer, handleDragEnd, handleDragLeave, handleDragover, handleDropCapture]);

  return (
    <>
      {!isMobile && (
        <div
          onAnimationEnd={() => setIsMoving(false)}
          ref={sideToolbarContainerRef}
          className={classnames('sdoc-side-toolbar-container d-print-none', { 'fade-out': isMoving })}
          style={sidePosition}
        >
          {slateNode && (
            <div
              ref={menuRef}
              onMouseDown={onMouseDown}
              draggable={true}
              onDragStart={dragStart}
              className='sdoc-side-op-icon'
              onClick={onShowSideMenuToggle}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
            >
              <span className={classnames('sdocfont', { 'sdoc-more-vertical': !isNodeEmpty && !isEnterMoreVertical, 'sdoc-append': isNodeEmpty, 'sdoc-more-vertical-left': !isNodeEmpty && isEnterMoreVertical })} />
            </div>
          )}
          {isShowSideMenu && (
            <SideMenu
              slateNode={slateNode}
              isNodeEmpty={isNodeEmpty}
              menuPosition={menuPosition}
              onReset={onReset}
              ref={sideMenuRef}
            />
          )}
        </div>
      )}
    </>
  );
};

export default SideToolbar;
