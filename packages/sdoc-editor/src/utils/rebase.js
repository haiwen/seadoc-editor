import { MODIFY_TYPE, REBASE_TYPE, REBASE_MARK_KEY, REBASE_ORIGIN, REBASE_TYPES } from '../constants';
import { ELEMENT_TYPE } from '../extension/constants';
import { replaceNodeId } from '../node-id/helpers';
import { generateIdMapAndIds, getIdDiffs } from './diff';
import ObjectUtils from './object-utils';

export const hasConflict = (content) => {
  if (!Array.isArray(content) || content.length === 0) return false;
  let flag = false;
  for (let i = 0; i < content.length; i++) {
    const element = content[i];
    const { rebase_type, children } = element;
    if (REBASE_TYPES.includes(rebase_type)) {
      flag = true;
      break;
    } else {
      const childrenFlag = hasConflict(children);
      if (!childrenFlag) continue;
      flag = childrenFlag;
      break;
    }
  }

  return flag;
};

const expandGroup = (content) => {
  if ([ELEMENT_TYPE.UNORDERED_LIST, ELEMENT_TYPE.ORDERED_LIST].includes(content.type)) {
    return [{
      ...content,
      children: content.children.map(item => {
        if (item.type === ELEMENT_TYPE.GROUP) {
          return expandGroup(item);
        }
        return item;
      }).flat(1),
    }];
  }
  return content.type === ELEMENT_TYPE.GROUP ? content.children : [content];
};

const mergeChanges = (changes) => {
  if (!Array.isArray(changes) || changes.length === 0) return changes;
  let value = [];
  let i = 0;

  while (i < changes.length) {
    const change = changes[i];
    const lastChange = value[value.length - 1];
    if (change && lastChange && change[REBASE_MARK_KEY.MODIFY_TYPE] === MODIFY_TYPE.ADD && lastChange[REBASE_MARK_KEY.MODIFY_TYPE] === MODIFY_TYPE.DELETE) {
      value = value.slice(0, value.length - 1);
      lastChange[REBASE_MARK_KEY.MODIFY_TYPE] && delete lastChange[REBASE_MARK_KEY.MODIFY_TYPE];
      change[REBASE_MARK_KEY.MODIFY_TYPE] && delete change[REBASE_MARK_KEY.MODIFY_TYPE];
      value.push({
        id: change.id.endsWith('_group') ? change.id : change.id + '_group',
        type: ELEMENT_TYPE.GROUP,
        [REBASE_MARK_KEY.MODIFY_TYPE]: MODIFY_TYPE.MODIFY,
        children: expandGroup(change),
        [REBASE_MARK_KEY.OLD_ELEMENT]: {
          id: lastChange.id.endsWith('_group') ? lastChange.id : lastChange.id + '_group',
          type: ELEMENT_TYPE.GROUP,
          children: expandGroup(lastChange)
        }
      });
    } else {
      value.push(change);
    }
    i++;
  }

  return value;
};

const getChanges = (masterContent, revisionContent, childrenName = 'children') => {
  const { map: masterContentMap, ids: masterIds } = generateIdMapAndIds(masterContent[childrenName]);
  const { map: currentContentMap, ids: currentIds } = generateIdMapAndIds(revisionContent[childrenName]);
  const idDiffs = getIdDiffs(masterIds, currentIds);
  let content = [];

  idDiffs.forEach(idDiff => {
    const { value, added, removed } = idDiff;
    if (added) {

      // merge consecutive identical operations
      content.push({
        id: value[0] + '_group',
        type: ELEMENT_TYPE.GROUP,
        [REBASE_MARK_KEY.MODIFY_TYPE]: MODIFY_TYPE.ADD,
        children: value.map(item => currentContentMap[item])
      });
    } else if (removed) {

      // merge consecutive identical operations
      content.push({
        id: value[0] + '_group',
        type: ELEMENT_TYPE.GROUP,
        [REBASE_MARK_KEY.MODIFY_TYPE]: MODIFY_TYPE.DELETE,
        children: value.map(item => masterContentMap[item])
      });
    } else {
      value.forEach(elementId => {
        if (ObjectUtils.isSameObject(masterContentMap[elementId], currentContentMap[elementId])) {
          content.push(currentContentMap[elementId]);
        } else {
          const oldElement = masterContentMap[elementId];
          const currentElement = currentContentMap[elementId];
          let newElement = {
            ...currentElement,
            [REBASE_MARK_KEY.MODIFY_TYPE]: MODIFY_TYPE.MODIFY,
            [REBASE_MARK_KEY.OLD_ELEMENT]: oldElement,
          };
          if (currentElement.type === oldElement.type) {
            const elementType = currentElement.type;
            if ([ELEMENT_TYPE.UNORDERED_LIST, ELEMENT_TYPE.ORDERED_LIST].includes(elementType)) {
              const listContent = getChanges(oldElement, currentElement);
              newElement[REBASE_MARK_KEY.MODIFY_TYPE] = MODIFY_TYPE.CHILDREN_MODIFY;
              newElement['children'] = listContent;
            }
          }
          content.push(newElement);
        }
      });
    }
  });

  return mergeChanges(content);
};

const getMergeElement = (diffElement, baseElement) => {
  const modifyType = diffElement[REBASE_MARK_KEY.MODIFY_TYPE];
  const newElement = { ...diffElement };
  newElement[REBASE_MARK_KEY.MODIFY_TYPE] && delete newElement[REBASE_MARK_KEY.MODIFY_TYPE];

  // revision does not have this element, master has this element
  if (modifyType === MODIFY_TYPE.DELETE) {

    // base content does not have this element, indicating that it is newly added by master and needs to be retained, and will not be counted as a conflict.
    if (!baseElement) return expandGroup(newElement);

    // base content has this element, master modified it, indicating that revision deleted it, and the user manually selected the conflict
    if (!ObjectUtils.isSameObject(baseElement, diffElement, [REBASE_MARK_KEY.MODIFY_TYPE])) {
      newElement[REBASE_MARK_KEY.REBASE_TYPE] = REBASE_TYPE.MODIFY_DELETE;
      return [newElement];
    }

    // base content has this element, but master has not modified it. It means that revision has deleted it and the program has deleted it. The conflict will not be counted.
    return [];
  }

  // revision has this element, master does not have this element
  if (modifyType === MODIFY_TYPE.ADD) {

    // base content does not have this element, indicating that it is newly added by revision and needs to be retained, and will not be counted as a conflict.
    if (!baseElement) return expandGroup(newElement);

    // master deleted it, revision modified it, and the user manually selected the conflict
    if (!ObjectUtils.isSameObject(baseElement, diffElement, [REBASE_MARK_KEY.MODIFY_TYPE])) {
      newElement[REBASE_MARK_KEY.REBASE_TYPE] = REBASE_TYPE.DELETE_MODIFY;
      return [newElement];
    }

    // master deleted it, revision did not modify it, the program deleted it, and the conflict is not counted.
    return [];
  }

  // Elements that differ between revision and master
  if (modifyType === MODIFY_TYPE.MODIFY) {
    const masterElement = { ...diffElement[REBASE_MARK_KEY.OLD_ELEMENT] };
    delete newElement[REBASE_MARK_KEY.OLD_ELEMENT];

    // revision and master both add a new element, but the content is different. ===》 At present, this situation does not exist, it only exists in the theoretical stage.
    if (!baseElement) {
      return [
        { ...replaceNodeId(masterElement), [REBASE_MARK_KEY.REBASE_TYPE]: REBASE_TYPE.MODIFY_MODIFY, [REBASE_MARK_KEY.OLD_ELEMENT]: masterElement, [REBASE_MARK_KEY.ORIGIN]: REBASE_ORIGIN.OTHER },
        { ...newElement, [REBASE_MARK_KEY.REBASE_TYPE]: REBASE_TYPE.MODIFY_MODIFY, [REBASE_MARK_KEY.ORIGIN]: REBASE_ORIGIN.MY }
      ];
    }

    // master is the same as base, indicating that revision has modified the content
    if (ObjectUtils.isSameObject(masterElement, baseElement)) return [newElement];

    // revision is the same as base, indicating that master has modified the content
    if (ObjectUtils.isSameObject(newElement, baseElement)) return [masterElement];

    // They are all different. Revision and master were modified at the same time. If there is a conflict, the conflict needs to be resolved manually.
    return [
      { ...replaceNodeId(masterElement), [REBASE_MARK_KEY.REBASE_TYPE]: REBASE_TYPE.MODIFY_MODIFY, [REBASE_MARK_KEY.OLD_ELEMENT]: masterElement, [REBASE_MARK_KEY.ORIGIN]: REBASE_ORIGIN.OTHER },
      { ...newElement, [REBASE_MARK_KEY.REBASE_TYPE]: REBASE_TYPE.MODIFY_MODIFY, [REBASE_MARK_KEY.ORIGIN]: REBASE_ORIGIN.MY }
    ];

  }

  if (modifyType === MODIFY_TYPE.CHILDREN_MODIFY) {
    const masterElement = { ...diffElement[REBASE_MARK_KEY.OLD_ELEMENT] };
    delete newElement[REBASE_MARK_KEY.OLD_ELEMENT];

    // revision and master both add a new element, but the content is different. ===》 At present, this situation does not exist, it only exists in the theoretical stage.
    if (!baseElement) {
      return [
        { ...replaceNodeId(masterElement), [REBASE_MARK_KEY.REBASE_TYPE]: REBASE_TYPE.MODIFY_MODIFY, [REBASE_MARK_KEY.OLD_ELEMENT]: masterElement, [REBASE_MARK_KEY.ORIGIN]: REBASE_ORIGIN.OTHER },
        { ...newElement, [REBASE_MARK_KEY.REBASE_TYPE]: REBASE_TYPE.MODIFY_MODIFY, [REBASE_MARK_KEY.ORIGIN]: REBASE_ORIGIN.MY }
      ];
    }

    if (ObjectUtils.isSameObject(masterElement, baseElement)) return expandGroup(newElement);
    if (ObjectUtils.isSameObject(newElement, baseElement)) return [masterElement];

    if (ObjectUtils.isSameObject(masterElement, newElement, ['type'])) {
      if (ObjectUtils.isSameObject(masterElement, baseElement, ['type'])) return expandGroup(newElement);
      if (ObjectUtils.isSameObject(newElement, baseElement, ['type'])) return [masterElement];
    }

    // The content of the subnode has changed and needs to be solved manually.
    const childrenContent = getMergeContent(baseElement, diffElement.children);
    return [{ ...newElement, children: childrenContent }];
  }

  newElement[REBASE_MARK_KEY.OLD_ELEMENT] && delete newElement[REBASE_MARK_KEY.OLD_ELEMENT];
  return expandGroup(newElement);
};

const getMergeContent = (baseContent, diffChanges, childrenName = 'children') => {
  const { map: diffChangesContentMap, ids: diffChangesContentIds } = generateIdMapAndIds(diffChanges);
  const { map: baseContentMap } = generateIdMapAndIds(baseContent[childrenName]);
  let content = [];
  diffChangesContentIds.forEach(elementId => {
    const diffElement = diffChangesContentMap[elementId];
    const baseElement = baseContentMap[elementId];
    const mergeElements = getMergeElement(diffElement, baseElement);
    content.push(...mergeElements);
  });
  return content;
};

export const canMerge = (content, reference) => {
  if (hasConflict(content)) return false;
  if (!Array.isArray(reference) || reference.length === 0) return true;
  const { map: referenceMap } = generateIdMapAndIds(reference);
  let flag = true;
  for (let i = 0; i < content.length; i++) {
    const element = content[i];
    let referenceElement = referenceMap[element.id];
    if (!referenceElement) {
      flag = false;
      break;
    }
    flag = canMerge(element.children, referenceElement.children);
    if (flag === false) {
      break;
    }
  }
  return flag;
};

const updateContentToFormatVersion4 = (content) => {
  if (content.format_version === 4) return;
  content.format_version = 4;
  content.elements = content.children;
  delete content['children'];
};

// Only the data in baseContent needs to be formatted.
// The data in the other two does not need to be formatted. They are directly obtained from sdoc-server.
export const getRebase = (masterContent, baseContent, revisionContent) => {
  updateContentToFormatVersion4(baseContent);

  // master no changes, merged directly
  if (masterContent.version === baseContent.version) {
    return { canMerge: true, isNeedReplaceMaster: true, value: revisionContent };
  }

  // The revision content has not changed
  if (baseContent.version === revisionContent.version) {
    return { canMerge: true, isNeedReplaceMaster: false, value: masterContent };
  }

  const diffChanges = getChanges(masterContent, revisionContent, 'elements');
  const content = getMergeContent(baseContent, diffChanges, 'elements');

  return {
    canMerge: canMerge(content, revisionContent.elements),
    isNeedReplaceMaster: true,
    value: {
      ...revisionContent,
      elements: content,
      version: Math.max(masterContent.version, revisionContent.version) + 1
    }
  };
};
