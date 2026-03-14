import { Editor, Element, Path, Point, Range, Transforms } from '@seafile/slate';
import isHotkey from 'is-hotkey';
import { HEADER1, HEADER2, HEADER3, PARAGRAPH, TOGGLE_CONTENT, TOGGLE_HEADER, TOGGLE_TITLE_TYPES } from '../../constants';
import { generateDefaultText, generateEmptyElement, getAboveNode, getCurrentNode, isLastNode } from '../../core';
import { ensureToggleContentNotEmpty, findFirstTitleNode, getFirstTextPoint, getLevelFromType, getTitleTypeByLevel, isOnlyHasToggleContent } from './helper';

const withToggleHeader = (editor) => {
  const { insertBreak, normalizeNode, insertSoftBreak, deleteBackward, insertFragment, onHotKeyDown } = editor;
  const newEditor = editor;

  const getToggleBodyChildren = (toggleNode) => {
    const contentNode = toggleNode?.children?.[1];
    if (contentNode?.type === TOGGLE_CONTENT) {
      return contentNode.children || [];
    }
    if (Array.isArray(toggleNode?.collapsed_body)) {
      return toggleNode.collapsed_body;
    }
    return [];
  };

  newEditor.insertBreak = () => {
    const { selection } = newEditor;
    if (!selection || !Range.isCollapsed(selection)) {
      insertBreak();
      return;
    }

    const selectedEntry = Editor.above(newEditor, { at: selection, match: n => n.type === TOGGLE_HEADER, mode: 'lowest', });
    const selectedNode = selectedEntry ? selectedEntry[0] : null;
    if (!selectedNode || selectedNode?.type !== TOGGLE_HEADER) {
      insertBreak();
      return;
    }

    const titleEntry = Editor.above(newEditor, {
      at: selection,
      match: n => Element.isElement(n) && TOGGLE_TITLE_TYPES.includes(n.type),
      mode: 'lowest',
    });

    if (!titleEntry) {
      insertBreak();
      return;
    }

    const [, titlePath] = titleEntry;
    const toggleEntry = Editor.above(newEditor, {
      at: titlePath,
      match: n => n.type === TOGGLE_HEADER,
      mode: 'lowest',
    });

    const [toggleNode, togglePath] = toggleEntry;
    const contentPath = [...togglePath, 1];
    const bodyChildren = getToggleBodyChildren(toggleNode);

    const cursorPoint = selection.anchor;
    // when toggle header is collapsed
    if (toggleNode.collapsed) {
      const titleStartPoint = Editor.start(newEditor, titlePath);
      const titleEndPoint = Editor.end(newEditor, titlePath);
      const isAtTitleStart = Point.equals(cursorPoint, titleStartPoint);
      const isAtTitleEnd = Editor.isEnd(newEditor, cursorPoint, titlePath);

      Editor.withoutNormalizing(newEditor, () => {
        if (isAtTitleStart) {
          const newParagraph = generateEmptyElement(PARAGRAPH);
          Transforms.insertNodes(newEditor, newParagraph, { at: togglePath });
          return;
        }


        let titleNode = [];
        if (!isAtTitleEnd) {
          const afterRange = {
            anchor: cursorPoint,
            focus: titleEndPoint,
          };

          const afterFragment = Editor.fragment(newEditor, afterRange);
          titleNode = findFirstTitleNode(afterFragment);
          Transforms.delete(newEditor, { at: afterRange });
        }

        const newParagraph = generateEmptyElement(PARAGRAPH);
        newParagraph.children = titleNode?.children?.length ? titleNode.children : [generateDefaultText('')];

        const insertPath = Path.next(togglePath);
        Transforms.insertNodes(newEditor, newParagraph, { at: insertPath });
        Transforms.select(newEditor, Editor.start(newEditor, insertPath));
      });

      return;
    }


    const titleEndPoint = Editor.end(newEditor, titlePath);
    const isAtTitleEnd = Editor.isEnd(newEditor, cursorPoint, titlePath);
    const afterRange = { anchor: cursorPoint, focus: titleEndPoint };
    const afterFragment = isAtTitleEnd ? [] : Editor.fragment(newEditor, afterRange);
    const afterChildren = afterFragment[0]?.children || [];

    // when toggle header is listed all
    Editor.withoutNormalizing(newEditor, () => {
      // The afterText is the text content after the cursor in the toggle header
      let afterText = '';
      if (!isAtTitleEnd) {
        afterText = Editor.string(newEditor, {
          anchor: cursorPoint,
          focus: titleEndPoint,
        });
        Transforms.delete(newEditor, { at: afterRange });
      }

      // Keep collapsed toggle data model consistent before editing body.
      if (toggleNode.collapsed) {
        if (!toggleNode.children?.[1] || toggleNode.children[1]?.type !== TOGGLE_CONTENT) {
          const content = generateEmptyElement(TOGGLE_CONTENT);
          content.children = bodyChildren.length > 0 ? bodyChildren : [generateEmptyElement(PARAGRAPH)];
          Transforms.insertNodes(newEditor, content, { at: contentPath });
        }
        Transforms.setNodes(newEditor, { collapsed: false, collapsed_body: null }, { at: togglePath });
      } else if (!toggleNode.children?.[1] || toggleNode.children[1]?.type !== TOGGLE_CONTENT) {
        const content = generateEmptyElement(TOGGLE_CONTENT);
        content.children = [generateEmptyElement(PARAGRAPH)];
        Transforms.insertNodes(newEditor, content, { at: contentPath });
      }

      // Insert new paragraph node with afterText
      const newParagraph = generateEmptyElement(PARAGRAPH);
      if (afterChildren.length > 0) {
        newParagraph.children = [generateDefaultText(afterText)];
      }
      const firstParagraphPath = [...contentPath, 0];
      Transforms.insertNodes(newEditor, newParagraph, { at: firstParagraphPath });
      Transforms.select(newEditor, Editor.start(newEditor, firstParagraphPath));
    });
  };

  newEditor.insertSoftBreak = () => {
    const { selection } = newEditor;
    if (!selection || !Range.isCollapsed(selection)) {
      insertSoftBreak();
      return;
    }

    const [selectedNode] = Editor.node(newEditor, selection, { depth: 1 });
    if (selectedNode.type === TOGGLE_HEADER) {
      newEditor.insertBreak();
      return;
    }
    insertSoftBreak();
  };

  newEditor.deleteBackward = (unit) => {
    const { selection } = newEditor;
    if (!selection || !Range.isCollapsed(selection)) {
      deleteBackward(unit);
      return;
    }

    const currentBlockEntry = Editor.above(newEditor, {
      at: selection,
      match: n => Element.isElement(n) && Editor.isBlock(newEditor, n),
      mode: 'lowest',
    });

    if (!currentBlockEntry) {
      deleteBackward(unit);
      return;
    }

    const [currentBlockNode, currentBlockPath] = currentBlockEntry;

    const toggleContentEntry = Editor.above(newEditor, {
      at: currentBlockPath,
      match: n => Element.isElement(n) && n.type === TOGGLE_CONTENT,
      mode: 'lowest',
    });

    // When cursor is in start point of the last toggle content
    if (toggleContentEntry) {
      const [toggleContentNode, toggleContentPath] = toggleContentEntry;

      const childCount = toggleContentNode.children.length;
      const currentIndex = currentBlockPath[currentBlockPath.length - 1];
      const isLastChild = currentIndex === childCount - 1;

      const hasOtherChildren = childCount > 1;

      const isAtLastChildStart = Editor.isStart(newEditor, selection.anchor, currentBlockPath);

      if (isLastChild && isAtLastChildStart && hasOtherChildren && !TOGGLE_TITLE_TYPES.includes(currentBlockNode.type)) {
        const parentToggleEntry = Editor.parent(newEditor, toggleContentPath);
        const [parentToggleNode, parentTogglePath] = parentToggleEntry;

        if (parentToggleNode && parentToggleNode.type === TOGGLE_HEADER) {
          const liftedNode = currentBlockNode;
          const insertPath = Path.next(parentTogglePath);

          Editor.withoutNormalizing(newEditor, () => {
            Transforms.removeNodes(newEditor, { at: currentBlockPath });

            ensureToggleContentNotEmpty(newEditor, toggleContentPath);

            Transforms.insertNodes(newEditor, liftedNode, { at: insertPath });
            Transforms.select(newEditor, Editor.start(newEditor, insertPath));
          });

          return;
        }
      }
    }

    // Other cases
    const titleEntry = Editor.above(newEditor, {
      at: selection,
      match: n => Element.isElement(n) && TOGGLE_TITLE_TYPES.includes(n.type),
      mode: 'lowest',
    });
    if (!titleEntry) {
      deleteBackward(unit);
      return;
    }
    const [, titlePath] = titleEntry;
    if (titleEntry && titlePath) {
      const [titleNode] = Editor.node(newEditor, titlePath);
      const isAtTitleStart = Editor.isStart(newEditor, selection.anchor, titlePath);
      if (!isAtTitleStart) {
        deleteBackward(unit);
        return;
      }

      const toggleEntry = Editor.parent(newEditor, titlePath);
      const [toggleNode, togglePath] = toggleEntry;
      const contentChildren = getToggleBodyChildren(toggleNode);

      const normalHeaderTypeMap = {
        toggle_header1: HEADER1,
        toggle_header2: HEADER2,
        toggle_header3: HEADER3,
      };

      const normalHeaderType = normalHeaderTypeMap[titleNode.type];
      const normalHeaderNode = {
        ...titleNode,
        type: normalHeaderType,
      };
      const nodesToInsert = [normalHeaderNode];

      if (contentChildren.length > 0) {
        nodesToInsert.push(...contentChildren);
      }

      Editor.withoutNormalizing(newEditor, () => {
        Transforms.removeNodes(newEditor, { at: togglePath });
        Transforms.insertNodes(newEditor, nodesToInsert, { at: togglePath });
        Transforms.select(newEditor, Editor.start(newEditor, togglePath));
      });
      return;
    }
    return deleteBackward(unit);
  };

  newEditor.insertFragment = (data) => {
    const { selection } = newEditor;
    if (!selection) return insertFragment(data);

    const nextFragment = [];

    data.forEach((node) => {
      if (node?.type === TOGGLE_HEADER) {
        if (isOnlyHasToggleContent(node)) {
          let childrenNodes = [];
          node.children.forEach((child) => {
            if (child?.children) {
              childrenNodes = childrenNodes.concat(child.children);
            }
          });
          nextFragment.push(...childrenNodes);
        } else {
          nextFragment.push(node);
        }
      } else {
        nextFragment.push(node);
      }
    });

    if (nextFragment[0]?.type === TOGGLE_HEADER) {
      const currentBlockEntry = Editor.above(newEditor, {
        at: selection,
        match: n => Element.isElement(n) && Editor.isBlock(newEditor, n),
        mode: 'lowest',
      });

      if (!currentBlockEntry) {
        insertFragment(nextFragment);
        return;
      }

      const [currentBlockNode,] = currentBlockEntry;
      const isBlockEmpty = Editor.isEmpty(newEditor, currentBlockNode);

      Editor.withoutNormalizing(newEditor, () => {
        if (!isBlockEmpty) {
          Transforms.splitNodes(newEditor, {
            at: selection,
            match: n => Element.isElement(n) && Editor.isBlock(newEditor, n),
            always: true,
          });
        }

        insertFragment(nextFragment);
      });

      return;
    }

    insertFragment(nextFragment);
  };

  newEditor.onHotKeyDown = (event) => {
    const { selection } = newEditor;
    if (!selection) return false;

    const [selectedNode] = Editor.node(newEditor, selection, { depth: 1 });
    if (selectedNode.type === TOGGLE_HEADER && isHotkey('shift+tab', event)) {
      event.preventDefault();

      const [, currentPath] = getCurrentNode(editor);
      const currentToggleContentEntry = getAboveNode(editor, { match: { type: TOGGLE_CONTENT } });
      // No operation in the first toggle-header1-3
      if (!currentToggleContentEntry) {
        return true;
      }

      const [toggleContentNode, toggleContentPath] = currentToggleContentEntry;
      const [parentNode, parentPath] = Editor.parent(editor, toggleContentPath);

      // Current direct child index in toggle content's children
      const currentIndexInToggleContent = currentPath[toggleContentPath.length];
      const movingChildren = toggleContentNode.children.slice(currentIndexInToggleContent);

      let targetCursorPath = [];
      let targetOffset = editor.selection.anchor.offset;
      Editor.withoutNormalizing(editor, () => {
        // Remove toggle content children node
        for (let i = toggleContentNode.children.length - 1; i >= currentIndexInToggleContent; i--) {
          Transforms.removeNodes(editor, { at: toggleContentPath.concat(i) });
        }

        // In the first toggle content
        if (parentNode.type === TOGGLE_HEADER && parentPath.length === 1) {
          let insertPath = Path.next(parentPath);
          targetCursorPath = insertPath;

          movingChildren.forEach((child) => {
            Transforms.insertNodes(editor, child, { at: insertPath });
            insertPath = Path.next(insertPath);
          });

          ensureToggleContentNotEmpty(editor, toggleContentPath);
          const targetPoint = getFirstTextPoint(editor, targetCursorPath, targetOffset);
          Transforms.select(newEditor, targetPoint);
          return true;
        }

        // In the multi layer toggle content
        if (parentNode.type === TOGGLE_HEADER && parentPath.length > 1) {
          const parentIndexInOuterToggleContent = parentPath[parentPath.length - 1];
          const outerToggleContentPath = Path.parent(parentPath);

          let insertPath = outerToggleContentPath.concat(parentIndexInOuterToggleContent + 1);
          targetCursorPath = insertPath;

          movingChildren.forEach((child) => {
            Transforms.insertNodes(editor, child, { at: insertPath });
            insertPath = Path.next(insertPath);
          });

          ensureToggleContentNotEmpty(editor, toggleContentPath);
          const targetPoint = getFirstTextPoint(editor, targetCursorPath, targetOffset);
          Transforms.select(newEditor, targetPoint);
        }
      });

      return true;
    }
    return onHotKeyDown && onHotKeyDown(event);
  };

  newEditor.normalizeNode = ([node, path]) => {
    if (node.type === TOGGLE_HEADER) {

      // code-block is the last node in the editor and needs to be followed by a p node
      const isLast = isLastNode(newEditor, node);
      if (isLast) {
        const paragraph = generateEmptyElement(PARAGRAPH);
        Transforms.insertNodes(newEditor, paragraph, { at: [path[0] + 1] });
      }

      const toggleHeaderType = TOGGLE_TITLE_TYPES.includes(node.children[0].type) && node.children[0].type;
      const level = Math.min(6, Math.max(1, Number(getLevelFromType(toggleHeaderType) || 1)));

      // For toggle-header1-3 element
      const titleType = getTitleTypeByLevel(level);
      const titleNode = node.children?.[0];
      if (!titleNode || !TOGGLE_TITLE_TYPES.includes(titleNode.type)) {
        const title = generateEmptyElement(titleType);
        Transforms.insertNodes(newEditor, title, { at: [...path, 0] });
        return;
      }
      if (titleNode.type !== titleType) {
        Transforms.setNodes(newEditor, { type: titleType }, { at: [...path, 0] });
        return;
      }
      // For toggle-content element
      const contentNode = node.children?.[1];
      if (node.collapsed) {
        if (contentNode?.type === TOGGLE_CONTENT) {
          if (!Array.isArray(node.collapsed_body)) {
            Transforms.setNodes(newEditor, { collapsed_body: contentNode.children || [] }, { at: path });
            return;
          }
          Transforms.removeNodes(newEditor, { at: [...path, 1] });
          return;
        }
        if (!Array.isArray(node.collapsed_body)) {
          Transforms.setNodes(newEditor, { collapsed_body: [generateEmptyElement(PARAGRAPH)] }, { at: path });
          return;
        }
        return;
      }

      if (!contentNode || contentNode.type !== TOGGLE_CONTENT) {
        const collapsedBody = Array.isArray(node.collapsed_body) ? node.collapsed_body : [];
        const content = generateEmptyElement(TOGGLE_CONTENT);
        content.children = collapsedBody.length > 0 ? collapsedBody : [generateEmptyElement(PARAGRAPH)];
        Transforms.insertNodes(newEditor, content, { at: [...path, 1] });
        return;
      }

      if (node.collapsed_body) {
        Transforms.setNodes(newEditor, { collapsed_body: null }, { at: path });
        return;
      }

      if (!contentNode.children || contentNode.children.length === 0) {
        const paragraph = generateEmptyElement(PARAGRAPH);
        Transforms.insertNodes(newEditor, paragraph, { at: [...path, 1, 0] });
        return;
      }
    }

    return normalizeNode([node, path]);
  };

  return newEditor;
};

export default withToggleHeader;
