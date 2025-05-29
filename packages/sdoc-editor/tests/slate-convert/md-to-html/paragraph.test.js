import { processor } from '../../../src';

const mdString = 'nihaode';

describe('paragraph test', () => {
  it('paragraph', async () => {
    const data = await processor.process(mdString);
    const string = String(data);
    const expectResult = `
<p>nihaode</p>
`;

    expect(string).toEqual(expectResult);
  });
});
