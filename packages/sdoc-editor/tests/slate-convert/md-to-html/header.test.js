import { processor } from '../../../src';

const mdString = '# header1 \n## header2 \n### header3 \n#### header4 \n##### header5 \n###### header6';

describe('header test', () => {
  it('header', async () => {
    const result = await processor.process(mdString);
    const string = String(result);
    const expectResult = `
<h1 id="user-content-header1">header1</h1>
<h2 id="user-content-header2">header2</h2>
<h3 id="user-content-header3">header3</h3>
<h4 id="user-content-header4">header4</h4>
<h5 id="user-content-header5">header5</h5>
<h6 id="user-content-header6">header6</h6>
`;

    expect(string).toEqual(expectResult);
  });
});
