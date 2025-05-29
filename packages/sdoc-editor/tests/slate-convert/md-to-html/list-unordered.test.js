import { processor } from '../../../src';

const mdString = '- list_item1 \n- list_item2 \n  - list_item_child 2.1 \n   - list_item_child 2.2 ';
describe('unordered_list test', () => {
  it('unordered_list', async () => {
    const data = await processor.process(mdString);
    const string = String(data);
    const expectResult = `
<ul>
  <li>list_item1</li>
  <li>list_item2
    <ul>
      <li>list_item_child 2.1</li>
      <li>list_item_child 2.2</li>
    </ul>
  </li>
</ul>
`;

    expect(string).toEqual(expectResult);
  });
});
