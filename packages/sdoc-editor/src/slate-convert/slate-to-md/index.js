import gfm from 'remark-gfm';
import remarkMath from 'remark-math';
import markdown from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import { formatSlateToMd } from './transform';

const isContentValid = (value) => {
  if (!value || !Array.isArray(value)) return false;
  return true;
};

// slateNode -> mdast -> mdString
const slateToMdString = (value) => {
  if (!isContentValid(value)) return '';
  // slateNode -> mdast
  // https://github.com/syntax-tree/mdast#phrasingcontent
  const mdASTNodes = formatSlateToMd(value);

  const root = {
    type: 'root',
    children: mdASTNodes
  };

  // convert slate value to md
  const stringifyOptions = {
    rule: '-',
    ruleSpaces: false,
    bullet: '*',
    commonmarks: true,
    fences: true,
  };
  const res = unified()
    .use(markdown)
    .use(gfm)
    .use(remarkStringify, stringifyOptions)
    .use(remarkMath)
    .stringify(root);
  return res;
};

// transform rules: https://github.com/syntax-tree/mdast

export default slateToMdString;
