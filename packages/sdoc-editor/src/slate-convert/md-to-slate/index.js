import gfm from 'remark-gfm';
import math from 'remark-math';
import markdown from 'remark-parse';
import { unified } from 'unified';
import { generateDefaultParagraph } from '../../extension/core';
import { formatMdToSlate } from './transform';

// md string -> md ast
const getProcessor = () => {
  const processor = unified()
    .use(markdown) // Handles markdown basic syntax
    .use(gfm) // Handle markdown extension syntax
    .use(math); // Handles markdown math formulas

  return processor;
};

const reconciledSlateNodes = (nodes) => {
  return nodes;
};

// md string --> md ast --> slate ast
// https://github.com/syntax-tree/mdast
const mdStringToSlate = (mdString) => {
  if (!mdString) return [generateDefaultParagraph()];

  let content = mdString;
  if (typeof mdString === 'number') {
    content = mdString + '';
  }

  // md string --> md ast
  const root = getProcessor().parse(content);

  // md ast --> slate ast
  const slateNodes = formatMdToSlate(root.children);

  // Format the document
  return reconciledSlateNodes(slateNodes);
};

export default mdStringToSlate;
