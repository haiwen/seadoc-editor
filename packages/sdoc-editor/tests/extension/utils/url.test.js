/* eslint-disable no-script-url -- Regression tests intentionally exercise unsafe URL schemes. */
import { isSameDomain } from '../../../src/extension/utils';

describe('HTTP(S) same-origin comparison', () => {
  it.each([
    ['https://example.com/docs', 'https://example.com'],
    ['https://example.com/docs', 'https://example.com:443'],
    ['http://example.com/docs', 'http://example.com:80'],
    ['https://example.com/docs', 'https://EXAMPLE.COM'],
    ['https://EXAMPLE.COM:443/docs', 'https://example.com'],
    ['http://localhost:3000/docs', 'http://LOCALHOST:3000'],
    ['http://[::1]:3000/docs', 'http://[::1]:3000'],
  ])('recognizes %s and %s as the same origin', (currentUrl, targetUrl) => {
    expect(isSameDomain(currentUrl, targetUrl)).toBe(true);
    expect(isSameDomain(targetUrl, currentUrl)).toBe(true);
  });

  it.each([
    ['https://example.com/docs', 'https://other.example.com'],
    ['https://example.com/docs', 'https://example.com:8443'],
    ['https://example.com/docs', 'http://example.com'],
    ['https://example.com/docs', 'ftp://example.com'],
    ['https://example.com/docs', 'javascript://example.com'],
    ['https://example.com/docs', '//example.com'],
    ['https://example.com/docs', 'https://example.com:invalid'],
    ['https://example.com/docs', ''],
    ['https://example.com/docs', null],
    ['https://example.com/docs', undefined],
    ['', ''],
    [undefined, null],
  ])('rejects different origins or invalid URLs: %p and %p', (currentUrl, targetUrl) => {
    expect(isSameDomain(currentUrl, targetUrl)).toBe(false);
    expect(isSameDomain(targetUrl, currentUrl)).toBe(false);
  });
});
