import { Transforms, Path, Editor, Range } from '@seafile/slate';
import toaster from '../../../components/toast';
import { INTERNAL_EVENT } from '../../../constants';
import context from '../../../context';
import { getErrorMsg } from '../../../utils/common-utils';
import { getSlateFragmentAttribute } from '../../../utils/document-utils';
import EventBus from '../../../utils/event-bus';
import { INSERT_POSITION, CLIPBOARD_FORMAT_KEY, CLIPBOARD_ORIGIN_SDOC_KEY, IMAGE, IMAGE_BLOCK, PARAGRAPH, ELEMENT_TYPE, MULTI_COLUMN, CALL_OUT, BLOCKQUOTE } from '../../constants';
import { focusEditor, generateEmptyElement, getLastChildPath, getSelectedNodeEntryByType, isFirstChild, isSelectionAtBlockStart, isEmptyArticle, getNode } from '../../core';
import { insertImage, hasSdocImages, getImageData, queryCopyMoveProgressView, resetCursor, isInsertImageMenuDisabled, getSingleImageFromFragment, removeImageBlockNode, generateImageInfos } from './helpers';

const withImage = (editor) => {
  const { isInline, isVoid, insertData, deleteBackward, insertFragment, insertBreak } = editor;
  const newEditor = editor;

  // rewrite isInline
  newEditor.isInline = elem => {
    const { type } = elem;

    if (type === IMAGE) {
      return true;
    }

    return isInline(elem);
  };

  // rewrite isVoid
  newEditor.isVoid = elem => {
    const { type } = elem;

    if (type === IMAGE) {
      return true;
    }

    return isVoid(elem);
  };

  newEditor.insertData = (data) => {
    const fragment = data.getData(`application/${CLIPBOARD_FORMAT_KEY}`) || getSlateFragmentAttribute(data);
    const originSdocUuid = data.getData(`text/${CLIPBOARD_ORIGIN_SDOC_KEY}`);
    if (fragment && originSdocUuid) {
      const decoded = decodeURIComponent(window.atob(fragment));
      const fragmentData = JSON.parse(decoded);
      if (hasSdocImages(originSdocUuid, fragmentData)) {
        const imageData = getImageData(fragmentData);
        context.copyImage(originSdocUuid, imageData).then(res => {
          if (res.status === 200) {
            // Task_id is an empty character and is copied from the same database.
            if (res.data.task_id.length === 0) {
              // Reload image
              setTimeout(() => {
                const eventBus = EventBus.getInstance();
                eventBus.dispatch(INTERNAL_EVENT.RELOAD_IMAGE);
              }, 300);
            } else {
              queryCopyMoveProgressView(res.data.task_id);
            }
          }
        }).catch(error => {
          const errorMessage = getErrorMsg(error);
          toaster.danger(errorMessage);
        });
      }
    }

    if (data.types && data.types.includes('Files') && data.files[0].type.includes(IMAGE)) {
      const imgInfos = generateImageInfos(data.files);
      insertImage(newEditor, imgInfos, editor.selection, INSERT_POSITION.CURRENT);
      return;
    }
    insertData(data);
  };

  newEditor.insertFragment = (data) => {
    const singleImage = getSingleImageFromFragment(data);
    if (singleImage && isInsertImageMenuDisabled(editor)) {
      const path = Editor.path(editor, editor.selection);
      const nextPath = Path.next([path[0]]);

      const p = generateEmptyElement(ELEMENT_TYPE.PARAGRAPH);
      p.children = [singleImage];
      Transforms.insertNodes(editor, p, { at: nextPath });
      // There will be a space before and after the image
      const imagePath = [...nextPath, 1];
      focusEditor(editor, Path.next(imagePath));
      return;
    }
    if (singleImage) {
      resetCursor(newEditor);
    }
    return insertFragment(data);
  };

  newEditor.imageOnKeyDown = (e) => {
    if (e.keyCode === 13) {
      const [, imagePath] = getSelectedNodeEntryByType(editor, ELEMENT_TYPE.IMAGE);
      const nextPath = Path.next(imagePath);

      const parentPath = Path.parent(imagePath);
      const [parentNode] = Editor.node(editor, parentPath);

      if (parentNode.type === IMAGE_BLOCK) {
        const nextPath = Path.next(parentPath);
        const p = generateEmptyElement(PARAGRAPH);
        Transforms.insertNodes(editor, p, { at: nextPath });
        setTimeout(() => {
          focusEditor(editor, nextPath);
        }, 0);
        return;
      }

      if (Editor.hasPath(editor, nextPath)) {
        const nextSelection = {
          anchor: {
            offset: 0,
            path: nextPath
          },
          focus: {
            offset: 0,
            path: nextPath
          }
        };
        Transforms.setSelection(editor, nextSelection);
        return true;
      } else {
        const nextPath = Path.next(parentPath);
        const p = generateEmptyElement(PARAGRAPH);
        Transforms.insertNodes(editor, p, { at: nextPath });
        setTimeout(() => {
          focusEditor(editor, nextPath);
        }, 0);
      }
      return true;
    }
  };

  newEditor.deleteBackward = (unit) => {
    const { selection } = editor;
    if (!selection) return deleteBackward(unit);

    const point = Editor.before(editor, selection, { distance: 1 });
    if (!point) return deleteBackward(unit);

    if (!Range.isCollapsed(selection)) {
      return deleteBackward(unit);
    }

    if (isSelectionAtBlockStart(editor)) {
      const path = selection.anchor.path;
      if (isFirstChild(path)) {
        return deleteBackward(unit);
      }
      const beforePath = [path[0] - 1];
      const beforeBlock = Editor.node(editor, beforePath);
      if (beforeBlock && beforeBlock[0].type === IMAGE_BLOCK) {
        focusEditor(editor, [...beforePath, 1]);
        return;
      }
    }

    const imageBlock = getSelectedNodeEntryByType(editor, IMAGE_BLOCK);
    if (imageBlock) {
      const path = selection.anchor.path;
      const deletePath = [path[0]];

      // Delete image_block element in multi-column node
      const currentTopNode = getNode(editor, deletePath);
      const currentBlockNode = getNode(editor, path.slice(0, 3));
      // Image_block not in callout or blockquote
      if (currentTopNode.type === MULTI_COLUMN && ![CALL_OUT, BLOCKQUOTE].includes(currentBlockNode.type)) {
        removeImageBlockNode(editor, path.slice(0, 3));
        return;
      }
      // Image_block in callout or blockquote
      if (currentTopNode.type === MULTI_COLUMN && [CALL_OUT, BLOCKQUOTE].includes(currentBlockNode.type)) {
        removeImageBlockNode(editor, path.slice(0, 4));
        return;
      }
      Transforms.removeNodes(editor, { at: deletePath });

      if (isEmptyArticle(editor)) {
        const p = generateEmptyElement(ELEMENT_TYPE.PARAGRAPH);
        Transforms.insertNodes(editor, p, { at: [0] });
      }

      const prevPath = deletePath[0] === 0 ? deletePath : Path.previous(deletePath);
      const beforeEntry = Editor.node(editor, prevPath);
      const selectPath = getLastChildPath(beforeEntry);
      const endOfFirstNode = Editor.end(editor, selectPath);
      const range = {
        anchor: endOfFirstNode,
        focus: endOfFirstNode,
      };
      focusEditor(editor, range);
      return;
    }

    deleteBackward(unit);
  };

  newEditor.insertBreak = () => {
    const { selection } = editor;
    if (selection == null) return insertBreak();
    const path = Editor.path(editor, selection);
    const [node] = Editor.node(editor, [path[0]]);
    if (node.type === IMAGE_BLOCK) {
      const p = generateEmptyElement(PARAGRAPH);
      Transforms.insertNodes(editor, p, { at: [path[0] + 1] });
      focusEditor(editor, [path[0] + 1]);
      return;
    }
    insertBreak();
  };

  return newEditor;
};

export default withImage;
