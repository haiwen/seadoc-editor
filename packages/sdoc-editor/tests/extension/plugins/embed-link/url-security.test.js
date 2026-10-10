/* eslint-disable no-script-url -- Regression tests intentionally exercise unsafe URL schemes. */
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { EMBED_LINK_SOURCE } from '../../../../src/extension/plugins/embed-link/constants';
import { renderEmbedLink } from '../../../../src/extension/plugins/embed-link/render-elem';
import { renderWhiteboard } from '../../../../src/extension/plugins/whiteboard/render-elem';

jest.mock('react-i18next', () => ({
  withTranslation: () => (Component) => Component,
  useTranslation: () => ({ t: (key) => key }),
}));
jest.mock('@seafile/slate-react', () => ({
  ...jest.requireActual('@seafile/slate-react'),
  useReadOnly: () => false,
  useSelected: () => true,
}));
jest.mock('../../../../src/hooks/use-scroll-context', () => {
  const scrollRef = { current: global.document.createElement('div') };
  return { useScrollContext: () => scrollRef };
});
jest.mock('../../../../src/extension/plugins/embed-link/hover-menu', () => ({
  __esModule: true,
  default: ({ openFullscreen }) => require('react').createElement('button', {
    className: 'test-open-fullscreen', onClick: openFullscreen,
  }),
}));
jest.mock('../../../../src/extension/plugins/whiteboard/hover-menu', () => ({
  __esModule: true,
  default: ({ openFullscreen }) => require('react').createElement('button', {
    className: 'test-open-fullscreen', onClick: openFullscreen,
  }),
}));

const payload = 'javascript://example.com/%0Avoid(document.body.dataset.ipd="executed")';

describe.each([
  ['embedded link', renderEmbedLink, 'seatable'],
  ['Figma embed', renderEmbedLink, EMBED_LINK_SOURCE.FIGMA],
  ['whiteboard', renderWhiteboard, null],
])('%s URL security', (name, render, linkType) => {
  let container;
  let root;
  let previousActEnvironment;
  let previousResizeObserver;

  const renderUrl = (link) => {
    act(() => root.render(render({
      attributes: {},
      children: [],
      element: { link, link_type: linkType, title: 'Caption' },
    }, {})));
  };

  beforeEach(() => {
    previousResizeObserver = global.ResizeObserver;
    global.ResizeObserver = jest.fn(() => ({ observe: jest.fn(), disconnect: jest.fn() }));
    previousActEnvironment = global.IS_REACT_ACT_ENVIRONMENT;
    global.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    jest.spyOn(window, 'open').mockImplementation(() => {});
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    global.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
    global.ResizeObserver = previousResizeObserver;
    jest.restoreAllMocks();
  });

  it.each([payload, 'data:text/html,test', 'httpx://example.com', null])('does not embed or open an unsafe URL: %p', (link) => {
    renderUrl(link);
    expect(container.querySelector('iframe')).toBeNull();
    act(() => container.querySelector('[scrolling]').dispatchEvent(
      new MouseEvent('dblclick', { bubbles: true, cancelable: true })
    ));
    expect(window.open).not.toHaveBeenCalled();
  });

  it('uses a normalized URL as the iframe source', () => {
    const link = linkType === EMBED_LINK_SOURCE.FIGMA
      ? ' HTTPS://WWW.FIGMA.COM/file/abc/demo '
      : ' HTTPS://EXAMPLE.COM ';
    const expected = linkType === EMBED_LINK_SOURCE.FIGMA
      ? 'https://embed.figma.com/file/abc/demo?embed-host=share'
      : 'https://example.com/';
    renderUrl(link);
    expect(container.querySelector('iframe').getAttribute('src')).toBe(expected);
  });

  it('removes both normal and full-screen iframes if the URL becomes unsafe', () => {
    renderUrl('https://embed.figma.com/file/abc/demo');
    act(() => container.querySelector('.test-open-fullscreen').dispatchEvent(
      new MouseEvent('click', { bubbles: true })
    ));
    expect(document.querySelectorAll('iframe')).toHaveLength(2);
    renderUrl(payload);
    expect(document.querySelectorAll('iframe')).toHaveLength(0);
  });

  it('removes an iframe if the document URL becomes unsafe', () => {
    renderUrl('https://embed.figma.com/file/abc/demo');
    expect(container.querySelector('iframe')).not.toBeNull();
    renderUrl(payload);
    expect(container.querySelector('iframe')).toBeNull();
  });
});
