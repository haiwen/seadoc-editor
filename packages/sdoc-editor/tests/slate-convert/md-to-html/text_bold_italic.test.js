import { processor } from '../../../src';

const mdString = '***nihaode***';

describe('paragraph test', () => {
  it('paragraph > bold > italic', async () => {
    const data = await processor.process(mdString);
    const string = String(data);
    const expectResult = `
<p><em><strong>nihaode</strong></em></p>
`;

    expect(string).toEqual(expectResult);
  });
});
