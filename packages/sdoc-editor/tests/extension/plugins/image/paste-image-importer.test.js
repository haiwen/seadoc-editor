import { createEditor as createSlateEditor } from '@seafile/slate';
import context from '../../../../src/context';
import { importPastedWechatImages } from '../../../../src/extension/plugins/image/paste-image-importer';

jest.mock('../../../../src/context', () => ({
  __esModule: true,
  default: {
    getSetting: jest.fn(),
    importRemoteImages: jest.fn(),
  },
}));

const createImage = (id, src) => ({
  id,
  type: 'image',
  data: { src },
  children: [{ text: '' }],
});

const createEditor = (images) => {
  const editor = createSlateEditor();
  editor.children = [{ type: 'paragraph', children: images }];
  return editor;
};

describe('paste image importer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    context.getSetting.mockReturnValue('doc-uuid');
  });

  it('imports a duplicate WeChat URL once and updates all matching pasted nodes', async () => {
    const url = 'https://mmbiz.qpic.cn/image.jpg';
    const images = [createImage('first', url), createImage('second', url)];
    const editor = createEditor(images);
    context.importRemoteImages.mockResolvedValue([
      { source_url: url, status: 'success', relative_path: '/local.jpg' },
    ]);

    await importPastedWechatImages(editor, editor.children);

    expect(context.importRemoteImages).toHaveBeenCalledWith('doc-uuid', [url]);
    expect(editor.children[0].children.map(image => image.data)).toEqual([
      { src: '/local.jpg', is_copy_error: false },
      { src: '/local.jpg', is_copy_error: false },
    ]);
  });

  it('keeps a failed URL remote without affecting successful images', async () => {
    const successUrl = 'https://mmbiz.qpic.cn/success.jpg';
    const failedUrl = 'https://mmbiz.qpic.cn/failed.jpg';
    const editor = createEditor([
      createImage('success', successUrl),
      createImage('failed', failedUrl),
    ]);
    context.importRemoteImages.mockResolvedValue([
      { source_url: successUrl, status: 'success', relative_path: '/success.jpg' },
      { source_url: failedUrl, status: 'failed', error_code: 'download_failed' },
    ]);

    await importPastedWechatImages(editor, editor.children);

    expect(editor.children[0].children[0].data).toEqual({ src: '/success.jpg', is_copy_error: false });
    expect(editor.children[0].children[1].data).toEqual({ src: failedUrl, is_copy_error: true });
  });

  it('splits more than ten unique URLs into bounded requests', async () => {
    const images = Array.from({ length: 11 }, (_, index) => createImage(
      `image-${index}`,
      `https://mmbiz.qpic.cn/${index}.jpg`
    ));
    const editor = createEditor(images);
    context.importRemoteImages.mockImplementation((docUuid, urls) => Promise.resolve(urls.map(url => ({
      source_url: url,
      status: 'success',
      relative_path: `/local-${url.split('/').pop()}`,
    }))));

    await importPastedWechatImages(editor, editor.children);

    expect(context.importRemoteImages).toHaveBeenCalledTimes(2);
    expect(context.importRemoteImages.mock.calls[0][1]).toHaveLength(10);
    expect(context.importRemoteImages.mock.calls[1][1]).toHaveLength(1);
    expect(editor.children[0].children[10].data.src).toBe('/local-10.jpg');
  });

  it('skips a pasted image that was deleted while importing', async () => {
    const url = 'https://mmbiz.qpic.cn/image.jpg';
    const editor = createEditor([createImage('image', url)]);
    let resolveRequest;
    context.importRemoteImages.mockReturnValue(new Promise(resolve => {
      resolveRequest = resolve;
    }));

    const importPromise = importPastedWechatImages(editor, editor.children);
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    resolveRequest([{ source_url: url, status: 'success', relative_path: '/local.jpg' }]);
    await importPromise;

    expect(editor.children[0].children).toEqual([{ text: '' }]);
  });
});
