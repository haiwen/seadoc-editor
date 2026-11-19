import React, { act } from 'react';
import fs from 'fs';
import path from 'path';
import { createRoot } from 'react-dom/client';
import Loading from '../../src/components/loading';
import { WIKI_EDITOR } from '../../src/constants';
import context from '../../src/context';
import MenuGroup from '../../src/extension/commons/menu/menu-group';
import Select from '../../src/extension/commons/select';
import LinkedPagesForm from '../../src/extension/plugins/link/dialog/add-link-dialog/select-forms/linked-page';
import LinkHover from '../../src/extension/plugins/link/hover';

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({ t: key => key })),
  withTranslation: () => Component => props => <Component {...props} t={key => key} />,
}));
jest.mock('@seafile/slate-react', () => ({
  ...jest.requireActual('@seafile/slate-react'),
  useReadOnly: () => false,
}));
jest.mock('../../src/components/tooltip', () => () => null);
jest.mock('../../src/extension/plugins/link/helpers', () => ({
  getElementHref: element => element.href,
  isNodeInCurrentView: () => true,
  isWeChat: () => false,
}));

describe('component styles when embedded in a host page', () => {
  let container;
  let host;
  let root;
  let previousActEnvironment;
  let styles;

  beforeEach(() => {
    previousActEnvironment = global.IS_REACT_ACT_ENVIRONMENT;
    global.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    host = document.createElement('div');
    document.body.append(container, host);
    root = createRoot(container);
    styles = [];
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    styles.forEach(style => style.remove());
    container.remove();
    host.remove();
    global.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
    jest.restoreAllMocks();
  });

  const loadStyle = relativePath => {
    const style = document.createElement('style');
    style.textContent = fs.readFileSync(path.resolve(__dirname, '../../src', relativePath), 'utf8');
    document.head.appendChild(style);
    styles.push(style);
    return style;
  };

  const render = async element => {
    await act(async () => root.render(element));
  };

  const click = async element => {
    await act(async () => element.dispatchEvent(new MouseEvent('click', { bubbles: true })));
  };

  it('styles a standalone loading indicator without styling a host loading page', async () => {
    const style = loadStyle('components/loading/style.css');
    host.innerHTML = '<div class="empty-loading-page"><div class="lds-ripple page-centered"><div></div></div></div>';
    await render(<Loading />);

    const indicator = container.firstElementChild.firstElementChild;
    expect(getComputedStyle(indicator).width).toBe('64px');
    expect(getComputedStyle(host.firstElementChild).position).not.toBe('fixed');
    expect(getComputedStyle(host.querySelector('.lds-ripple')).width).not.toBe('64px');
    const animationName = getComputedStyle(indicator.firstElementChild).animation.split(' ')[0];
    expect(animationName.startsWith('sdoc-')).toBe(true);
    expect(Array.from(style.sheet.cssRules).some(rule => rule.name === animationName)).toBe(true);
  });

  it('styles the shared menu without changing a host menu group', async () => {
    loadStyle('extension/commons/menu/menu.css');
    host.innerHTML = '<div class="menu-group">Host menu</div>';
    await render(<MenuGroup>Editor menu</MenuGroup>);

    expect(getComputedStyle(container.querySelector('[role="group"]')).display).toBe('flex');
    expect(getComputedStyle(host.firstElementChild).display).not.toBe('flex');
  });

  it('keeps select options styled and selectable without changing a host selector', async () => {
    loadStyle('extension/commons/select/style.css');
    host.innerHTML = '<div class="select-container">Host selector</div>';
    const onChange = jest.fn();
    const options = [{ value: 'first', label: 'First' }, { value: 'second', label: 'Second' }];
    await render(<Select options={options} onChange={onChange} placeholder="Choose" />);
    const selector = container.firstElementChild;
    expect(getComputedStyle(selector).display).toBe('inline-block');
    expect(getComputedStyle(host.firstElementChild).display).not.toBe('inline-block');

    await click(selector.firstElementChild);
    const optionLabel = Array.from(selector.querySelectorAll('span')).find(element => element.childElementCount === 0 && element.textContent === 'Second');
    expect(getComputedStyle(optionLabel.parentElement).height).toBe('32px');
    await click(optionLabel);
    expect(onChange).toHaveBeenCalledWith(options[1]);
    expect(selector.textContent).toBe('Second');
  });

  it('styles the empty Wiki page search result without styling host messages', async () => {
    loadStyle('extension/plugins/link/dialog/add-link-dialog/select-forms/linked-page.css');
    host.innerHTML = '<div class="no-search-result">Host message</div>';
    jest.spyOn(context, 'getSetting').mockReturnValue({ pages: [], navigation: [] });
    await render(<LinkedPagesForm editor={{ editorType: WIKI_EDITOR }} />);
    await click(container.querySelector('.form-control'));
    const input = container.querySelector('input');
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'missing');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => input.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', keyCode: 13, bubbles: true })));

    const result = Array.from(container.querySelectorAll('div')).find(element => element.childElementCount === 0 && element.textContent === 'No_page_results');
    expect(result).toBeDefined();
    expect(getComputedStyle(result).display).toBe('flex');
    expect(getComputedStyle(host.firstElementChild).display).not.toBe('flex');
  });

  it('keeps a body Portal menu styled and its edit action connected', async () => {
    loadStyle('extension/plugins/link/hover/index.css');
    host.innerHTML = '<div class="link-op-menu">Host link menu</div>';
    const onEditLink = jest.fn();
    await render(<LinkHover editor={{}} element={{ href: 'https://example.com' }} menuPosition={{ top: 10, left: 20 }} onEditLink={onEditLink} />);

    const menu = document.getElementById('link-op-menu');
    expect(menu.parentElement).toBe(document.body);
    expect(container.contains(menu)).toBe(false);
    expect(getComputedStyle(menu).height).toBe('40px');
    expect(getComputedStyle(host.firstElementChild).height).not.toBe('40px');
    await click(document.getElementById('edit-link'));
    expect(onEditLink).toHaveBeenCalledTimes(1);
  });
});
