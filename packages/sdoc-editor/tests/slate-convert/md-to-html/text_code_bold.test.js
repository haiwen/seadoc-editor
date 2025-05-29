import { processor } from '../../../src';

const mdString = '**`nihaode`**';
describe('paragraph test', () => {
  it('paragraph > strong > code', async () => {
    const data = await processor.process(mdString);
    const string = String(data);
    const expectResult = `
<p><strong><code>nihaode</code></strong></p>
`;

    expect(string).toEqual(expectResult);
  });
});
