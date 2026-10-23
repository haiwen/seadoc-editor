import { getThemedTextColor } from '../../src/extension/plugins/text-style/helpers';

describe('getThemedTextColor', () => {
  it.each([
    '#333',
    '#333333',
    '#333333 ',
    'rgb(51, 51, 51)',
    'rgba(51,51,51,1)',
  ])('themes the legacy default color %p without losing it as the fallback', (color) => {
    expect(getThemedTextColor(color)).toBe(`var(--bs-document-text-color, ${color})`);
  });

  it.each([
    '#000000',
    '#212529',
    '#3333',
    'rgba(51, 51, 51, 0.5)',
    'red',
  ])('keeps a user-selected color %p unchanged', (color) => {
    expect(getThemedTextColor(color)).toBe(color);
  });

  it('keeps non-string values unchanged', () => {
    expect(getThemedTextColor(undefined)).toBeUndefined();
  });
});
