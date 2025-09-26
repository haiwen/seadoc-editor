import { Editor, Transforms, Range, Path } from '@seafile/slate';
import { ReactEditor } from '@seafile/slate-react';
import slugid from 'slugid';
import { CODE_BLOCK, CODE_LINE, ELEMENT_TYPE, INSERT_POSITION, LINK, LIST_ITEM, PARAGRAPH } from '../../constants';
import { getNodeType, getSelectedElems, getAboveNode, getEditorString, replaceNodeChildren, generateEmptyElement } from '../../core';

export const isMenuDisabled = (editor, readonly) => {
  if (readonly) return true;
  if (editor.selection == null) return true;

  const selectedElems = getSelectedElems(editor);
  const notMatch = selectedElems.some(elem => {
    const { type } = elem;
    if (editor.isVoid(elem)) return true;
    if ([CODE_BLOCK, CODE_LINE, LINK].includes(type)) return true;
    return false;
  });
  if (notMatch) return true; // disabled
  return false; // enable
};

export const checkLink = (url) => {
  if (url.indexOf('http') !== 0) {
    return true;
  }
  return false;
};

export const genLinkNode = (url, text, nodeId) => {
  const linkNode = {
    id: slugid.nice(),
    type: 'link',
    href: url,
    title: text,
    linked_id: nodeId || '',
    children: [{
      id: slugid.nice(),
      text: text || ''
    }],
  };
  return linkNode;
};

export const getLinkType = (editor) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => getNodeType(n) === LINK,
    universal: true,
  });

  if (!match) return PARAGRAPH;
  const [n] = match;

  return getNodeType(n);
};

export const insertLink = (editor, title, url, position = INSERT_POSITION.CURRENT, slateNode, linkedNodeId) => {
  if (position === INSERT_POSITION.CURRENT && isMenuDisabled(editor)) return;
  if (!title || (!url && !linkedNodeId)) return;

  let linkNode = genLinkNode(url, title);
  if (linkedNodeId) {
    linkNode = genLinkNode(url, title, linkedNodeId);
  }

  if (position === INSERT_POSITION.AFTER) {
    let path = Editor.path(editor, editor.selection);

    if (slateNode && slateNode?.type === LIST_ITEM) {
      path = ReactEditor.findPath(editor, slateNode);
      const nextPath = Path.next(path);
      Transforms.insertNodes(editor, linkNode, { at: nextPath });
      return;
    }

    const p = generateEmptyElement(ELEMENT_TYPE.PARAGRAPH);
    p.children[1] = linkNode;

    Transforms.insertNodes(editor, p, { at: [path[0] + 1] });
    return;
  }

  // Selection folded or not
  const { selection } = editor;
  if (selection == null) return;
  const isCollapsed = Range.isCollapsed(selection);
  if (isCollapsed) {
    Transforms.insertNodes(editor, linkNode);
    return;
  }
  const selectedText = Editor.string(editor, selection); // Selected text

  // If the selected text is different from the typed text, delete the text and insert the link
  if (selectedText !== title) {
    editor.deleteFragment();
    Transforms.insertNodes(editor, linkNode);
    return;
  }

  // If the selected text is the same as the entered text, only the link can be wrapped
  Transforms.wrapNodes(editor, linkNode, { split: true });
  Transforms.collapse(editor, { edge: 'end' });
};

export const updateLink = (editor, newText, newUrl, linkedNodeId) => {

  // Update children
  const linkAbove = getAboveNode(editor, { match: { type: LINK } });
  if (linkAbove) {
    const { href: oldUrl, title: oldText } = linkAbove[0] || {};
    if (linkedNodeId) {
      Transforms.setNodes(editor, { linked_id: linkedNodeId }, { at: linkAbove[1] });
      if (oldText !== newText) {
        Transforms.setNodes(editor, { title: newText }, { at: linkAbove[1] });
      }
    }
    if (!linkedNodeId && (oldUrl !== newUrl || oldText !== newText)) {
      Transforms.setNodes(editor, { href: newUrl, title: newText, linked_id: '' }, { at: linkAbove[1] });
    }
    upsertLinkText(editor, { text: newText });
    return true;
  }
};

export const upsertLinkText = (editor, { text }) => {
  const newLink = getAboveNode(editor, { match: { type: LINK } });
  if (newLink) {
    const [newLInkNode, newLinkPath] = newLink;
    if ((text && text.length) && text !== getEditorString(editor, newLinkPath)) {
      const firstText = newLInkNode.children[0];

      replaceNodeChildren(editor, {
        at: newLinkPath,
        nodes: { ...firstText, text },
        insertOptions: {
          select: true
        }
      });
    }
  }
};

export const unWrapLinkNode = (editor) => {
  if (editor.selection == null) return;

  const [nodeEntry] = Editor.nodes(editor, {
    match: n => getNodeType(n) === LINK,
  });

  // If the selection is not in a link node, it is disabled
  if (nodeEntry == null || nodeEntry[0] == null) return;

  // unlink
  Transforms.unwrapNodes(editor, {
    match: n => getNodeType(n) === LINK,
  });
};

export const isSdocFile = (res, url) => {
  const { data: { files_info } } = res;
  const fileInfo = files_info[url];
  const { is_dir, file_ext } = fileInfo || {};
  return !is_dir && file_ext === 'sdoc';
};

export const isWeChat = () => {
  let ua = window.navigator.userAgent.toLowerCase();
  let isWeChat = ua.match(/MicroMessenger/i) === 'micromessenger';
  let isEnterpriseWeChat = ua.match(/MicroMessenger/i) === 'micromessenger' && ua.match(/wxwork/i) === 'wxwork';
  return isEnterpriseWeChat || isWeChat;
};

export const getMenuPosition = (element, editor) => {
  if (!element) return {};
  const { top, left, width } = element.getBoundingClientRect();
  // top = top distance - menu height
  const menuTop = top - 42;
  // left = left distance - (menu width / 2) + (link with / 2)
  const menuLeft = left - (140 / 2) + (width / 2);

  let menuPosition = { top: menuTop, left: menuLeft };
  // topOffset: the editor container left-top distance with browser top
  if (editor.topOffset && menuPosition.top < editor.topOffset) {
    menuPosition['display'] = 'none';
  }
  return menuPosition;
};

export const isLinkToolBarActive = (editor) => {
  if (!editor.selection) return false;
  const [nodeEntry] = Editor.nodes(editor, {
    match: n => getNodeType(n) === LINK
  });
  if (nodeEntry) return true;
  return false;
};

export const isNodeInCurrentView = (domNode) => {
  const rect = domNode.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

export const parseHtmlString = (htmlString, targetType) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  let resultHtml;
  if (targetType == 'img') {
    resultHtml = [...doc.querySelectorAll('p:has(img)')].map(p => p.outerHTML);
  } else {
    resultHtml = [...doc.querySelectorAll(targetType)].map(html => html.outerHTML).join('');
  }

  return resultHtml;
};
