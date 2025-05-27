import { Transforms, Editor, Node } from '@seafile/slate';
import copy from 'copy-to-clipboard';
import slugid from 'slugid';
import { CODE_BLOCK, CODE_LINE, INSERT_POSITION, PARAGRAPH, MULTI_COLUMN } from '../../constants';
import { getNodeType, getSelectedNodeByType, getSelectedElems, getSelectedNodeEntryByType, focusEditor } from '../../core';
import { getCalloutEntry } from '../callout/helper';
import { genCodeLangs } from './prismjs';

export const isMenuDisabled = (editor, readonly) => {
  if (readonly) return true;
  const { selection } = editor;
  if (selection === null) return true;

  if (getCalloutEntry(editor)) return true;

  const selectedElems = getSelectedElems(editor);

  const hasVoid = selectedElems.some(elem => editor.isVoid(elem));
  if (hasVoid) return true;

  const isMatch = selectedElems.every(elem => {
    const type = getNodeType(elem);
    if (type === PARAGRAPH) return true;
    return false;
  });
  if (isMatch) return false; // enable
  return true; // disable
};

export const getSelectCodeElem = (editor) => {
  const codeNode = getSelectedNodeByType(editor, CODE_BLOCK);
  if (codeNode == null) return null;
  return codeNode;
};

export const getCodeBlockNode = (language) => {
  const node = {
    id: slugid.nice(),
    type: CODE_BLOCK,
    language,
    style: { white_space: 'nowrap' }, // default nowrap
    children: [
      {
        id: slugid.nice(),
        type: CODE_LINE,
        children: [{ text: '', id: slugid.nice() }],
      },
    ],
  };
  return node;
};

export const changeToCodeBlock = (editor, language = '', position = INSERT_POSITION.CURRENT, isQuickMenu = false) => {
  if (!editor.selection) return;
  let strArr = []; // Summarizes the strings for the selected highest-level node
  const path = Editor.path(editor, editor.selection, { edge: 'start' });
  const newCodeBlockNode = getCodeBlockNode(language); // New code-block node

  // Insert after
  if (position === INSERT_POSITION.AFTER) {
    strArr = [''];
    newCodeBlockNode.children[0].children[0].text = strArr.join('\n');
    Transforms.insertNodes(editor, newCodeBlockNode, { mode: 'highest', at: [path[0] + 1] });
    Transforms.select(editor, [path[0] + 1, 0, 0]);
    return;
  }

  // Insert current
  if (position === INSERT_POSITION.CURRENT) {
    // Insert codeblock in multi_column
    const currentMultiColumnEntry = getSelectedNodeEntryByType(editor, MULTI_COLUMN);
    if (currentMultiColumnEntry) {
      const currentParagraphPath = editor.selection.anchor.path.slice(0, 3);
      const nodeEntry = Editor.node(editor, currentParagraphPath);
      if (nodeEntry) {
        strArr.push(Node.string(nodeEntry[0]));
      }
      Transforms.removeNodes(editor, { at: currentParagraphPath });
      newCodeBlockNode.children[0].children[0].text = strArr.join('\n');
      Transforms.insertNodes(editor, newCodeBlockNode, { at: currentParagraphPath });
      Transforms.select(editor, Editor.start(editor, currentParagraphPath));
      return;
    }
    // Select the plain text of the node
    const nodeEntries = Editor.nodes(editor, {
      match: n => editor.children.includes(n), // Matches the selected node at the highest level
      universal: true,
    });
    for (let nodeEntry of nodeEntries) {
      const [n] = nodeEntry;
      if (n) strArr.push(Node.string(n));
    }
    // Deletes the selected node at the highest level
    Transforms.removeNodes(editor, { mode: 'highest' });

    // Modify location
    const atPath = [path[0]];
    const atPoint = {
      anchor: { offset: 0, path: [path[0], 0, 0] },
      focus: { offset: 0, path: [path[0], 0, 0] }
    };
    // Insert new node
    newCodeBlockNode.children[0].children[0].text = strArr.join('\n');
    Transforms.insertNodes(editor, newCodeBlockNode, { mode: 'highest', at: atPath });
    queueMicrotask(() => {
      if (!isQuickMenu) {
        Transforms.select(editor, atPoint);
      } else {
        focusEditor(editor, atPoint);
      }
    });
  }
};

export const changeToPlainText = (editor) => {
  const elem = getSelectCodeElem(editor);
  if (elem == null) return;

  // Get code text
  const str = Node.string(elem);

  // Delete the highest level node, -> "the code-block node"
  Transforms.removeNodes(editor, { mode: 'highest' });

  // Insert p node
  const pList = str.split('\n').map(s => {
    return {
      id: elem.id,
      type: PARAGRAPH,
      children: [{ text: s, id: slugid.nice() }],
    };
  });
  Transforms.insertNodes(editor, pList, { mode: 'highest' });
};

export const setClipboardCodeBlockData = (value) => {
  // Insert text into the clipboard for use on other pages
  // Empty string cannot apply in `copy`
  const text = value.children.map(line => Node.string(line)).join('\n') || ' ';
  copy(text, {
    format: 'text/plain', onCopy: (data) => {
      // Set the sdoc editor to format the data
      data.setData('text/code-block', JSON.stringify(value));
    }
  });
};

export const deleteBackwardByLength = (editor, len) => {
  let i = len >= 4 ? 4 : len;
  while (i > 0) {
    Editor.deleteBackward(editor, 'word');
    i--;
  }
};

export const getSelectedLangOption = (lang) => {
  const langs = genCodeLangs();
  const selectedLangOption = langs.find(item => item.value === lang);
  return selectedLangOption || langs[0];
};

export const getValidLang = (lang) => {
  const langOption = getSelectedLangOption(lang);
  return langOption.value;
};
