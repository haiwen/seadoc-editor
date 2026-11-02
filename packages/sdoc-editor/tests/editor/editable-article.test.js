import React, { act } from 'react';
import { createEditor, Range, Transforms } from '@seafile/slate';
import { withReact } from '@seafile/slate-react';
import { createRoot } from 'react-dom/client';
import { WIKI_EDITOR } from '../../src/constants';
import EditableArticle from '../../src/editor/editable-article';
import { ScrollContext } from '../../src/hooks/use-scroll-context';

jest.mock('../../src/comment', () => () => null);
jest.mock('../../src/cursor/use-cursors', () => ({
  useCursors: () => ({ cursors: [] }),
}));
jest.mock('../../src/decorates', () => ({
  usePipDecorate: () => () => [],
}));
jest.mock('../../src/extension', () => ({
  renderElement: ({ attributes, children }) => <p {...attributes}>{children}</p>,
  renderLeaf: ({ attributes, children }) => <span {...attributes}>{children}</span>,
  ContextToolbar: () => null,
  SideToolbar: () => null,
}));
jest.mock('../../src/highlight', () => ({
  SetNodeToDecorations: () => null,
}));
jest.mock('../../src/layout', () => ({
  ArticleContainer: ({ children }) => children,
}));

describe.each([
  ['SeaDoc', undefined],
  ['Wiki', WIKI_EDITOR],
])('%s horizontal keyboard selection', (name, editorType) => {
  let container;
  let root;
  let editor;
  let previousActEnvironment;

  beforeEach(() => {
    previousActEnvironment = global.IS_REACT_ACT_ENVIRONMENT;
    global.IS_REACT_ACT_ENVIRONMENT = true;
    jest.spyOn(navigator, 'platform', 'get').mockReturnValue('Win32');
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    editor = withReact(createEditor());
    editor.editorType = editorType;
    editor.children = [
      { type: 'paragraph', children: [{ text: 'first paragraph' }] },
      { type: 'paragraph', children: [{ text: 'second paragraph' }] },
    ];
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    global.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
    jest.restoreAllMocks();
  });

  const renderAt = async (point) => {
    await act(async () => {
      Transforms.select(editor, point);
      root.render(
        <ScrollContext.Provider value={{ scrollRef: { current: { scrollTop: 0, clientHeight: 800, scroll: jest.fn() } } }}>
          <EditableArticle editor={editor} slateValue={editor.children} updateSlateValue={() => {}} showComment={false} />
        </ScrollContext.Provider>
      );
    });
    // jsdom does not implement isContentEditable, which Slate checks before handling keys.
    Object.defineProperty(container.querySelector('[contenteditable="true"]'), 'isContentEditable', { value: true });
  };

  const pressArrow = async (key, modifiers = {}) => {
    const event = new KeyboardEvent('keydown', {
      key,
      keyCode: key === 'ArrowLeft' ? 37 : 39,
      bubbles: true,
      cancelable: true,
      ...modifiers,
    });
    await act(async () => container.querySelector('[contenteditable="true"]').dispatchEvent(event));
    return event;
  };

  describe.each([false, true])('Ctrl modifier: %s', (ctrlKey) => {
    it.each([
      ['ArrowLeft', [0, 0], 6],
      ['ArrowRight', [0, 0], 6],
      ['ArrowLeft', [1, 0], 0],
      ['ArrowRight', [0, 0], 15],
    ])('preserves native Shift+%s selection from a caret at %s:%s', async (key, path, offset) => {
      await renderAt({ path, offset });
      const selection = editor.selection;
      expect(Range.isCollapsed(selection)).toBe(true);
      const move = jest.spyOn(Transforms, 'move');
      const select = jest.spyOn(Transforms, 'select');

      const event = await pressArrow(key, { shiftKey: true, ctrlKey });

      // jsdom does not perform native selection; the key must reach the browser unchanged.
      expect(event.defaultPrevented).toBe(false);
      expect(move).not.toHaveBeenCalled();
      expect(select).not.toHaveBeenCalled();
      expect(editor.selection).toEqual(selection);
    });
  });

  it.each([
    ['ArrowLeft', 5],
    ['ArrowRight', 7],
  ])('still moves the caret with an unmodified %s', async (key, offset) => {
    await renderAt({ path: [0, 0], offset: 6 });

    const event = await pressArrow(key);

    expect(event.defaultPrevented).toBe(true);
    expect(editor.selection).toEqual({
      anchor: { path: [0, 0], offset },
      focus: { path: [0, 0], offset },
    });
  });
});
