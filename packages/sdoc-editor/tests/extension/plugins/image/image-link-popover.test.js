import context from '../../../../src/context';
import { isInternalWebUrl } from '../../../../src/extension/plugins/image/link-helpers';
import { getFuzzyPageResults, getWikiPageLinkOptions, isValidWebUrl } from '../../../../src/extension/plugins/image/popover/image-link-popover/helpers';

describe('image link popover helpers', () => {
  describe('isValidWebUrl', () => {
    it.each([
      'https://seafile.com',
      'https://seafile.com/wiki?page=1#image',
      ' https://seafile.com/path ',
      'http://seafile.com',
      'HTTP://localhost:3000/path',
    ])('accepts a valid HTTP(S) URL: %s', (url) => {
      expect(isValidWebUrl(url)).toBe(true);
    });

    it.each([
      '',
      'seafile.com',
      'https://',
      'ftp://seafile.com',
      ['java', 'script:alert(1)'].join(''),
      'data:text/html,test',
    ])('rejects an invalid HTTP(S) URL: %s', (url) => {
      expect(isValidWebUrl(url)).toBe(false);
    });
  });

  describe('isInternalWebUrl', () => {
    beforeEach(() => {
      context.initSSRSettings({ serviceUrl: 'https://cloud.example.com' });
    });

    it('recognizes links from the current Seafile server', () => {
      expect(isInternalWebUrl('https://cloud.example.com/lib/repo-id/file/test.sdoc')).toBe(true);
    });

    it('does not classify links from another server as current internal links', () => {
      expect(isInternalWebUrl('https://other.example.com/lib/repo-id/file/test.sdoc')).toBe(false);
    });
  });

  describe('getFuzzyPageResults', () => {
    const pages = [
      { id: '1', name: 'Product Roadmap' },
      { id: '2', name: 'Development Logs' },
      { id: '3', name: 'New page', path: '/wiki-pages/deadbeef.sdoc' },
      { id: '4', name: '产品规划' },
    ];

    it('matches page names by subsequence', () => {
      const result = getFuzzyPageResults(pages, 'prd');
      expect(result.map(page => page.id)).toEqual(['1']);
    });

    it('matches only visible page names, not internal paths', () => {
      expect(getFuzzyPageResults(pages, 'de').map(page => page.id)).toEqual(['2']);
      expect(getFuzzyPageResults(pages, 'deadbeef')).toEqual([]);
      expect(getFuzzyPageResults(pages, '产品').map(page => page.id)).toEqual(['4']);
    });

    it('returns a limited stable page list for an empty query', () => {
      expect(getFuzzyPageResults(pages, '', 2).map(page => page.id)).toEqual(['1', '2']);
    });
  });

  describe('getWikiPageLinkOptions', () => {
    it('pins the linked page and removes it from the search results', () => {
      const pages = [
        { id: '1', name: 'Current link' },
        { id: '2', name: 'Another page' },
      ];

      const { linkedPage, pageResults, hasPageMatch } = getWikiPageLinkOptions(pages, 'current', '1');
      expect(linkedPage).toEqual(pages[0]);
      expect(pageResults).toEqual([]);
      expect(hasPageMatch).toBe(true);
    });

    it('does not treat a page with the same id from another wiki as the linked page', () => {
      const pages = [
        { id: 'same-id', name: 'Current wiki page', wikiRepoId: 'current-wiki' },
      ];

      const { linkedPage } = getWikiPageLinkOptions(pages, '', 'same-id', 'other-wiki');
      expect(linkedPage).toBeNull();
    });
  });
});
