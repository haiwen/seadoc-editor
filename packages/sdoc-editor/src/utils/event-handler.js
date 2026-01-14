import { Editor, Point, Range } from '@seafile/slate';
import isHotkey from 'is-hotkey';
import { INTERNAL_EVENT, WIKI_EDITOR } from '../constants';
import { ELEMENT_TYPE } from '../extension/constants';
import { getSelectedNodeByType } from '../extension/core/queries/';
import EventBus from '../utils/event-bus';
import { setOriginSdocKey } from './document-utils';

class EventProxy {

  constructor(editor) {
    this.editor = editor;
  }

  isAtEditorStart() {
    const { selection } = this.editor;
    if (!selection || !Range.isCollapsed(selection)) return false;

    const start = Editor.start(this.editor, []);
    return Point.equals(selection.anchor, start);
  }

  onKeyDown = (event) => {
    const editor = this.editor;

    if (editor.onHotKeyDown) {
      const isHandled = editor.onHotKeyDown(event);
      if (isHandled) return;
    }

    // Focus page title in wiki editor
    if (this.editor.editorType === WIKI_EDITOR && (isHotkey('left', event) || isHotkey('up', event)) && this.isAtEditorStart()) {
      event.preventDefault();
      const eventBus = EventBus.getInstance();
      eventBus.dispatch('wiki_editor_focus_page_title');
      return;
    }

    // bold
    if (isHotkey('mod+b', event)) {
      event.preventDefault();
      editor.toggleTextBold();
    }

    // italic
    if (isHotkey('mod+i', event)) {
      event.preventDefault();
      editor.toggleTextItalic();
    }

    // font scale
    if (isHotkey('opt+.', event)) {
      event.preventDefault();
      editor.increaseFontSize();
    }

    if (isHotkey('opt+,', event)) {
      event.preventDefault();
      editor.reduceFontSize();
    }

    // disable the default 'save page'
    if (isHotkey('mod+s', event)) {
      event.preventDefault();
    }

    // redo
    if (isHotkey('mod+y', event)) {
      event.preventDefault();
      const { history } = editor;
      if (history.redos.length === 0) {
        return false;
      }
      editor.redo();
    }

    // undo
    if (isHotkey('mod+z', event)) {
      event.preventDefault();
      const { history } = editor;
      if (history.undos.length === 0) {
        return false;
      }
      editor.undo();
    }

    if (isHotkey('tab', event) || isHotkey('shift+tab', event)) {
      editor.handleTab && editor.handleTab(event);
    }

    if (isHotkey('mod+p', event)) {
      event.preventDefault();
      const eventBus = EventBus.getInstance();
      eventBus.dispatch(INTERNAL_EVENT.ON_PRINT);
    }

    const node = getSelectedNodeByType(editor, ELEMENT_TYPE.TABLE);
    if (node) {
      this.editor.tableOnKeyDown(event);
    }

    const imageNode = getSelectedNodeByType(editor, ELEMENT_TYPE.IMAGE);
    if (imageNode) {
      this.editor.imageOnKeyDown(event);
    }
    if (getSelectedNodeByType(editor, ELEMENT_TYPE.CODE_BLOCK)) {
      this.editor.codeBlockOnKeyDown(event);
      const eventBus = EventBus.getInstance();
      eventBus.dispatch(INTERNAL_EVENT.HIDDEN_CODE_BLOCK_HOVER_MENU);
    }
  };

  onCopy = (event) => {
    if (this.editor.onCopy) this.editor.onCopy(event);
    setOriginSdocKey(event);
  };

  onCut = (event) => {
    setOriginSdocKey(event);
    if (this.editor.cut) {
      this.editor.cut(event);
    }
  };

  onPaste = (event) => {

  };

  onCompositionStart = (event) => {
    const editor = this.editor;
    if (editor.onCompositionStart) {
      const isHandled = editor.onCompositionStart(event);
      if (isHandled) return;
    }
  };
  onCompositionUpdate = (event) => {
    const editor = this.editor;
    if (editor.onCompositionUpdate) {
      const isHandled = editor.onCompositionUpdate(event);
      if (isHandled) return;
    }
  };

  onCompositionEnd = (event) => {
    const editor = this.editor;
    if (editor.onCompositionEnd) {
      const isHandled = editor.onCompositionEnd(event);
      if (isHandled) return;
    }
  };

}

export default EventProxy;
