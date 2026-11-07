import { normalizeWebUrl } from '../../../utils/url-utils';

// Share context is runtime-only; never store gateway URLs in the document.
export const getWhiteboardPreviewLink = (originalLink, serviceUrl, shareContext) => {
  const normalized = normalizeWebUrl(originalLink);
  if (!normalized) return '';
  const url = new URL(normalized);
  if (!shareContext) {
    if (/\/smart-link\/[-0-9a-f]{36}\/embed-link\/$/i.test(url.pathname)) {
      url.pathname = url.pathname.replace(/embed-link\/$/, '');
      url.searchParams.set('readonly', 'true');
      url.searchParams.set('filetype', 'Excalidraw');
    }
    return url.href;
  }
  const service = normalizeWebUrl(serviceUrl);
  if (!service || !shareContext.shareToken || !shareContext.sdocUuid) return '';
  const base = new URL(service);
  const prefix = `${base.pathname.replace(/\/$/, '')}/smart-link/`;
  if (url.origin !== base.origin || !url.pathname.startsWith(prefix)) return '';
  const match = url.pathname.slice(prefix.length).match(/^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/(?:embed-link\/)?$/i);
  if (!match) return '';
  const token = encodeURIComponent(shareContext.shareToken);
  const parent = encodeURIComponent(shareContext.sdocUuid);
  return `${service.replace(/\/$/, '')}/api/v2.1/share-links/${token}/seadoc/${parent}/whiteboards/${match[1].toLowerCase()}/preview/`;
};
