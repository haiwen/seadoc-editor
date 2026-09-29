import axios from 'axios';
import SeafileAPI from '../../src/api/seafile-api';

jest.mock('axios', () => ({
  create: jest.fn(),
}));

describe('SeafileAPI', () => {
  it('imports remote images through Seahub', async () => {
    const post = jest.fn().mockResolvedValue({ data: { images: [] } });
    axios.create.mockReturnValue({ post });
    const api = new SeafileAPI('https://seahub.example.com', 'token');
    const imageUrls = ['https://mmbiz.qpic.cn/image.jpg'];

    await api.importRemoteImages('doc-uuid', imageUrls);

    expect(post).toHaveBeenCalledWith(
      '/api/v2.1/seadoc/import-images/doc-uuid/',
      { image_urls: imageUrls }
    );
  });
});
