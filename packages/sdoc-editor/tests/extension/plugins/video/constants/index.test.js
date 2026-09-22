import { formatSeadocVideoSizeLimit, getSeadocVideoSizeLimit, SEADOC_VIDEO_SIZE_LIMIT } from '../../../../../src/extension/plugins/video/constants';

describe('getSeadocVideoSizeLimit', () => {
  it('returns the default limit when no setting is provided', () => {
    expect(getSeadocVideoSizeLimit()).toBe(SEADOC_VIDEO_SIZE_LIMIT);
  });

  it('returns a valid configured limit', () => {
    expect(getSeadocVideoSizeLimit(10 * 1024 * 1024)).toBe(10 * 1024 * 1024);
    expect(getSeadocVideoSizeLimit('10MB')).toBe(SEADOC_VIDEO_SIZE_LIMIT);
    expect(getSeadocVideoSizeLimit('10485760')).toBe(10 * 1024 * 1024);
  });

  it('falls back to the default limit for invalid settings', () => {
    expect(getSeadocVideoSizeLimit('')).toBe(SEADOC_VIDEO_SIZE_LIMIT);
    expect(getSeadocVideoSizeLimit(0)).toBe(SEADOC_VIDEO_SIZE_LIMIT);
    expect(getSeadocVideoSizeLimit(-1)).toBe(SEADOC_VIDEO_SIZE_LIMIT);
    expect(getSeadocVideoSizeLimit('invalid')).toBe(SEADOC_VIDEO_SIZE_LIMIT);
  });
});


describe('formatSeadocVideoSizeLimit', () => {
  it('formats the configured limit with a readable binary unit', () => {
    expect(formatSeadocVideoSizeLimit()).toBe('5 MB');
    expect(formatSeadocVideoSizeLimit(10 * 1024 * 1024)).toBe('10 MB');
    expect(formatSeadocVideoSizeLimit(150 * 1024 * 1024 * 1024)).toBe('150 GB');
  });
});
