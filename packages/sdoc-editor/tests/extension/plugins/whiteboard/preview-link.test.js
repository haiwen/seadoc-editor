import { getWhiteboardPreviewLink } from '../../../../src/extension/plugins/whiteboard/preview-link';

const service = 'https://seafile.example.com/seafile';
const uuid = '11111111-2222-4333-8444-555555555555';
const internal = `${service}/smart-link/${uuid}/?readonly=true&filetype=Excalidraw`;
const share = { shareToken: 'abcd1234', sdocUuid: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee' };

describe('whiteboard share preview routing', () => {
  it('preserves the original protected internal link', () => {
    expect(getWhiteboardPreviewLink(internal, service, null)).toBe(internal);
  });

  it('uses the share gateway without storing a token in the node', () => {
    expect(getWhiteboardPreviewLink(internal, service, share)).toBe(
      `${service}/smart-link/${uuid}/share/${share.shareToken}/?sdoc_uuid=${share.sdocUuid}`);
  });

  it.each([
    internal.replace('seafile.example.com', 'evil.example.com'),
    `${service}/smart-link/not-a-uuid/`,
    `${service}/lib/${uuid}/file/board.exdraw`,
    'javascript:alert(1)',
  ])('does not fall back to an untrusted share target', link => {
    expect(getWhiteboardPreviewLink(link, service, share)).toBe('');
  });
});
