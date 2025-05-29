import { processor } from '../../../src';

const mdString = '- [x] Write the press release \n- [ ] Update the website \n- [ ] Contact the media';

describe('check list test', () => {
  it('check list', async () => {
    const data = await processor.process(mdString);
    const string = String(data);
    const expectResult = `
<ul class="contains-task-list">
  <li class="task-list-item"><input type="checkbox" checked disabled> Write the press release</li>
  <li class="task-list-item"><input type="checkbox" disabled> Update the website</li>
  <li class="task-list-item"><input type="checkbox" disabled> Contact the media</li>
</ul>
`;

    expect(string).toEqual(expectResult);
  });
});
