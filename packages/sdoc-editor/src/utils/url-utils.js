// Only absolute HTTP(S) URLs may be opened or embedded in the editor.
export const normalizeWebUrl = (value = '') => {
  if (typeof value !== 'string') return '';

  const input = value.trim();
  if (!/^https?:\/\//i.test(input)) return '';

  try {
    const url = new URL(input);
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname) return '';
    return url.href;
  } catch (error) {
    return '';
  }
};

export const isValidWebUrl = (value = '') => Boolean(normalizeWebUrl(value));
