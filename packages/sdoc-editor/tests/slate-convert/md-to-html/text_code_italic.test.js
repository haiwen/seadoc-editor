import { processor } from '../../../src';

const mdString = '*`nihaode`*';
describe('paragraph test', () => {
  it('paragraph > italic > code', async () => {
    const data = await processor.process(mdString);
    const string = String(data);
    const expectResult = `
<p><em><code>nihaode</code></em></p>
`;

    expect(string).toEqual(expectResult);
  });
});
