import { processor } from '../../../src';

const mdString = '|name|sex|age| \n |-|-|-| \n |alex|man|24|';
describe('table test', () => {
  it('table', async () => {
    const data = await processor.process(mdString);
    const string = String(data);
    const expectResult = `
<table>
  <thead>
    <tr>
      <th>name</th>
      <th>sex</th>
      <th>age</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>alex</td>
      <td>man</td>
      <td>24</td>
    </tr>
  </tbody>
</table>
`;

    expect(string).toEqual(expectResult);
  });
});
