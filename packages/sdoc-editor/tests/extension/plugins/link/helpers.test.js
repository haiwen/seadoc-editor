/* eslint-disable no-script-url -- Regression tests intentionally exercise unsafe URL schemes. */
import {
  checkLink,
  decodeLinkUrl,
  genLinkNode,
  getLinkFileInfo,
  isCommonFile,
  isExdrawFile,
  isSdocFile,
} from '../../../../src/extension/plugins/link/helpers';

describe('link file info helpers', () => {
  const encodedUrl = 'https://example.com/f/repo/?p=%E4%B8%AD%E6%96%87';
  const decodedUrl = decodeURIComponent(encodedUrl);

  const createResponse = (file_ext) => ({
    data: {
      files_info: {
        [decodedUrl]: {
          file_ext,
          is_dir: false,
          file_uuid: 'file-uuid',
        },
      },
    },
  });

  it('decodes an encoded link before looking up file info', () => {
    const res = createResponse('sdoc');

    expect(decodeLinkUrl(encodedUrl)).toBe(decodedUrl);
    const fileInfo = getLinkFileInfo(res, encodedUrl);

    expect(fileInfo).toEqual(res.data.files_info[decodedUrl]);
    expect(isSdocFile(fileInfo)).toBe(true);
  });

  it('uses the decoded URL for all supported file types', () => {
    expect(isExdrawFile(getLinkFileInfo(createResponse('exdraw'), encodedUrl))).toBe(true);
    expect(isCommonFile(getLinkFileInfo(createResponse('pdf'), encodedUrl))).toBe(true);
  });

  it('falls back to the original URL when it cannot be decoded', () => {
    const url = 'https://example.com/f/repo/?p=%';
    const res = {
      data: {
        files_info: {
          [url]: { file_ext: 'sdoc', is_dir: false },
        },
      },
    };

    expect(decodeLinkUrl(url)).toBe(url);
    expect(isSdocFile(getLinkFileInfo(res, url))).toBe(true);
  });
});


describe('link URL validation', () => {
  it.each([
    'javascript://example.com/%0Avoid(document.body.dataset.ipd=1)',
    'httpx://example.com',
    'http-invalid',
    '//example.com',
    '',
    null,
  ])('flags unsafe or invalid links: %p', (url) => {
    expect(checkLink(url)).toBe(true);
    expect(genLinkNode(url, 'Caption').href).toBe('');
  });

  it('normalizes valid links when creating a node', () => {
    expect(checkLink(' HTTPS://EXAMPLE.COM ')).toBe(false);
    expect(genLinkNode(' HTTPS://EXAMPLE.COM ', 'Caption').href).toBe('https://example.com/');
  });

  it('keeps internal block and wiki identifiers without an external URL', () => {
    expect(genLinkNode('', 'Caption', 'block-id', 'page-id')).toMatchObject({
      href: '', linked_id: 'block-id', linked_wiki_page_id: 'page-id',
    });
  });
});
