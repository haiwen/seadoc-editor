import { Editor, Transforms, Element, Node, Path } from '@seafile/slate';
import context from '../../../context';
import LocalStorage from '../../../utils/local-storage-utils';
import { ELEMENT_TYPE, HEADER, HEADERS, PARAGRAPH, SUBTITLE, TITLE, TOGGLE_HEADER } from '../../constants';
import { findPath, getNodeType } from '../../core';

const HEADER_COLLAPSE_STORAGE_PREFIX = 'sdoc-header-collapsed:';

const getHeaderStorageDocKey = () => {
  return context.getSetting('docUuid') || context.getSetting('wikiId') || window.location.pathname || 'default';
};

const getHeaderStorageKey = () => {
  return `${HEADER_COLLAPSE_STORAGE_PREFIX}${getHeaderStorageDocKey()}`;
};

const clearAllHeaderCollapsedState = () => {
  Object.keys(window.localStorage).forEach((key) => {
    if (key.startsWith(HEADER_COLLAPSE_STORAGE_PREFIX)) {
      LocalStorage.removeItem(key);
    }
  });
};

const getCollapsedHeaderState = () => {
  return LocalStorage.getItem(getHeaderStorageKey(), {});
};

const persistCollapsedHeaderState = (collapsedHeaderState) => {
  try {
    LocalStorage.setItem(getHeaderStorageKey(), collapsedHeaderState);
  } catch (error) {
    clearAllHeaderCollapsedState();
    try {
      LocalStorage.setItem(getHeaderStorageKey(), collapsedHeaderState);
    } catch {
      // Ignore storage failures after cleanup.
    }
  }
};

const getHeaderId = (editor, element, defaultPath) => {
  if (element?.id) return element.id;

  const path = defaultPath || findPath(editor, element);
  if (!path) return null;

  return Node.get(editor, path)?.id || `path:${path.join('.')}`;
};

export const isHeaderCollapsed = (editor, element, defaultPath) => {
  const headerId = getHeaderId(editor, element, defaultPath);
  if (!headerId) {
    return !!element?.collapsed;
  }

  const collapsedHeaderState = getCollapsedHeaderState();
  if (Object.prototype.hasOwnProperty.call(collapsedHeaderState, headerId)) {
    return !!collapsedHeaderState[headerId];
  }

  return !!element?.collapsed;
};

export const setHeaderCollapsed = (editor, element, collapsed, defaultPath) => {
  const headerId = getHeaderId(editor, element, defaultPath);
  if (!headerId) return;

  const collapsedHeaderState = getCollapsedHeaderState();
  collapsedHeaderState[headerId] = collapsed;
  persistCollapsedHeaderState(collapsedHeaderState);

  editor.onHeaderCollapseStateChange?.();
};

export const toggleHeaderCollapsed = (editor, element, defaultPath) => {
  setHeaderCollapsed(editor, element, !isHeaderCollapsed(editor, element, defaultPath), defaultPath);
};

export const clearHeaderCollapsedState = (editor) => {
  LocalStorage.removeItem(getHeaderStorageKey());
  editor?.onHeaderCollapseStateChange?.();
};

export const isMenuDisabled = (editor, readonly = false) => {
  if (readonly) return true;
  if (!editor.selection) return true;

  const [match] = Editor.nodes(editor, {
    match: n => {
      let type = getNodeType(n);
      if (!type) return false;
      if (type === ELEMENT_TYPE.PARAGRAPH) return true;
      if (type.startsWith(HEADER)) return true;
      if (type === TITLE) return true;
      if (type === SUBTITLE) return true;

      return false;
    },
    universal: true,
    mode: 'highest'
  });
  return !match;
};

export const getHeaderType = (editor) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => {
      const nodeType = getNodeType(n);
      if (!nodeType) return false;
      if (nodeType.includes(HEADER)) return true;
      if (nodeType === TITLE) return true;
      if (nodeType === SUBTITLE) return true;
      return false;
    },
    universal: true,
  });

  if (!match) return PARAGRAPH;
  const [n] = match;

  if (n.type === TOGGLE_HEADER) return PARAGRAPH;

  return getNodeType(n);
};

export const isSelectionInHeader = (editor) => {
  const [match] = Editor.nodes(editor, {
    match: n => {
      if (!Element.isElement(n)) return false;
      if (!n.type) return false;
      if (n.type.startsWith(HEADER)) return true;
      if (n.type === TITLE) return true;
      if (n.type === SUBTITLE) return true;
      return false;
    }, // Matches nodes whose node.type starts with header
    universal: true,
  });
  return match;
};

export const setHeaderType = (editor, type) => {
  if (!type) return;

  Transforms.setNodes(editor, { type });
};

export const getHeaderLevel = (type) => {
  if (!HEADERS.includes(type)) return null;
  return Number(type.replace(HEADER, ''));
};

const getSectionEndIndex = (siblings, startIndex, level) => {
  let endIndex = siblings.length;

  for (let index = startIndex + 1; index < siblings.length; index++) {
    const siblingLevel = getHeaderLevel(siblings[index]?.type);
    if (siblingLevel !== null && siblingLevel <= level) {
      endIndex = index;
      break;
    }
  }

  return endIndex;
};

export const getCollapsedHeaderSectionEndIndex = (editor, element, defaultPath) => {
  const path = findPath(editor, element, defaultPath);
  if (!path || path.length !== 1) return null;

  const currentIndex = path[path.length - 1];
  const parentPath = Path.parent(path);
  const siblings = parentPath.length === 0 ? editor.children : Node.get(editor, parentPath).children;
  const level = getHeaderLevel(element.type);

  if (level === null) return null;

  return getSectionEndIndex(siblings, currentIndex, level);
};

export const getCollapsedHeaderInsertPath = (editor, element, defaultPath) => {
  const endIndex = getCollapsedHeaderSectionEndIndex(editor, element, defaultPath);
  if (endIndex === null) {
    const path = findPath(editor, element, defaultPath);
    return path ? Path.next(path) : null;
  }

  return [endIndex];
};

export const isElementHiddenByCollapsedHeader = (editor, element, defaultPath) => {
  const path = findPath(editor, element, defaultPath);
  if (!path || path.length !== 1) return false;

  const currentIndex = path[path.length - 1];
  const parentPath = Path.parent(path);
  const siblings = parentPath.length === 0 ? editor.children : Node.get(editor, parentPath).children;

  for (let index = currentIndex - 1; index >= 0; index--) {
    const sibling = siblings[index];
    if (!Element.isElement(sibling) || !isHeaderCollapsed(editor, sibling, [index])) continue;

    const siblingLevel = getHeaderLevel(sibling.type);
    if (siblingLevel === null) continue;

    const endIndex = getSectionEndIndex(siblings, index, siblingLevel);
    if (currentIndex < endIndex) {
      return true;
    }
  }

  return false;
};

export const getSkippedHiddenHeaderMovePoint = (editor, point, reverse = false) => {
  const topLevelBlockEntry = Editor.above(editor, {
    at: point,
    match: n => Element.isElement(n) && Editor.isBlock(editor, n),
    mode: 'highest',
  });

  if (!topLevelBlockEntry) return null;

  const [topLevelBlock, topLevelPath] = topLevelBlockEntry;
  if (topLevelPath.length !== 1) return null;

  const step = reverse ? -1 : 1;
  const isCurrentHidden = isElementHiddenByCollapsedHeader(editor, topLevelBlock, topLevelPath);
  const isAtBoundary = reverse
    ? Editor.isStart(editor, point, topLevelPath)
    : Editor.isEnd(editor, point, topLevelPath);

  let startIndex = topLevelPath[0] + step;
  let skippedHiddenBlock = isCurrentHidden;

  if (!isCurrentHidden) {
    if (!isAtBoundary) return null;
  }

  for (let index = startIndex; index >= 0 && index < editor.children.length; index += step) {
    const sibling = editor.children[index];
    if (!Element.isElement(sibling)) continue;

    if (isElementHiddenByCollapsedHeader(editor, sibling, [index])) {
      skippedHiddenBlock = true;
      continue;
    }

    if (!skippedHiddenBlock) return null;

    return reverse ? Editor.end(editor, [index]) : Editor.start(editor, [index]);
  }

  return null;
};

export const isHasImage = (node) => {
  return node.children.some(item => {
    if (item.type === 'image') return true;
    return false;
  });
};
