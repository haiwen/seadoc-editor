import { formatSeadocVideoSizeLimit, SEADOC_VIDEO_SIZE_LIMIT } from '../../../../../src/extension/plugins/video/constants';

describe('SEADOC_VIDEO_SIZE_LIMIT', () => {
  it('uses a fixed default limit of 100 MB', () => {
    expect(SEADOC_VIDEO_SIZE_LIMIT).toBe(100 * 1024 * 1024);
  });
});

describe('formatSeadocVideoSizeLimit', () => {
  it('formats the default limit with a readable binary unit', () => {
    expect(formatSeadocVideoSizeLimit()).toBe('100 MB');
    expect(formatSeadocVideoSizeLimit(150 * 1024 * 1024 * 1024)).toBe('150 GB');
  });
});
