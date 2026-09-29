import { deserializeHtml, deserializePastedHtml, normalizePastedHtmlForCache } from '../../../../src/extension/plugins/html/helper';
import ImageCache from '../../../../src/extension/plugins/image/image-cache';
import { formatChildren } from '../../../core/utils';

const WECHAT_EMOTICON_BLOB_URL = 'blob:http://localhost/wechat-emoticon';

describe('deserialize image', () => {
  let wechatEmoticonFileUuid;

  beforeEach(() => {
    wechatEmoticonFileUuid = null;
    window.URL.createObjectURL = jest.fn(() => WECHAT_EMOTICON_BLOB_URL);
  });

  afterEach(() => {
    if (wechatEmoticonFileUuid) ImageCache.deleteImage(wechatEmoticonFileUuid);
  });

  it('degrades images without a source to unique empty text nodes', () => {
    const ret = deserializeHtml('<p>before<img /><img />after</p>');
    const children = ret[0].children;

    expect(formatChildren(ret)).toEqual([
      {
        type: 'paragraph',
        children: [
          { text: 'before' },
          { text: '' },
          { text: '' },
          { text: 'after' }
        ]
      }
    ]);
    expect(children.map(child => child.text).join('')).toBe('beforeafter');
    expect(children[1].id).toEqual(expect.any(String));
    expect(children[1].id).not.toBe('');
    expect(children[2].id).toEqual(expect.any(String));
    expect(children[2].id).not.toBe('');
    expect(children[1].id).not.toBe(children[2].id);
  });

  it('uploads a WeChat inline emoticon without keeping its data URL in the document or cache', () => {
    const html = '<p>before<img class="js_module_emoticon_img liteapp-emoticon__img" src="data:image/gif;base64,R0lGODlhAQABAIAAAAUEBA==" />after</p>';
    const content = deserializePastedHtml(html);
    const cacheHtml = normalizePastedHtmlForCache(html);
    const imageData = content[0].children[1].data;
    wechatEmoticonFileUuid = imageData.file_uuid;

    expect(JSON.stringify(content)).not.toContain('data:image/gif');
    expect(cacheHtml).not.toContain('data:image/gif');
    expect(wechatEmoticonFileUuid).toEqual(expect.any(String));
    expect(formatChildren(content)).toEqual([
      {
        type: 'paragraph',
        children: [
          { text: 'before' },
          {
            type: 'image',
            data: {
              src: WECHAT_EMOTICON_BLOB_URL,
              file_uuid: wechatEmoticonFileUuid,
            },
            children: [{ text: '' }]
          },
          { text: 'after' }
        ]
      }
    ]);
    expect(ImageCache.getImage(wechatEmoticonFileUuid)).toEqual(expect.objectContaining({
      name: 'wechat-emoticon.gif',
      type: 'image/gif',
    }));
  });

  it('uploads a WeChat inline emoticon when data-src is a data image', () => {
    const html = '<img class="js_module_emoticon_img liteapp-emoticon__img" src="https://example.com/placeholder.gif" data-src="data:image/gif;base64,R0lGODlhAQABAIAAAAUEBA==" />';
    const content = deserializePastedHtml(html);
    const cacheHtml = normalizePastedHtmlForCache(html);
    const imageData = content[0].children[0].data;
    wechatEmoticonFileUuid = imageData.file_uuid;

    expect(JSON.stringify(content)).not.toContain('data:image/gif');
    expect(cacheHtml).not.toContain('data:image/gif');
    expect(imageData).toEqual({
      src: WECHAT_EMOTICON_BLOB_URL,
      file_uuid: expect.any(String),
    });
  });

  it.each([
    [
      '[旺柴]',
      'https://res.wx.qq.com/t/wx_fed/we-emoji/res/assets/newemoji/Yellowdog.png',
      'before',
      'after',
    ],
    [
      '[捂脸]',
      '//res.wx.qq.com/t/wx_fed/we-emoji/res/assets/newemoji/2_05.png',
      'before',
      '',
    ],
    [
      '[抱拳]',
      '//res.wx.qq.com/t/wx_fed/we-emoji/res/assets/Expression/Expression_84@2x.png',
      '',
      'after',
    ],
    [
      '🎉',
      '//res.wx.qq.com/t/wx_fed/we-emoji/res/assets/newemoji/Party.png',
      'before',
      '',
    ],
  ])('replaces the WeChat emoji %s with its alt text', (alt, dataSrc, before, after) => {
    const html = `<p><span>${before}<img class="we-emoji" alt="${alt}" data-src="${dataSrc}" src="data:image/png;base64,placeholder" />${after}</span></p>`;

    expect(formatChildren(deserializePastedHtml(html))).toEqual([
      {
        type: 'paragraph',
        children: [{ text: `${before}${alt}${after}` }]
      }
    ]);
  });

  it('keeps a lookalike emoji image from another host', () => {
    const src = 'https://example.com/emoji.png';
    const html = `<img class="we-emoji" alt="[test]" src="${src}" />`;

    expect(formatChildren(deserializePastedHtml(html))).toEqual([
      {
        type: 'paragraph',
        children: [
          {
            type: 'image',
            data: { src },
            children: [{ text: '' }]
          }
        ]
      }
    ]);
  });

  it('keeps a regular inline data image', () => {
    const src = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
    const html = `<img src="${src}" />`;

    expect(normalizePastedHtmlForCache(html)).toContain(src);
    expect(formatChildren(deserializePastedHtml(html))).toEqual([
      {
        type: 'paragraph',
        children: [
          {
            type: 'image',
            data: { src },
            children: [{ text: '' }]
          }
        ]
      }
    ]);
  });

  it('keeps a WeChat avatar data image', () => {
    const src = 'data:image/svg+xml;base64,PHN2Zy8+';
    const html = `<img class="discuss_user_avatar private" src="${src}" />`;

    expect(formatChildren(deserializePastedHtml(html))).toEqual([
      {
        type: 'paragraph',
        children: [
          {
            type: 'image',
            data: { src },
            children: [{ text: '' }]
          }
        ]
      }
    ]);
  });

  it('uses the WeChat data-src instead of the placeholder src during paste', () => {
    const html = '<img data-src="//mmbiz.qpic.cn/original.jpg?wx_fmt=jpeg" src="data:image/svg+xml,placeholder" />';

    expect(formatChildren(deserializePastedHtml(html))).toEqual([
      {
        type: 'paragraph',
        children: [
          {
            type: 'image',
            data: { src: 'https://mmbiz.qpic.cn/original.jpg?wx_fmt=jpeg' },
            children: [{ text: '' }]
          }
        ]
      }
    ]);
  });

  it('keeps src for a non-WeChat data-src during paste', () => {
    const html = '<img data-src="https://example.com/lazy.jpg" src="https://example.com/current.jpg" />';

    expect(formatChildren(deserializePastedHtml(html))).toEqual([
      {
        type: 'paragraph',
        children: [
          {
            type: 'image',
            data: { src: 'https://example.com/current.jpg' },
            children: [{ text: '' }]
          }
        ]
      }
    ]);
  });
});
