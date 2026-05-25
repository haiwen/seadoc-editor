import slugid from 'slugid';
import { CODE_BLOCK, CODE_LINE } from '../../../constants';
import { genCodeLangs } from '../../code-block/prismjs';

const BLOCK_LINE_TAGS = ['DIV', 'P'];

const normalizeCodeText = (text = '') => {
  return text.replace(/\u00a0/g, ' ');
};

const isFormattingWhitespace = (text = '') => {
  return text !== '' && text.trim() === '';
};

const appendTextToLines = (lines, text = '') => {
  const segments = normalizeCodeText(text).replace(/\r\n?/g, '\n').split('\n');
  lines[lines.length - 1] += segments[0] || '';
  if (segments.length > 1) {
    lines.push(...segments.slice(1));
  }
};

const extractCodeLines = (nodes) => {
  let lines = [''];

  Array.from(nodes).forEach(node => {
    if (node.nodeName === 'BR') {
      lines.push('');
      return;
    }

    if (node.nodeType === 3) {
      const text = node.textContent || '';
      if (isFormattingWhitespace(text)) return;
      appendTextToLines(lines, text);
      return;
    }

    if (BLOCK_LINE_TAGS.includes(node.nodeName)) {
      const blockLines = extractCodeLines(node.childNodes);
      if (blockLines.length === 0) {
        lines.push('');
        return;
      }

      if (lines.length === 1 && lines[0] === '') {
        lines = blockLines;
      } else {
        lines[lines.length - 1] += blockLines[0] || '';
        if (blockLines.length > 1) {
          lines.push(...blockLines.slice(1));
        }
      }

      const nextNode = node.nextSibling;
      const hasNextBlockSibling = nextNode && BLOCK_LINE_TAGS.includes(nextNode.nodeName);
      if (hasNextBlockSibling && blockLines[blockLines.length - 1] !== '') {
        lines.push('');
      }
      return;
    }

    const nestedLines = extractCodeLines(node.childNodes);
    if (nestedLines.length === 0) {
      return;
    }

    if (lines.length === 1 && lines[0] === '') {
      lines = nestedLines;
      return;
    }

    lines[lines.length - 1] += nestedLines[0] || '';
    if (nestedLines.length > 1) {
      lines.push(...nestedLines.slice(1));
    }
  });

  return lines;
};

const buildCodeLines = (element) => {
  const lines = extractCodeLines(element.childNodes);

  return lines.map(text => {
    return {
      id: slugid.nice(),
      type: CODE_LINE,
      children: [{
        id: slugid.nice(),
        text: text,
      }],
    };
  });
};

const codeBlockRule = (element, parseChild) => {
  const { nodeName, childNodes } = element;
  if (nodeName === 'PRE') {
    const codeChild = element.querySelector('code');
    let lang = codeChild?.getAttribute('lang');
    lang = genCodeLangs().find(item => item.value === lang) || 'plaintext';
    return {
      id: slugid.nice(),
      language: lang,
      type: CODE_BLOCK,
      children: buildCodeLines(codeChild || element)
    };
  }

  if (nodeName === 'CODE' && element.parentElement.nodeName === 'PRE') {
    const childIsP = Array.from(childNodes).every((n) => n.nodeName === 'P');
    if (childIsP) {
      return Array.from(childNodes).map(n => {
        return {
          id: slugid.nice(),
          type: CODE_LINE,
          children: [
            {
              id: slugid.nice(),
              text: n.textContent,
            }
          ]
        };
      });
    }

    const content = element.textContent;
    const hasNewLine = content.indexOf('\n') > -1;
    if (!hasNewLine) {
      return {
        id: slugid.nice(),
        type: CODE_LINE,
        children: [
          {
            id: slugid.nice(),
            text: element.textContent,
          }
        ]
      };
    }

    const codes = content.split('\n');
    return codes.map(item => {
      return {
        id: slugid.nice(),
        type: CODE_LINE,
        children: [
          {
            id: slugid.nice(),
            text: item,
          }
        ]
      };
    });
  }

  return;
};

export default codeBlockRule;
