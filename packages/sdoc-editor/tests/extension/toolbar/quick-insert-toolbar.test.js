import React, { act } from 'react';
import { createEditor, Transforms } from '@seafile/slate';
import { Slate, withReact } from '@seafile/slate-react';
import { createRoot } from 'react-dom/client';
import { Simulate } from 'react-dom/test-utils';
import QuickInsertBlockMenu from '../../../src/extension/toolbar/quick-insert-toolbar';
import EventBus from '../../../src/utils/event-bus';

jest.mock('react-i18next', () => {
  const t = (key) => key;
  return {
    useTranslation: () => ({ t }),
    withTranslation: () => (Component) => Component,
  };
});

describe('Quick insert search', () => {
  let container;
  let root;
  let input;
  let onInsert;
  let previousActEnvironment;

  beforeEach(async () => {
    jest.useFakeTimers();
    previousActEnvironment = global.IS_REACT_ACT_ENVIRONMENT;
    global.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    onInsert = jest.fn();
    const editor = withReact(createEditor());
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    Transforms.select(editor, { path: [0, 0], offset: 0 });
    await act(async () => {
      root.render(
        <Slate editor={editor} value={editor.children} onChange={() => {}}>
          <QuickInsertBlockMenu slateNode={editor.children[0]} callback={onInsert} handleClosePopover={() => {}} />
        </Slate>
      );
    });
    input = container.querySelector('input');
    await act(async () => jest.runOnlyPendingTimers());
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    jest.clearAllTimers();
    jest.useRealTimers();
    container.remove();
    global.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
    jest.restoreAllMocks();
  });

  const clearButton = () => container.querySelector('.sdoc-quick-insert-clear-search');
  const visibleItems = () => container.querySelectorAll('.sdoc-side-menu-inner-container > :not(.sdoc-dropdown-menu-item-hidden)');
  const changeSearch = async (value) => {
    await act(async () => {
      input.value = value;
      Simulate.change(input);
    });
    await act(async () => jest.runOnlyPendingTimers());
  };

  const pressKey = async (key, keyCode) => {
    const event = new KeyboardEvent('keydown', { key, keyCode, bubbles: true, cancelable: true });
    await act(async () => input.dispatchEvent(event));
    await act(async () => jest.runOnlyPendingTimers());
    return event;
  };

  it('keeps search focused while navigating and allows immediate filtering and Enter confirmation', async () => {
    expect(document.activeElement).toBe(input);
    await pressKey('ArrowDown', 40);
    expect(document.activeElement).toBe(input);
    expect(container.querySelectorAll('.sdoc-dropdown-item-selected')).toHaveLength(1);
    await pressKey('ArrowDown', 40);
    expect(document.activeElement).toBe(input);
    await pressKey('ArrowUp', 38);
    expect(document.activeElement).toBe(input);
    await changeSearch('link');
    expect(visibleItems()).toHaveLength(2);
    await pressKey('ArrowDown', 40);
    expect(document.activeElement).toBe(input);
    await pressKey('Enter', 13);
    expect(onInsert).toHaveBeenCalledTimes(1);
  });

  it('retains focus and highlighting when navigation wraps within one result', async () => {
    await changeSearch('video');
    for (const [key, keyCode] of [['ArrowDown', 40], ['ArrowUp', 38]]) {
      await pressKey(key, keyCode);
      expect(document.activeElement).toBe(input);
      expect(container.querySelectorAll('.sdoc-dropdown-item-selected')).toHaveLength(1);
    }
  });

  it('does not intercept menu navigation or confirmation during IME composition', async () => {
    await changeSearch('link');
    const selectedItem = container.querySelector('.sdoc-dropdown-item-selected');
    await act(async () => Simulate.compositionStart(input));
    for (const [key, keyCode] of [['ArrowDown', 40], ['ArrowUp', 38], ['Enter', 13]]) {
      const event = await pressKey(key, keyCode);
      expect(event.defaultPrevented).toBe(false);
      expect(document.activeElement).toBe(input);
      expect(container.querySelector('.sdoc-dropdown-item-selected')).toBe(selectedItem);
    }
    expect(onInsert).not.toHaveBeenCalled();
  });

  it.each(['video', 'no-matching-menu'])('clears "%s", restores all items and keeps focus without an outside click', async (search) => {
    const initialCount = visibleItems().length;
    expect(clearButton()).toBeNull();
    await changeSearch(search);
    expect(clearButton()).not.toBeNull();
    expect(visibleItems().length).toBeLessThan(initialCount);
    const outsideClick = jest.fn();
    document.addEventListener('click', outsideClick);
    const scrollContainer = container.querySelector('.sdoc-insert-element-content-wrapper');
    scrollContainer.scrollTop = 100;
    try {
      await act(async () => clearButton().click());
      await act(async () => jest.runOnlyPendingTimers());
      expect(input.value).toBe('');
      expect(clearButton()).toBeNull();
      expect(visibleItems()).toHaveLength(initialCount);
      expect(container.querySelector('.sdoc-dropdown-menu-item-no-results')).toBeNull();
      expect(container.querySelector('.sdoc-dropdown-item-selected')).toBeNull();
      expect(scrollContainer.scrollTop).toBe(0);
      expect(document.activeElement).toBe(input);
      expect(outsideClick).not.toHaveBeenCalled();
    } finally {
      document.removeEventListener('click', outsideClick);
    }
    await changeSearch('video');
    expect(visibleItems()).toHaveLength(1);
  });

  describe.each(['clearing', 'changing'])('%s search', (action) => {
    it.each([
      { name: 'video', search: 'video', enterCount: 1, selector: '.sdoc-quick-insert-video-menu-popover .popover.show' },
      { name: 'table', search: 'table', enterCount: 1, selector: '.sdoc-selected-table-size-popover.show' },
      { name: 'table template', search: 'table', enterCount: 2, selector: '.sdoc-table-template-popover' },
    ])('closes the $name submenu and restores main menu keyboard actions', async ({ search, enterCount, selector }) => {
      const dispatch = jest.spyOn(EventBus.getInstance(), 'dispatch');
      await changeSearch(search);
      for (let i = 0; i < enterCount; i++) {
        await pressKey('Enter', 13);
      }
      expect(document.querySelector(selector)).not.toBeNull();

      if (action === 'clearing') {
        await act(async () => clearButton().click());
        await act(async () => jest.runOnlyPendingTimers());
      } else {
        await changeSearch('image');
      }
      expect(document.querySelector('.sdoc-quick-insert-video-menu-popover .popover.show')).toBeNull();
      expect(document.querySelector('.sdoc-selected-table-size-popover.show')).toBeNull();
      expect(document.querySelector('.sdoc-table-template-popover')).toBeNull();
      expect(document.activeElement).toBe(input);
      expect(onInsert).not.toHaveBeenCalled();
      expect(dispatch).not.toHaveBeenCalled();
      if (action === 'clearing') {
        expect(input.value).toBe('');
        expect(container.querySelector('.sdoc-dropdown-item-selected')).toBeNull();
        await pressKey('Enter', 13);
        expect(onInsert).not.toHaveBeenCalled();
        expect(dispatch).not.toHaveBeenCalled();
      }

      await changeSearch(search);
      for (let i = 0; i < enterCount; i++) {
        await pressKey('Enter', 13);
      }
      expect(document.querySelector(selector)).not.toBeNull();
      await changeSearch('image');
      await pressKey('Enter', 13);
      expect(onInsert).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith('insert_element', expect.objectContaining({ type: 'local-image' }));
    });
  });

  it('updates the controlled input during composition and filters after composition ends', async () => {
    const initialCount = visibleItems().length;
    await act(async () => Simulate.compositionStart(input));
    await changeSearch('表格');
    expect(input.value).toBe('表格');
    expect(clearButton()).not.toBeNull();
    expect(visibleItems()).toHaveLength(initialCount);
    await act(async () => Simulate.compositionEnd(input));
    expect(container.querySelector('.sdoc-dropdown-menu-item-no-results')).not.toBeNull();
    await changeSearch('');
    expect(clearButton()).toBeNull();
    expect(visibleItems()).toHaveLength(initialCount);
  });

  it.each(['Enter', ' '])('keeps the clear button keyboard action "%s" out of menu navigation', async (key) => {
    await changeSearch('video');
    const event = new KeyboardEvent('keydown', { key, keyCode: key === 'Enter' ? 13 : 32, bubbles: true, cancelable: true });
    const menuKeyDown = jest.fn();
    document.addEventListener('keydown', menuKeyDown);
    try {
      await act(async () => clearButton().dispatchEvent(event));
      expect(event.defaultPrevented).toBe(false);
      expect(menuKeyDown).not.toHaveBeenCalled();
    } finally {
      document.removeEventListener('keydown', menuKeyDown);
    }
  });
});
