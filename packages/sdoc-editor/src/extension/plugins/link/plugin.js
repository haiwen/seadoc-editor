import { Transforms, Node, Editor, Range, Element, Text } from '@seafile/slate';
import isHotkey from 'is-hotkey';
import isUrl from 'is-url';
import { INTERNAL_EVENT } from '../../../constants';
import context from '../../../context';
import EventBus from '../../../utils/event-bus';
import { ELEMENT_TYPE, INSERT_POSITION, LINK, ORDERED_LIST, UNORDERED_LIST } from '../../constants';
import { getEditorString, getNodeType, getSelectedElems, getSelectedNodeByType } from '../../core';
import { isImage, isSameDomain } from '../../utils';
import { insertSdocFileLink } from '../sdoc-link/helpers';
import { insertWhiteboard } from '../whiteboard/helper';
import { genLinkNode, insertLink, isExdrawFile, isSdocFile } from './helpers';

const withLink = (editor) => {
  const { normalizeNode, isInline, insertData, insertFragment, onHotKeyDown, onCompositionStart } = editor;
  const newEditor = editor;

  // Rewrite isInline
  newEditor.isInline = elem => {
    const { type } = elem;
    if (type === LINK) {
      return true;
    }
    return isInline(elem);
  };

  newEditor.insertData = async (data) => {
    // Paste link content
    const text = data.getData('text/plain');
    // Internal link, insert sdoc file link
    if (isUrl(text) && !isImage(text)) {
      if (isSameDomain(text, context.getSetting('serviceUrl'))) {
        try {
          const res = await context.getLinkFilesInfo([text]);
          if (isSdocFile(res, text)) {
            const fileName = res.data.files_info[text].name;
            const fileUuid = res.data.files_info[text].file_uuid;
            insertSdocFileLink(editor, fileName, fileUuid);
          } else if (isExdrawFile(res, text)) {
            const fileName = res.data.files_info[text].name;
            const fileParentPath = res.data.files_info[text].parent_path;
            const filePath = fileParentPath + '/' + fileName;
            insertWhiteboard(editor, fileName, filePath);
          } else {
            const url = new URL(text);
            const linkedNodeId = url.hash.replace(/^#/, '');

            if (editor.selection && !Range.isCollapsed(editor.selection)) {
              const title = getEditorString(editor, editor.selection);
              insertLink(editor, title, text, INSERT_POSITION.CURRENT, null, linkedNodeId);
              return;
            }

            const params = new URLSearchParams(url.search);
            let link;
            if (params.get('from') === 'copy-block') {
              link = genLinkNode(text, text, linkedNodeId);
            } else {
              link = genLinkNode(text, text);
            }

            Transforms.insertNodes(newEditor, link);
          }
        } catch (err) {
          const link = genLinkNode(text, text);
          Transforms.insertNodes(newEditor, link);
        }
      } else {
        const link = genLinkNode(text, text);
        Transforms.insertNodes(newEditor, link);
      }
      // Void merging text from link
      const [, focusPath] = Editor.next(newEditor);
      const focusPoint = Editor.start(newEditor, focusPath);
      Transforms.select(newEditor, focusPoint);
      return;
    }
    insertData(data);
  };

  newEditor.insertFragment = (data) => {
    // Paste into link
    if (getSelectedNodeByType(newEditor, LINK)) {
      const fragments = data.slice(0).filter((item) => Node.string(item).length !== 0);
      // Prevent fragments containing list blocks
      if (fragments.length > 1 && fragments.some((item) => [ORDERED_LIST, UNORDERED_LIST].includes(item.type))) return;
      // Prevent multiple list-items in a single list block
      if (fragments.length === 1 && [ORDERED_LIST, UNORDERED_LIST].includes(fragments[0].type) && fragments[0].children.length > 1) return;
    }
    return insertFragment(data);
  };

  newEditor.onHotKeyDown = (e) => {
    if (isHotkey('mod+k', e)) {
      // Prevent edge behavior
      e.preventDefault();
      const { selection } = newEditor;
      const isCollapsed = Range.isCollapsed(selection);
      const eventBus = EventBus.getInstance();
      if (isCollapsed){
        eventBus.dispatch(INTERNAL_EVENT.INSERT_ELEMENT, { type: ELEMENT_TYPE.LINK, editor });
      } else {
        const [firstSelectedNode, ...restNodes] = getSelectedElems(newEditor);
        if (!firstSelectedNode || restNodes.length) return; // If select more than one node or not select any node, return
        const isSelectTextNodes = firstSelectedNode.children.some(node => Text.isText(node));
        if (!isSelectTextNodes) return;
        const selectContent = window.getSelection().toString();
        const replaceLinkNode = () => Editor.deleteBackward(editor, selection);
        eventBus.dispatch(INTERNAL_EVENT.INSERT_ELEMENT, { type: ELEMENT_TYPE.LINK, editor: newEditor, linkTitle: selectContent, handleSubmit: replaceLinkNode });
      }
    }
    return onHotKeyDown && onHotKeyDown(e);
  };

  // Rewrite normalizeNode
  newEditor.normalizeNode = ([node, path]) => {
    const type = getNodeType(node);
    if (type !== LINK) {
      // If the type is not link, perform default normalizeNode
      return normalizeNode([node, path]);
    }

    // If the link is empty, delete it
    const str = Node.string(node);
    if (str === '') {
      return Transforms.removeNodes(newEditor, { at: path });
    }

    return normalizeNode([node, path]);
  };

  newEditor.onCompositionStart = (e) => {
    const { selection } = editor;
    if (Range.isCollapsed(selection)) {
      const [LinkNodeEntry] = Editor.nodes(editor, {
        match: n => Element.isElement && n.type === LINK,
      });
      if (LinkNodeEntry) {
        e.preventDefault();
        return true;
      }
    }
    return onCompositionStart && onCompositionStart(e);
  };

  return newEditor;
};

export default withLink;
