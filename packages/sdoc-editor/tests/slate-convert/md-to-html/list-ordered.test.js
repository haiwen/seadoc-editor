import { processor } from '../../../src';

const mdString = '1. list_item1 \n2. list_item2 \n    1. list_item_child 2.1 \n    2. list_item_child 2.2 ';
describe('ordered_list test', () => {
  it('ordered_list', async () => {
    const data = await processor.process(mdString);
    const string = String(data);
    const expectResult = `
<ol>
  <li>list_item1</li>
  <li>list_item2
    <ol>
      <li>list_item_child 2.1</li>
      <li>list_item_child 2.2</li>
    </ol>
  </li>
</ol>
`;

    expect(string).toEqual(expectResult);
  });
});
