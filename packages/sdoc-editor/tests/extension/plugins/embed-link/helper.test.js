import { EMBED_LINK_SOURCE } from '../../../../src/extension/plugins/embed-link/constants';
import { getEmbedLinkType, normalizeFigmaEmbedLink } from '../../../../src/extension/plugins/embed-link/helper';

describe('embed-link helper', () => {
  describe('getEmbedLinkType', () => {
    it('recognizes seatable.cn links', () => {
      expect(getEmbedLinkType('https://cloud.seatable.cn/workspace/12/dtable/abc')).toBe(EMBED_LINK_SOURCE.SEATABLE);
    });

    it('recognizes seatable.io links', () => {
      expect(getEmbedLinkType('https://cloud.seatable.io/workspace/12/dtable/abc')).toBe(EMBED_LINK_SOURCE.SEATABLE);
    });

    it('rejects unsupported seatable paths', () => {
      expect(getEmbedLinkType('https://cloud.seatable.io/dtable/abc')).toBeNull();
    });

    it('recognizes figma links', () => {
      expect(getEmbedLinkType('https://www.figma.com/file/abc/demo')).toBe(EMBED_LINK_SOURCE.FIGMA);
    });
  });

  describe('normalizeFigmaEmbedLink', () => {
    it('converts figma share links to embed links', () => {
      expect(normalizeFigmaEmbedLink('https://www.figma.com/file/abc/demo?t=token')).toBe('https://embed.figma.com/file/abc/demo?embed-host=share');
    });

    it('keeps existing embed links unchanged', () => {
      expect(normalizeFigmaEmbedLink('https://embed.figma.com/file/abc/demo?embed-host=share')).toBe('https://embed.figma.com/file/abc/demo?embed-host=share');
    });
  });
});
