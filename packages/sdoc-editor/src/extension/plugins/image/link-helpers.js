import context from '../../../context';
import { getWikiUrl } from '../wiki-link/helpers';

export const normalizeWebUrl = (value = '') => {
  if (typeof value !== 'string') return '';

  const url = value.trim();
  if (!/^https?:\/\//i.test(url)) return '';

  try {
    const parsedUrl = new URL(url);
    return ['http:', 'https:'].includes(parsedUrl.protocol) && parsedUrl.hostname ? url : '';
  } catch (error) {
    return '';
  }
};

export const isValidWebUrl = (value = '') => Boolean(normalizeWebUrl(value));

export const isInternalWebUrl = (value = '') => {
  const url = normalizeWebUrl(value);
  const serviceUrl = context.getSetting('serviceUrl');
  if (!url || !serviceUrl) return false;

  try {
    return new URL(url).origin === new URL(serviceUrl).origin;
  } catch (error) {
    return false;
  }
};

export const isCurrentServerUrl = isInternalWebUrl;

export const getOnlyImageChild = (element) => {
  const meaningfulChildren = Array.from(element?.childNodes || []).filter((child) => {
    if (child.nodeType === 8) return false;
    return child.nodeType !== 3 || Boolean(child.textContent?.trim());
  });

  if (meaningfulChildren.length !== 1 || meaningfulChildren[0]?.nodeName !== 'IMG') return null;
  return meaningfulChildren[0];
};

export const getImageWikiPageUrl = (wikiId, pageId) => {
  if (!wikiId || !pageId) return '';
  const wikiUrl = getWikiUrl(wikiId, pageId, false);
  const serviceUrl = context.getSetting('serviceUrl');
  if (!serviceUrl) return wikiUrl;

  try {
    return new URL(wikiUrl, serviceUrl).toString();
  } catch (error) {
    return wikiUrl;
  }
};
