import { processor } from '../../../src';

const mdString = '![alt text](image.jpg "nihadoe")';

describe('image test', () => {
  it('paragraph > image', async () => {
    const result = await processor.process(mdString);
    const string = String(result);
    const expectResult = `
<p>
  <img src="image.jpg" alt="alt text" title="nihadoe">
</p>
`;

    expect(string).toEqual(expectResult);
  });
});
