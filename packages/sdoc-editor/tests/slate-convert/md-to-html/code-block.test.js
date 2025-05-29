import { processor } from '../../../src';

// eslint-disable-next-line quotes
const mdString = "```javascript\nconst a = 'nihao';\nconst b = 'wphao';"; // bug

describe('code_block test', () => {
  it('code_block', async () => {
    const data = await processor.process(mdString);
    const string = String(data);
    const expectResult = `
<pre><code class="language-javascript">const a = 'nihao';
const b = 'wphao';
</code></pre>
`;

    expect(string).toEqual(expectResult);
  });
});
