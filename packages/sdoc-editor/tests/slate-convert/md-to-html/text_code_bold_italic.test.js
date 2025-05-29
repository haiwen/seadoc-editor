import { processor } from '../../../src';

const mdString = '***`nihaode`***';
describe('paragraph test', () => {
  it('paragraph > italic > bold > code', async () => {
    const data = await processor.process(mdString);
    const string = String(data);
    const expectResult = `
<p><em><strong><code>nihaode</code></strong></em></p>
`;

    expect(string).toEqual(expectResult);
  });
});
