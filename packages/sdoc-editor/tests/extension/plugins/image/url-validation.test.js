import { isForbiddenImageUrl } from '../../../../src/extension/plugins/image/helpers';

describe('isForbiddenImageUrl', () => {
  it.each([
    'http://localhost/image.png',
    'http://127.0.0.1/image.png',
    'http://169.254.169.254/latest/meta-data/',
    'http://10.0.0.5/image.png',
    'http://172.16.0.1/image.png',
    'http://192.168.1.1/image.png',
    'file:///etc/passwd',
    'not a url',
  ])('blocks %s', (url) => {
    expect(isForbiddenImageUrl(url)).toBe(true);
  });

  it.each([
    'https://example.com/image.png',
    'http://cdn.example.com/img.jpg',
  ])('allows %s', (url) => {
    expect(isForbiddenImageUrl(url)).toBe(false);
  });
});
