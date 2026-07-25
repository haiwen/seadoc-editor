import { createEditor } from '@seafile/slate';
import { ReactEditor } from '@seafile/slate-react';
import { drawHighlights, generateRangeWhenWrapLine } from '../../../../src/extension/plugins/search-replace/helper';

describe('search-replace highlight helper', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('handles a single-character range whose height differs in Safari', () => {
    const domRange = {};
    const rangeInfo = { height: 18 };
    jest.spyOn(ReactEditor, 'toDOMRange').mockReturnValue({
      getBoundingClientRect: () => rangeInfo,
    });

    const ranges = generateRangeWhenWrapLine({}, [0, 0], 2, 1, domRange, 16);

    expect(ranges).toEqual([{ rangeInfo, domRange }]);
  });

  it('draws a highlight located exactly on a canvas boundary', () => {
    const articleContainer = document.createElement('div');
    articleContainer.className = 'sdoc-article-container';
    articleContainer.getBoundingClientRect = () => ({ top: 0, left: 0 });

    const canvas = document.createElement('canvas');
    canvas.className = 'sdoc-find-search-highlight-canvas';
    const context = { clearRect: jest.fn(), fillRect: jest.fn() };
    canvas.getContext = jest.fn(() => context);

    const nextCanvas = document.createElement('canvas');
    nextCanvas.className = 'sdoc-find-search-highlight-canvas';
    const nextContext = { clearRect: jest.fn(), fillRect: jest.fn() };
    nextCanvas.getContext = jest.fn(() => nextContext);

    document.body.append(articleContainer, canvas, nextCanvas);

    drawHighlights(createEditor(), [[{
      rangeInfo: { x: 10, y: 5000, width: 10, height: 20 },
      domRange: null,
    }]], 0);

    expect(context.fillRect).not.toHaveBeenCalled();
    expect(nextContext.fillRect).toHaveBeenCalledWith(10, 0, 10, 20);
  });
});
