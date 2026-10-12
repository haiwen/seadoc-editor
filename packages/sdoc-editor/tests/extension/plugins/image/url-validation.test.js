import context from '../../../../src/context';
import { isForbiddenImageUrl } from '../../../../src/extension/plugins/image/helpers';

describe('isForbiddenImageUrl', () => {
  afterEach(() => {
    context.initSSRSettings(null);
  });

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

  describe('IPv6', () => {
    it.each([
      ['http://[::1]/image.png', 'loopback'],
      ['http://[fe80::1]/image.png', 'link-local'],
      ['http://[FE80::ABCD]/image.png', 'link-local, mixed case'],
      ['http://[fc00::1]/image.png', 'unique-local'],
      ['http://[fd12:3456::1]/image.png', 'unique-local'],
      ['http://[::ffff:127.0.0.1]/image.png', 'IPv4-mapped loopback'],
      ['http://[::ffff:7f00:1]/image.png', 'IPv4-mapped loopback, hex form'],
      ['http://[::ffff:192.168.1.1]/image.png', 'IPv4-mapped private'],
      ['http://[::ffff:169.254.169.254]/image.png', 'IPv4-mapped link-local metadata'],
    ])('blocks %s (%s)', (url) => {
      expect(isForbiddenImageUrl(url)).toBe(true);
    });

    it.each([
      ['http://[2001:db8::1]/image.png', 'public documentation range'],
      ['http://[::ffff:8.8.8.8]/image.png', 'IPv4-mapped public address'],
    ])('allows %s (%s)', (url) => {
      expect(isForbiddenImageUrl(url)).toBe(false);
    });
  });

  describe('trusted server allowlist', () => {
    it('allows a private-network serviceUrl that matches the configured deployment origin', () => {
      context.initSSRSettings({ serviceUrl: 'http://192.168.1.50:8000' });

      expect(isForbiddenImageUrl('http://192.168.1.50:8000/file/images/auto-upload/1.png')).toBe(false);
    });

    it('allows a localhost serviceUrl that matches the configured deployment origin', () => {
      context.initSSRSettings({ serviceUrl: 'http://localhost:8000' });

      expect(isForbiddenImageUrl('http://localhost:8000/file/images/auto-upload/1.png')).toBe(false);
    });

    it('still blocks other private addresses that are not the configured serviceUrl', () => {
      context.initSSRSettings({ serviceUrl: 'http://192.168.1.50:8000' });

      expect(isForbiddenImageUrl('http://192.168.1.99/image.png')).toBe(true);
    });

    it('still blocks a mismatched port on the same host as serviceUrl', () => {
      context.initSSRSettings({ serviceUrl: 'http://localhost:8000' });

      expect(isForbiddenImageUrl('http://localhost:9999/image.png')).toBe(true);
    });

    it('applies the private-network blocklist when no serviceUrl is configured', () => {
      expect(isForbiddenImageUrl('http://127.0.0.1/image.png')).toBe(true);
    });
  });
});
