/* eslint-disable no-script-url -- Regression tests intentionally exercise unsafe URL schemes. */
import { isValidWebUrl, normalizeWebUrl } from '../../src/utils/url-utils';

const payload = 'javascript://example.com/%0Avoid(document.body.dataset.ipd="executed")';

describe('HTTP(S) URL validation', () => {
  it.each([
    payload,
    'JaVaScRiPt://example.com/%0Aalert(1)',
    'java\nscript://example.com/%0Aalert(1)',
    'java\tscript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript://example.com',
    'file:///etc/passwd',
    'ftp://example.com',
    'httpx://example.com',
    '//example.com',
    '/docs',
    '#section',
    'example.com',
    'http:example.com',
    'https://',
    'https://example.com:invalid',
    'https://exa mple.com',
    '',
    '   ',
    null,
    undefined,
    123,
    {},
  ])('rejects unsafe or invalid input: %p', (value) => {
    expect(normalizeWebUrl(value)).toBe('');
    expect(isValidWebUrl(value)).toBe(false);
  });

  it.each([
    ['https://example.com/a?x=1#section', 'https://example.com/a?x=1#section'],
    ['http://localhost:3000', 'http://localhost:3000/'],
    ['https://192.168.1.2:8000/docs', 'https://192.168.1.2:8000/docs'],
    ['http://[::1]:3000/path', 'http://[::1]:3000/path'],
    ['https://intranet/docs', 'https://intranet/docs'],
    [' HTTPS://EXAMPLE.COM ', 'https://example.com/'],
    ['https://example.com/中文', 'https://example.com/%E4%B8%AD%E6%96%87'],
  ])('returns a normalized HTTP(S) URL: %s', (value, expected) => {
    expect(normalizeWebUrl(value)).toBe(expected);
    expect(isValidWebUrl(value)).toBe(true);
  });
});
