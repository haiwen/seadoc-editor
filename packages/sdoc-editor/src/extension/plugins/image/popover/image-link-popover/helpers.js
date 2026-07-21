export { isValidWebUrl } from '../../link-helpers';

const normalizeText = (value = '') => value.normalize('NFKC').toLocaleLowerCase().trim();

const getFuzzyScore = (value, query) => {
  const normalizedValue = normalizeText(value);
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) return 0;
  if (normalizedValue === normalizedQuery) return 0;
  if (normalizedValue.startsWith(normalizedQuery)) return 1;

  const includedAt = normalizedValue.indexOf(normalizedQuery);
  if (includedAt > -1) return 2 + includedAt;

  let queryIndex = 0;
  let firstMatchIndex = -1;
  let previousMatchIndex = -1;
  let gapScore = 0;

  for (let valueIndex = 0; valueIndex < normalizedValue.length && queryIndex < normalizedQuery.length; valueIndex++) {
    if (normalizedValue[valueIndex] !== normalizedQuery[queryIndex]) continue;

    if (firstMatchIndex === -1) firstMatchIndex = valueIndex;
    if (previousMatchIndex > -1) gapScore += valueIndex - previousMatchIndex - 1;
    previousMatchIndex = valueIndex;
    queryIndex++;
  }

  if (queryIndex !== normalizedQuery.length) return null;
  return 100 + firstMatchIndex + gapScore;
};

export const getFuzzyPageResults = (pages = [], query = '', limit = 8) => {
  return pages
    .map((page, index) => {
      const nameScore = getFuzzyScore(page?.name, query);
      return {
        page,
        index,
        score: nameScore,
      };
    })
    .filter(item => item.page?.id && item.score !== null)
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .slice(0, limit)
    .map(item => item.page);
};

export const getWikiPageLinkOptions = (pages = [], query = '', linkedPageId = '', linkedWikiId = '', limit = 8) => {
  const isLinkedPage = (page) => {
    return page?.id === linkedPageId && (!linkedWikiId || page?.wikiRepoId === linkedWikiId);
  };
  const linkedPage = pages.find(isLinkedPage) || null;
  const searchablePages = linkedPage ? pages.filter(page => !isLinkedPage(page)) : pages;
  const pageResults = getFuzzyPageResults(searchablePages, query, limit);
  const isLinkedPageMatched = Boolean(linkedPage && getFuzzyPageResults([linkedPage], query, 1).length);
  return {
    linkedPage,
    pageResults,
    hasPageMatch: isLinkedPageMatched || pageResults.length > 0,
  };
};
