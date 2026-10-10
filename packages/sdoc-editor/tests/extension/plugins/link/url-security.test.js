/* eslint-disable no-script-url -- Regression tests intentionally exercise unsafe URL schemes. */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import toaster from '../../../../src/components/toast';
import LinkHover from '../../../../src/extension/plugins/link/hover';
import renderLink from '../../../../src/extension/plugins/link/render-elem';

jest.mock('react-i18next', () => ({
  withTranslation: () => (Component) => Component,
  useTranslation: () => ({ t: (key) => key }),
}));
jest.mock('@seafile/slate-react', () => ({
  ...jest.requireActual('@seafile/slate-react'),
  useReadOnly: () => true,
}));
jest.mock('../../../../src/components/toast', () => ({
  __esModule: true,
  default: { danger: jest.fn() },
}));
jest.mock('../../../../src/components/tooltip', () => () => null);

const payload = 'javascript://example.com/%0Avoid(document.body.dataset.ipd="executed")';
const createLink = (href, extra = {}) => {
  const component = renderLink({
    element: { type: 'link', href, children: [{ text: 'Caption' }], ...extra },
    children: ['Caption'],
    attributes: {},
    t: (key) => key,
  }, {}, true);
  return new component.type(component.props);
};

describe('link URL security at rendering and opening boundaries', () => {
  let container;
  let root;
  let previousActEnvironment;

  beforeEach(() => {
    previousActEnvironment = global.IS_REACT_ACT_ENVIRONMENT;
    global.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    jest.spyOn(window, 'open').mockImplementation(() => {});
    toaster.danger.mockClear();
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    global.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
    jest.restoreAllMocks();
  });

  it.each([payload, 'httpx://example.com', 'data:text/html,test'])('does not render an unsafe href: %s', (href) => {
    expect(createLink(href).render().props.children).toEqual(['Caption']);
  });

  it('renders a normalized HTTP(S) href', () => {
    const anchor = createLink(' HTTPS://EXAMPLE.COM ').render().props.children;
    expect(anchor.type).toBe('a');
    expect(anchor.props.href).toBe('https://example.com/');
  });

  it.each(['onOpenLink', 'onLinkClick'])('blocks an unsafe link via %s', (method) => {
    createLink(payload)[method]({ preventDefault: jest.fn(), ctrlKey: true });
    expect(window.open).not.toHaveBeenCalled();
    expect(toaster.danger).toHaveBeenCalledWith('The_link_is_invalid');
  });

  it.each(['onOpenLink', 'onLinkClick'])('opens the normalized URL via %s', (method) => {
    createLink(' HTTPS://EXAMPLE.COM ')[method]({ preventDefault: jest.fn(), ctrlKey: true });
    expect(window.open).toHaveBeenCalledWith('https://example.com/', '_blank', 'noopener,noreferrer');
  });

  it.each([
    [payload, null],
    [' HTTPS://EXAMPLE.COM ', 'https://example.com/'],
  ])('validates hover-menu navigation: %s', (href, expected) => {
    act(() => root.render(
      <LinkHover editor={{}} element={{ href }} menuPosition={{}} />
    ));
    act(() => document.querySelector('.link-op-menu-link').dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true, cancelable: true })
    ));

    if (expected) {
      expect(window.open).toHaveBeenCalledWith(expected, '_blank', 'noopener,noreferrer');
    } else {
      expect(window.open).not.toHaveBeenCalled();
      expect(toaster.danger).toHaveBeenCalledWith('The_link_is_invalid');
    }
  });
});
