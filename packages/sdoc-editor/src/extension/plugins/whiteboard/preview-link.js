import { normalizeWebUrl } from '../../../utils/url-utils';

// Share context is runtime-only; never store gateway URLs in the document.
export const getWhiteboardPreviewLink = (originalLink, serviceUrl, shareContext) => {
  const normalized = normalizeWebUrl(originalLink);
  if (!normalized) return '';
  const url = new URL(normalized);
  if (!shareContext) return url.href;
  const service = normalizeWebUrl(serviceUrl);
  if (!service || !shareContext.shareToken || !shareContext.sdocUuid) return '';
  const base = new URL(service);
  const prefix = `${base.pathname.replace(/\/$/, '')}/smart-link/`;
  if (url.origin !== base.origin || !url.pathname.startsWith(prefix)) return '';
  const match = url.pathname.slice(prefix.length).match(/^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/$/i);
  if (!match) return '';
  const token = encodeURIComponent(shareContext.shareToken);
  const parent = encodeURIComponent(shareContext.sdocUuid);
  return `${service.replace(/\/$/, '')}/smart-link/${match[1].toLowerCase()}/share/${token}/?sdoc_uuid=${parent}`;
};
