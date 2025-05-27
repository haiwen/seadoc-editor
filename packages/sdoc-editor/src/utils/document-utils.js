import deepCopy from 'deep-copy';
import context from '../context';
import { CLIPBOARD_ORIGIN_SDOC_KEY, ELEMENT_TYPE } from '../extension/constants';
import { generateDefaultText } from '../extension/core/utils/index';
import { normalizeTableELement } from '../extension/plugins/table/helpers';
import ObjectUtils from './object-utils';

export const normalizeChildren = (children) => {
  // text
  if (!Array.isArray(children)) return children;

  // element
  if (Array.isArray(children) && children.length === 0) return [generateDefaultText()];

  return children.map(child => {
    // child is text
    if (ObjectUtils.hasProperty(child, 'text') && !ObjectUtils.hasProperty(child, 'children')) {
      return child;
    }
    // To resolve the issue that the children is not assigned to the new object
    if (!Object.getOwnPropertyDescriptor(child, 'children').writable) {
      child = deepCopy(child);
    }
    // child is element
    child.children = normalizeChildren(child.children);
    return child;
  });
};

export const normalizeCopyNodes = (editor, elements) => {
  if (!Array.isArray(elements) || elements.length === 0) return [];
  return elements.map(element => {
    if (element.type === ELEMENT_TYPE.TABLE) {
      return normalizeTableELement(editor, element);
    }
    return element;
  });
};

export const setOriginSdocKey = (event) => {
  const docUuid = context.getSetting('docUuid');
  event.clipboardData.setData(`text/${CLIPBOARD_ORIGIN_SDOC_KEY}`, docUuid);
};

export const getSlateFragmentAttribute = (dataTransfer) => {
  const catchSlateFragment = /data-slate-fragment="(.+?)"/m;
  const htmlData = dataTransfer.getData('text/html');
  const [, fragment] = htmlData.match(catchSlateFragment) || [];
  return fragment;
};

export const generateDefaultDocContent = () => {
  const defaultValue = {
    version: 0,
    elements: [{ id: 'aaaa', type: 'paragraph', children: [{ text: '' }] }]
  };
  return defaultValue;
};

// patch: update children to elements
export const formatSdocContent = (content) => {
  return {
    ...content,
    ...(!content.elements && { elements: content.children })
  };
};
