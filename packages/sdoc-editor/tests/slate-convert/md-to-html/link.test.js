import { processor } from '../../../src';

const mdString = '[xiaoqiang](http://127.0.0.1/shuntian/learning/index.html)';

describe('link test', () => {
  it('paragraph > link', async () => {
    const data = await processor.process(mdString);
    const string = String(data);
    const expectResult = `
<p><a href="http://127.0.0.1/shuntian/learning/index.html">xiaoqiang</a></p>
`;

    expect(string).toEqual(expectResult);
  });
});
