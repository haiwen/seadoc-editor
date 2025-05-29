import { processor } from '../../../src';

describe('blockquote test', () => {
  it('blockquote > paragraph', async () => {
    const mdString = '> nihaode';
    const data = await processor.process(mdString);
    const string = String(data);
    const expectResult = `
<blockquote>
  <p>nihaode</p>
</blockquote>
`;

    expect(string).toEqual(expectResult);
  });
});

describe('blockquote test', () => {
  it('blockquote > table', async () => {
    const mdString = '> |name|sex|age| \n > |-|-|-| \n > |alex|man|24|';
    const result = await processor.process(mdString);
    const string = String(result);
    const expectResult = `
<blockquote>
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
</blockquote>
`;

    expect(string).toEqual(expectResult);
  });
});

describe('blockquote test', () => {
  it('blockquote > list', async () => {
    const mdString = '> name \n > - list_item1 \n > - list_item2 \n >   - list_item_child 2.1 \n >   - list_item_child 2.2 ';
    const result = await processor.process(mdString);
    const string = String(result);
    const expectResult = `
<blockquote>
  <p>name</p>
  <ul>
    <li>list_item1</li>
    <li>list_item2
      <ul>
        <li>list_item_child 2.1</li>
        <li>list_item_child 2.2</li>
      </ul>
    </li>
  </ul>
</blockquote>
`;

    expect(string).toEqual(expectResult);
  });
});

describe('blockquote test', () => {
  it('blockquote > check_list', async () => {
    const mdString = '> name \n > - [x] Write the press release \n > - [ ] Update the website \n > - [ ] Contact the media ';
    const result = await processor.process(mdString);
    const string = String(result);
    const expectResult = `
<blockquote>
  <p>name</p>
  <ul class="contains-task-list">
    <li class="task-list-item"><input type="checkbox" checked disabled> Write the press release</li>
    <li class="task-list-item"><input type="checkbox" disabled> Update the website</li>
    <li class="task-list-item"><input type="checkbox" disabled> Contact the media</li>
  </ul>
</blockquote>
`;

    expect(string).toEqual(expectResult);
  });
});

describe('blockquote test', () => {
  it('blockquote > header', async () => {
    const mdString = '> # header1 \n> ## header2 \n> ### header3 \n> #### header4 \n> ##### header5 \n> ###### header6';
    const result = await processor.process(mdString);
    const string = String(result);
    const expectResult = `
<blockquote>
  <h1 id="user-content-header1">header1</h1>
  <h2 id="user-content-header2">header2</h2>
  <h3 id="user-content-header3">header3</h3>
  <h4 id="user-content-header4">header4</h4>
  <h5 id="user-content-header5">header5</h5>
  <h6 id="user-content-header6">header6</h6>
</blockquote>
`;

    expect(string).toEqual(expectResult);
  });
});
