import { processor } from '../../../src';

const mdString = '[Example][example]\n\n[example]: https://example.com "title"';

describe('link test', () => {
  it('paragraph > link', async () => {
    const data = await processor.process(mdString);
    const string = String(data);
    const expectResult = `
<p><a href="https://example.com" title="title">Example</a></p>
`;

    expect(string).toEqual(expectResult);
  });
});
