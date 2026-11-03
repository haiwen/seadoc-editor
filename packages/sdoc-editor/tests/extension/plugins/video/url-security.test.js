/* eslint-disable no-script-url -- Regression tests intentionally exercise unsafe URL schemes. */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import AddVideoLinkDialog from '../../../../src/extension/plugins/video/dialog/add-video-link-dialog';
import * as videoHelpers from '../../../../src/extension/plugins/video/helpers';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

const providers = [
  ['youtube.com', '/watch?v=video_123-4', 'https://www.youtube.com/embed/video_123-4/?rel=0'],
  ['v.qq.com', '/x/cover/cover123/video123.html', 'https://v.qq.com/txp/iframe/player.html?vid=video123'],
  ['bilibili.com', '/video/BV123Abc', 'https://player.bilibili.com/player.html?bvid=BV123Abc&autoplay=0'],
  ['v.youku.com', '/v_show/id_XABC123==.html', 'https://player.youku.com/embed/XABC123=='],
];

describe('parseVideoLink URL security', () => {
  it.each(providers)('converts a supported %s video link', (host, path, expected) => {
    expect(videoHelpers.parseVideoLink(`https://${host}${path}`)).toBe(expected);
    expect(videoHelpers.parseVideoLink(`http://${host}${path}`)).toBe(expected);
    expect(videoHelpers.parseVideoLink(` HTTPS://${host.toUpperCase()}${path} `)).toBe(expected);
  });

  it.each([
    ['www.youtube.com', '/watch?v=video_123-4', providers[0][2]],
    ['m.youtube.com', '/watch?v=video_123-4', providers[0][2]],
    ['www.bilibili.com', '/video/BV123Abc?p=2', providers[2][2]],
  ])('accepts a supported subdomain: %s', (host, path, expected) => {
    expect(videoHelpers.parseVideoLink(`https://${host}${path}`)).toBe(expected);
  });

  describe.each(providers)('rejects a misleading %s substring', (host, path) => {
    it.each([
      (domain) => `${domain}.evil.test`,
      (domain) => `fake${domain}`,
      (domain) => `${domain}@evil.test`,
      (domain) => `evil.test/${domain}`,
    ])('rejects a forged hostname or path (%#)', (forge) => {
      expect(videoHelpers.parseVideoLink(`https://${forge(host)}${path}`)).toBe(false);
    });

    it('rejects a provider URL hidden in a query parameter', () => {
      expect(videoHelpers.parseVideoLink(`https://evil.test${path}?next=https://${host}${path}`)).toBe(false);
    });

    it.each(['javascript:', 'data:', 'ftp:', 'file:'])('rejects the %s protocol', (protocol) => {
      expect(videoHelpers.parseVideoLink(`${protocol}//${host}${path}`)).toBe(false);
    });
  });

  it.each([undefined, null, '', 123, {}, [], 'not a URL', 'https://[invalid', 'youtube.com/watch?v=123', '//youtube.com/watch?v=123'])('rejects invalid input without throwing: %p', (url) => {
    expect(videoHelpers.parseVideoLink(url)).toBe(false);
  });

  it.each([
    'https://youtube.com/watch',
    'https://v.qq.com/',
    'https://bilibili.com/',
    'https://v.youku.com/',
    'https://v.qq.com/?next=/video123.html',
    'https://bilibili.com/?next=/video/BV123Abc',
    'https://v.youku.com/#id_XABC123==.html',
  ])('rejects a missing video ID: %s', (url) => {
    expect(videoHelpers.parseVideoLink(url)).toBe(false);
  });

  it('encodes a YouTube video ID as a path segment', () => {
    expect(videoHelpers.parseVideoLink('https://youtube.com/watch?v=video%3Fautoplay%3D1%23fragment'))
      .toBe('https://www.youtube.com/embed/video%3Fautoplay%3D1%23fragment/?rel=0');
  });
});

describe('AddVideoLinkDialog validation', () => {
  let container;
  let root;
  let previousActEnvironment;
  let insertVideo;
  let closeDialog;
  let handleSubmit;

  beforeEach(() => {
    previousActEnvironment = global.IS_REACT_ACT_ENVIRONMENT;
    global.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    insertVideo = jest.spyOn(videoHelpers, 'insertVideo').mockImplementation(() => {});
    closeDialog = jest.fn();
    handleSubmit = jest.fn();
    act(() => root.render(<AddVideoLinkDialog editor={{}} closeDialog={closeDialog} handleSubmit={handleSubmit} />));
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    global.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
    jest.restoreAllMocks();
  });

  const submitLink = (url) => {
    const input = document.querySelector('#addVideoLink');
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, url);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    act(() => document.querySelector('.modal-footer .btn-primary').click());
  };

  it.each(['https://youtube.com.evil.test/watch?v=video123', 'https://youtube.com/watch'])('keeps the dialog open and reports an invalid link: %s', (url) => {
    submitLink(url);

    expect(document.querySelector('.alert').textContent).toBe('The_link_address_is_invalid');
    expect(insertVideo).not.toHaveBeenCalled();
    expect(handleSubmit).not.toHaveBeenCalled();
    expect(closeDialog).not.toHaveBeenCalled();
  });

  it('inserts a valid video and closes the dialog', () => {
    const url = 'https://www.youtube.com/watch?v=video123';
    submitLink(url);

    expect(insertVideo).toHaveBeenCalledWith({}, [{ name: url, isEmbeddableLink: true }], [url]);
    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(closeDialog).toHaveBeenCalledTimes(1);
  });
});
