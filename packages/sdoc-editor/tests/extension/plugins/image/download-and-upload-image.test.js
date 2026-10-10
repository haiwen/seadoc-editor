import context from '../../../../src/context';
import { downloadAndUploadImage } from '../../../../src/extension/plugins/image/use-copy-image';

describe('downloadAndUploadImage', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete global.fetch;
  });

  it('rejects a forbidden URL without ever calling fetch', async () => {
    global.fetch = jest.fn();

    await expect(downloadAndUploadImage('http://169.254.169.254/latest/meta-data/'))
      .rejects.toThrow(/blocked/i);

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('downloads and uploads an allowed URL as before', async () => {
    const blob = new Blob(['fake-image-bytes'], { type: 'image/png' });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(blob),
    });
    const uploadLocalImage = jest.spyOn(context, 'uploadLocalImage').mockResolvedValue(['/uploaded/path.png']);

    const result = await downloadAndUploadImage('https://example.com/image.png');

    expect(global.fetch).toHaveBeenCalledWith('https://example.com/image.png');
    expect(uploadLocalImage).toHaveBeenCalled();
    expect(result).toBe('/uploaded/path.png');
  });
});
