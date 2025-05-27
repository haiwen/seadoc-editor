import { Editor } from '@seafile/slate';
import { ReactEditor } from '@seafile/slate-react';
import { KeyCodes } from '../../constants';
import { ELEMENT_TYPE } from '../../extension/constants';
import { focusEditor, findPath } from '../../extension/core';
import { getPreCharacters } from '../../extension/plugins/mention/helper';
import getEventTransfer from './get-event-transfer';
import { createNotify, generatorNotificationKey } from './notification-utils';

export const searchCollaborators = (collaborators, searchValue, editor) => {
  const validSearchValue = searchValue ? searchValue.trim().toLowerCase() : '';
  const validCollaborators = Array.isArray(collaborators) && collaborators.length > 0 ? collaborators : [];
  if (!validSearchValue) return validCollaborators;

  // The current character is '@' and the previous character is a null character
  const beforeStr = getPreCharacters(editor);
  const isEmptyStr = beforeStr.slice(-2, -1).trim().length === 0;
  if (beforeStr.slice(-1) === '@' && isEmptyStr) {
    return validCollaborators;
  }

  return validCollaborators.filter(collaborator => {
    const { name, name_pinyin = '' } = collaborator;
    if (name.toString().toLowerCase().indexOf(validSearchValue) > -1) return true;
    if (!name_pinyin) return false;
    const validNamePinyin = name_pinyin.toString().toLowerCase();
    const validSearchPinyinValue = validSearchValue.replace(/ |'/g, '');

    // complete: For example, seatable can be retrieved when searching for sea.
    if (validNamePinyin.indexOf(validSearchPinyinValue) > -1) return true;
    if (validNamePinyin.replace(/'/g, '').indexOf(validSearchPinyinValue) > -1) return true;

    const validNamePinyinList = validNamePinyin.split('\'');
    // acronym: For example, sea table can be retrieved when searching for st.
    const namePinyinAcronym = validNamePinyinList.map(item => item && item.trim() ? item.trim().slice(0, 1) : '');
    if (namePinyinAcronym.join('').indexOf(validSearchPinyinValue) > -1) return true;

    return false;
  });
};

// Mailto, file, tel, callto, sms, cid, xmpp, etc. are not support
// const ALLOWED_URL_REG = /((http|https):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|])/g;
// export const textToHtml = (text) => {
//   if (!text) return '';
//   return text.replace(ALLOWED_URL_REG, '<a href="$1" target="_blank" class=' + COMMENT_URL_CLASSNAME + '>$1</a>');
// };

export const convertComment = (value) => {
  return value.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
};

export const checkMentionOperation = (event) => {
  const { keyCode } = event;
  const { Escape, LeftArrow, RightArrow } = KeyCodes;
  if (keyCode === Escape || keyCode === LeftArrow || keyCode === RightArrow) return false;
  return true;
};

class CommentUtilities {

  onInsertElement = ({ commentRef, selection, range, content, nodeType }) => {
    if (range) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
    return this.createHtmlElement({ commentRef, selection, range, content, nodeType });
  };

  getHtmlElement = (nodeType, content) => {
    switch (nodeType) {
      case 'image': {
        let parentElement = document.createElement('div');
        parentElement.className = 'image-container';
        parentElement.contentEditable = 'false';
        let imageContainer = document.createElement('img');
        imageContainer.src = content;
        imageContainer.height = 60;
        parentElement.appendChild(imageContainer);
        return parentElement.outerHTML;
      }
      default: {
        return '';
      }
    }
  };

  createHtmlElement = ({ commentRef, selection, range, content, nodeType }) => {
    let spanNode1;
    let spanNode2;
    let imageContainer;
    if (nodeType === 'image') {
      spanNode1 = document.createElement('div');
      spanNode1.className = 'image-container';
      spanNode1.contentEditable = 'false';
      imageContainer = document.createElement('img');
      imageContainer.src = content;
      imageContainer.height = 60;
      spanNode1.appendChild(imageContainer);
      spanNode2 = document.createElement('span');
      spanNode2.innerHTML = ' ';
    }

    if (nodeType === 'collaborator') {
      spanNode1 = document.createElement('span');
      spanNode2 = document.createElement('span');
      spanNode1.className = 'at-text';
      spanNode1.innerHTML = `@${content.name}`;
      spanNode2.innerHTML = '&nbsp;';
    }

    let frag = document.createDocumentFragment();
    frag.appendChild(spanNode1);
    const lastNode = frag.appendChild(spanNode2);
    if (range) {
      range.insertNode(frag);
    } else {
      commentRef.current.appendChild(frag);
      range = selection.getRangeAt(0);
    }
    if (lastNode) {
      range = range.cloneRange();
      range.setStartAfter(lastNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    return range;
  };

  onSelectParticipant = ({ selection, range, participant, callBack, commentRef }) => {
    if (range) {
      // delete '@xxx';
      selection.removeAllRanges();
      selection.addRange(range);
      const textNode = range.startContainer;
      const atIndex = this.getAtIndexWithAnchorPosition(range.startOffset, textNode.data);
      if (atIndex > -1) {
        range.setStart(textNode, atIndex);
        range.setEnd(textNode, range.endOffset);
        range.deleteContents();
      }
    }
    let newRange = this.createHtmlElement({ selection, range, content: participant, nodeType: 'collaborator', commentRef });
    if (callBack) {
      callBack();
    }
    if (commentRef.current) {
      commentRef.current.focus();
    }
    return newRange;
  };

  /**
   * get the index of '@' from anchor position.
   * @param {*} anchorPosition '@text|anchor position|'
   * @param {*} text '@abc'
   * @returns index
   * e.g. '@abc|anchor position|' // 0
   *      '@123 @|anchor position| @abc' // 5
   */
  getAtIndexWithAnchorPosition = (anchorPosition, text) => {
    let atIndex = -1;
    for (let i = anchorPosition - 1; i > -1; i--) {
      if (text[i] === '@') {
        atIndex = i;
        break;
      }
    }
    return atIndex;
  };

  onPaste = (event, callBack) => {
    event.stopPropagation();
    let cliperData = getEventTransfer(event);
    if (cliperData.files) {
      let file = cliperData.files[0];
      let isImage = /image/i.test(file.type);
      if (isImage) {
        event.preventDefault();
        if (callBack) {
          callBack(cliperData.files);
        }
      }
    } else {
      event.preventDefault();
      let text = cliperData.text;
      if (document.queryCommandSupported('insertText')) {
        document.execCommand('insertText', false, text);
      } else {
        document.execCommand('paste', false, text);
      }
    }
  };
}

export const focusToCommentElement = (editor, element) => {
  const path = findPath(editor, element);
  const endOfFirstNode = Editor.end(editor, path);
  const startOfFirstNode = Editor.start(editor, path);
  const range = {
    anchor: [
      ELEMENT_TYPE.LIST_ITEM,
      ELEMENT_TYPE.ORDERED_LIST,
      ELEMENT_TYPE.UNORDERED_LIST,
    ].includes(element.type)
      ? startOfFirstNode
      : endOfFirstNode,
    focus: endOfFirstNode,
  };
  focusEditor(editor, range);
};

export const getCommentElementById = (elementId, editor) => {
  let element = null;
  const dom = document.querySelectorAll(`[data-id="${elementId}"]`)[0];
  if (dom) {
    const slateNode = ReactEditor.toSlateNode(editor, dom);
    if (slateNode) {
      element = slateNode;
    }
  }
  return element;
};

export const getEventClassName = (e) => {
  // svg mouseEvent event.target.className is an object
  if (!e || !e.target) return '';
  return e.target.getAttribute('class') || '';
};

export {
  CommentUtilities,
  createNotify,
  generatorNotificationKey,
};
