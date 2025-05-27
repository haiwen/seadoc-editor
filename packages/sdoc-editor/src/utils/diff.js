import slugid from 'slugid';
import { ELEMENT_TYPE, ADDED_STYLE, DELETED_STYLE, TEXT_STYLE_MAP } from '../extension/constants';
import DiffText from './diff-text';
import { normalizeChildren } from './document-utils';
import ObjectUtils from './object-utils';

// ignore
const IGNORE_KEYS = [
  'BOLD',
  'ITALIC',
  'bold',
  'italic',
  'columns',
  'minHeight',
  'min_height',
  'language',
  'white_space',
];

const generatorDiffTextElement = (textElement, diffType, style = {}) => {
  if (!textElement) return null;
  if (!diffType) return textElement;
  const id = textElement.id;

  return {
    ...textElement,
    id: id || slugid.nice(),
    [diffType]: true,
    ...style,
  };
};

export const getTopLevelChanges = (changes) => {
  const topLevelChanges = [];
  const articleEl = document.getElementById('sdoc-editor');
  changes.forEach((item) => {
    let dom = document.querySelectorAll(`[data-id="${item}"]`)[0];
    if (!dom) return [];
    while (dom?.dataset?.root !== 'true' || dom?.parentNode !== articleEl) {
      if (!dom?.parentNode || dom instanceof Document) break;
      const parentNode = dom.parentNode;
      if (parentNode instanceof Document) {
        break;
      } else {
        dom = parentNode;
        if (dom?.dataset?.id && !dom.classList.contains('table-cell')) break;
      }
    }
    topLevelChanges.push(dom.dataset.id);
  });
  return Array.from(new Set(topLevelChanges));
};

// Merge consecutive added areas or deleted areas
export const getMergedChanges = (topLevelChanges, diffValue) => {
  const topLevelChangesValue = [];
  const changes = [];

  diffValue.forEach((item) => {
    if (topLevelChanges.includes(item.id)) {
      const obj = {
        id: item.id,
        value: item
      };
      topLevelChangesValue.push(obj);
    }
  });

  topLevelChangesValue.forEach((item) => {
    const preChange = changes[changes.length - 1]?.value;
    const curChange = item.value;
    if (curChange?.add && preChange?.add) return;
    if (curChange?.delete && preChange?.delete) return;
    changes.push(item);
  });
  return changes.map(item => item.id);
};

// Depth facilitates each child node, adding diffType to each end node
const generatorDiffElement = (element, diffType, style = {}) => {
  if (!element) return null;

  if (!Array.isArray(element.children) || element.children.length === 0) {
    return generatorDiffTextElement(element, diffType, style);
  }
  return {
    ...element,
    [diffType]: true,
    children: element.children.map(item => generatorDiffElement(item, diffType, style)),
  };
};

export const generateIdMapAndIds = (elements) => {
  let map = {};
  let ids = [];
  if (!Array.isArray(elements) || elements.length === 0) return { map, ids };
  elements.forEach(element => {
    ids.push(element.id);
    map[element.id] = element;
  });

  return { map, ids };
};

const hasChildren = (element) => {
  if (!element) return false;
  if (!Array.isArray(element.children) || element.children.length === 0) return false;
  return true;
};

// id diffs
export const getIdDiffs = (oldIds, newIds) => {
  const diff = new DiffText(oldIds, newIds);
  return diff.getDiffs();
};

// text diffs
const getTextDiff = (element, oldElement, diff) => {
  const newText = element.text;
  const oldText = oldElement.text;
  const textDiff = new DiffText(oldText || '', newText || '');
  const textDiffs = textDiff.getDiffs();
  let newChildren = [];
  textDiffs.forEach((item, index) => {
    const id = `${element.id || slugid.nice() }-${index}`;
    let elementItem = { id, text: item.value };
    if (item.added) {
      diff.changes.push(id);
      const commonChild = generatorDiffTextElement(elementItem, TEXT_STYLE_MAP.ADD, ADDED_STYLE);
      newChildren.push(commonChild);
    } else if (item.removed) {
      diff.changes.push(id);
      const commonChild = generatorDiffTextElement(elementItem, TEXT_STYLE_MAP.DELETE, DELETED_STYLE);
      newChildren.push(commonChild);
    } else {
      const commonChild = generatorDiffTextElement(elementItem);
      newChildren.push(commonChild);
    }
  });
  return newChildren;
};

const getCommonDiff = (element, oldElement, diff) => {

  if (!hasChildren(element) && !hasChildren(oldElement)) {
    const newChildren = getTextDiff(element, oldElement, diff);
    return [{ ...element, children: newChildren }];
  }

  if (!hasChildren(element) || !hasChildren(oldElement)) {
    const elementId = element.id || slugid.nice();
    diff.changes.push(`${elementId}_delete`);
    return [
      generatorDiffElement({ ...oldElement, id: `${elementId}_delete` }, TEXT_STYLE_MAP.DELETE, DELETED_STYLE),
      generatorDiffElement({ ...element, id: `${elementId}_add` }, TEXT_STYLE_MAP.ADD, ADDED_STYLE),
    ];
  }

  // Content does not change
  if (ObjectUtils.isSameObject(element, oldElement, [...IGNORE_KEYS, 'type'])) {
    return [element];
  }

  // Compare content
  const { children: currentChildren } = element;
  const { children: oldChildren } = oldElement;
  const { map: currentMap, ids: currentIds } = generateIdMapAndIds(currentChildren);
  const { map: oldMap, ids: oldIds } = generateIdMapAndIds(oldChildren);
  const idDiffs = getIdDiffs(oldIds, currentIds);
  let newChildren = [];

  idDiffs.forEach(idDiff => {
    const ids = idDiff.value;
    const isAdded = idDiff.added;
    const isDelete = idDiff.removed;
    ids.forEach(id => {
      const newChildrenElement = currentMap[id];
      const oldChildrenElement = oldMap[id];
      if (isAdded) {
        diff.changes.push(id);
        newChildren.push(generatorDiffElement(newChildrenElement, TEXT_STYLE_MAP.ADD, ADDED_STYLE));
      } else if (isDelete) {
        diff.changes.push(id);
        newChildren.push(generatorDiffElement(oldChildrenElement, TEXT_STYLE_MAP.DELETE, DELETED_STYLE));
      } else {
        if (ObjectUtils.isSameObject(newChildrenElement, oldChildrenElement, IGNORE_KEYS)) {
          newChildren.push(newChildrenElement);
        } else {
          if (newChildrenElement.type === oldChildrenElement.type) {
            if (!newChildrenElement.type) {
              const textDiffs = getTextDiff(newChildrenElement, oldChildrenElement, diff);
              newChildren.push(...textDiffs);
            } else if (newChildrenElement.type === ELEMENT_TYPE.IMAGE) {
              if (newChildrenElement.data.src === oldChildrenElement.data.src) {
                newChildren.push(newChildrenElement);
              } else {
                newChildren.push(generatorDiffTextElement({ ...element, id: element.id + '_add' }, TEXT_STYLE_MAP.ADD, ADDED_STYLE));
                newChildren.push(generatorDiffTextElement({ ...oldChildrenElement, id: element.id + '_delete' }, TEXT_STYLE_MAP.DELETE, DELETED_STYLE));
              }
            } else if (newChildrenElement.type === ELEMENT_TYPE.LINK) {
              if (newChildrenElement.title !== oldChildrenElement.title) {
                const diffElements = getCommonDiff(newChildrenElement, oldChildrenElement, diff);
                newChildren.push(...diffElements);
              } else if (newChildrenElement.href !== oldChildrenElement.href) {
                diff.changes.push(oldChildrenElement.id + '_delete');
                newChildren.push(generatorDiffTextElement({ ...oldChildrenElement, id: oldChildrenElement.id + '_delete' }, TEXT_STYLE_MAP.DELETE, DELETED_STYLE));
                newChildren.push(generatorDiffTextElement({ ...newChildrenElement, id: newChildrenElement.id + '_add' }, TEXT_STYLE_MAP.ADD, ADDED_STYLE));
              } else {
                newChildren.push(newChildrenElement);
              }
            } else if (newChildrenElement.type === ELEMENT_TYPE.TABLE_ROW || newChildrenElement.type === ELEMENT_TYPE.TABLE_CELL) {
              const newRows = getCommonDiff(newChildrenElement, oldChildrenElement, diff);
              newChildren.push(...newRows);
            } else {
              const commonDiffs = getCommonDiff(newChildrenElement, oldChildrenElement, diff);
              newChildren.push(...commonDiffs);
            }
          } else {
            diff.changes.push(oldChildrenElement.id + '_delete');
            newChildren.push(generatorDiffTextElement({ ...oldChildrenElement, id: oldChildrenElement.id + '_delete' }, TEXT_STYLE_MAP.DELETE, DELETED_STYLE));
            newChildren.push(generatorDiffTextElement({ ...newChildrenElement, id: newChildrenElement.id + '_add' }, TEXT_STYLE_MAP.ADD, ADDED_STYLE));
          }
        }
      }
    });
  });
  return [{ ...element, children: newChildren }];
};

const updateDiffValue = (diff, element, oldElement) => {
  if (!diff || !element || !oldElement) return;
  if (ObjectUtils.isSameObject(element, oldElement, IGNORE_KEYS)) {
    diff.value.push(element);
    return;
  }

  const elements = getCommonDiff(element, oldElement, diff);
  elements.forEach(item => {
    // Changing empty characters to other characters
    if (!item.add && item.children.find((child) => child.add === true)) {
      item.add = true;
    }
    diff.value.push(item);
  });
};

/**
 * params:
    * currentValue: current version document content
    * oldValue: last version document content
 * return { value: [], change: [] }
*/
const getElementDiffValue = (currentContent, oldContent) => {

  // init
  let diff = { value: [], changes: [] };
  const { map: currentContentMap, ids: currentIds } = generateIdMapAndIds(currentContent);
  const { map: oldContentMap, ids: oldIds } = generateIdMapAndIds(oldContent);

  const diffs = getIdDiffs(oldIds, currentIds);
  diffs.forEach(diffItem => {
    const elementIds = diffItem.value;
    if (diffItem.removed) {
      elementIds.forEach(elementId => {
        diff.changes.push(elementId);
        const element = oldContentMap[elementId];
        const diffElement = generatorDiffElement(element, TEXT_STYLE_MAP.DELETE, DELETED_STYLE);
        diff.value.push(diffElement);
      });
    } else if (diffItem.added) {
      elementIds.forEach(elementId => {
        diff.changes.push(elementId);
        const element = currentContentMap[elementId];
        const diffElement = generatorDiffElement(element, TEXT_STYLE_MAP.ADD, ADDED_STYLE);
        diff.value.push(diffElement);
      });
    } else {
      elementIds.forEach(elementId => {
        const element = currentContentMap[elementId];
        updateDiffValue(diff, element, oldContentMap[element.id]);
      });
    }
  });

  return diff;
};

/**
 * params:
    * currentValue: current version document
    * oldValue: last version document
 * return { value: [], change: [] }
*/
export const getDiff = (currentValue = { elements: [] }, oldValue = { elements: [] }) => {
  if (!currentValue && !oldValue) return { value: [], changes: [] };
  if (!currentValue && oldValue) return { value: normalizeChildren(oldValue.elements), changes: [] };
  if (currentValue && !oldValue) return { value: normalizeChildren(currentValue.elements), changes: [] };

  const { version: currentVersion, elements: currentContent } = { ...currentValue, elements: normalizeChildren(currentValue.elements) };
  const { version: oldVersion, elements: oldContent } = { ...oldValue, elements: normalizeChildren(oldValue.elements) };
  if (currentVersion === oldVersion) return { value: currentContent, changes: [] };
  return getElementDiffValue(currentContent, oldContent);
};

window.getIdDiffs = getIdDiffs;
