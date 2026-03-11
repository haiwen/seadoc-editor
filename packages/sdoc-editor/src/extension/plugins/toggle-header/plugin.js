import { Editor, Element, Node, Path, Range, Transforms } from '@seafile/slate';
import isHotkey from 'is-hotkey';
import { PARAGRAPH, TOGGLE_CONTENT, TOGGLE_HEADER, TOGGLE_TITLE_TYPES } from '../../constants';
import { generateDefaultText, generateEmptyElement, getAboveNode, getCurrentNode, isLastNode } from '../../core';
import { ensureToggleContentNotEmpty, getLevelFromType, getTitleTypeByLevel } from './helper';

const withToggleHeader = (editor) => {
  const { insertBreak, normalizeNode, insertSoftBreak, deleteBackward, insertFragment } = editor;
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
    const titleEndPoint = Editor.end(newEditor, titlePath);
    const isAtTitleEnd = Editor.isEnd(newEditor, cursorPoint, titlePath);
    const afterRange = { anchor: cursorPoint, focus: titleEndPoint };
    const afterFragment = isAtTitleEnd ? [] : Editor.fragment(newEditor, afterRange);
    const afterChildren = afterFragment[0]?.children || [];

    // Carry out enter or shift+enter operation in toggle header
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
      const isEmptyTitle = Node.string(titleNode) === '';
      if (!isAtTitleStart || !isEmptyTitle) {
        deleteBackward(unit);
        return;
      }

      const toggleEntry = Editor.parent(newEditor, titlePath);
      const [toggleNode, togglePath] = toggleEntry;
      const contentChildren = getToggleBodyChildren(toggleNode);

      const hasBodyContent = contentChildren.some((child) => {
        if (!Element.isElement(child)) return false;
        if (child.type !== PARAGRAPH) return true;
        return Node.string(child) !== '';
      });

      Editor.withoutNormalizing(newEditor, () => {
        Transforms.removeNodes(newEditor, { at: togglePath });
        if (hasBodyContent) {
          Transforms.insertNodes(newEditor, contentChildren, { at: togglePath });
        } else {
          const paragraph = generateEmptyElement(PARAGRAPH);
          Transforms.insertNodes(newEditor, paragraph, { at: togglePath });
        }
        Transforms.select(newEditor, Editor.start(newEditor, togglePath));
      });
      return;
    }
    return deleteBackward(unit);
  };

  newEditor.insertFragment = (data) => {
    const { selection } = editor;
    if (!selection) return insertFragment(data);

    if (data[0]?.type === TOGGLE_HEADER) {
      let childrenNodes = [];
      data[0].children.forEach(col => {
        childrenNodes = childrenNodes.concat(col.children);
      });
      insertFragment(childrenNodes);
      return;
    }
    insertFragment(data);
  };

  newEditor.onHotKeyDown = (event) => {
    const { selection } = newEditor;
    if (!selection || !Range.isCollapsed(selection)) {
      return true;
    }
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

      Editor.withoutNormalizing(editor, () => {
        // Remove toggle content children node
        for (let i = toggleContentNode.children.length - 1; i >= currentIndexInToggleContent; i--) {
          Transforms.removeNodes(editor, { at: toggleContentPath.concat(i) });
        }

        // In the first toggle content
        if (parentNode.type === TOGGLE_HEADER && parentPath.length === 1) {
          let insertPath = Path.next(parentPath);

          movingChildren.forEach((child) => {
            Transforms.insertNodes(editor, child, { at: insertPath });
            insertPath = Path.next(insertPath);
          });

          ensureToggleContentNotEmpty(editor, toggleContentPath);
          return true;
        }

        // In the multi layer toggle content
        if (parentNode.type === TOGGLE_HEADER && parentPath.length > 1) {
          const parentIndexInOuterToggleContent = parentPath[parentPath.length - 1];
          const outerToggleContentPath = Path.parent(parentPath);

          let insertPath = outerToggleContentPath.concat(parentIndexInOuterToggleContent + 1);

          movingChildren.forEach((child) => {
            Transforms.insertNodes(editor, child, { at: insertPath });
            insertPath = Path.next(insertPath);
          });

          ensureToggleContentNotEmpty(editor, toggleContentPath);
        }
      });

      return true;
    }
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
