import { isImageUrlIsFromCopy, isWechatImageUrl } from '../../../../src/extension/plugins/image/helpers';

describe('WeChat image URL detection', () => {
  it('accepts only HTTPS URLs on the configured WeChat image hosts', () => {
    expect(isWechatImageUrl('https://mmbiz.qpic.cn/image.jpg')).toBe(true);
    expect(isWechatImageUrl('https://wx.qlogo.cn/avatar.jpg')).toBe(true);
    expect(isWechatImageUrl('https://res.wx.qq.com/emoji.png')).toBe(true);
    expect(isWechatImageUrl('http://mmbiz.qpic.cn/image.jpg')).toBe(false);
    expect(isWechatImageUrl('https://mmbiz.qpic.cn.evil.example/image.jpg')).toBe(false);
    expect(isWechatImageUrl('https://user:password@mmbiz.qpic.cn/image.jpg')).toBe(false);
    expect(isWechatImageUrl('https://mmbiz.qpic.cn:8443/image.jpg')).toBe(false);
    expect(isWechatImageUrl('https://example.com/image.jpg')).toBe(false);
  });

  it('expects protocol-relative URLs to be normalized at the input boundary', () => {
    const url = '//res.wx.qq.com/emoji.png';
    expect(isImageUrlIsFromCopy(url)).toBe(false);
    expect(isWechatImageUrl(url)).toBe(false);
  });
});
