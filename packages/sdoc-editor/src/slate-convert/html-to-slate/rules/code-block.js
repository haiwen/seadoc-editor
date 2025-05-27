import slugid from 'slugid';
import { CODE_BLOCK, CODE_LINE } from '../constants';
import { genCodeLangs } from '../helper';

const codeBlockRule = (element, parseChild) => {
  const { nodeName, childNodes } = element;
  if (nodeName === 'PRE') {
    const children = Array.from(childNodes).filter(item => item.nodeName === 'CODE');
    let codeChild = children[0];
    if (codeChild) {
      let lang = codeChild.getAttribute('lang');
      lang = genCodeLangs().find(item => item.value === lang) || 'plaintext';
      return {
        id: slugid.nice(),
        language: lang,
        type: CODE_BLOCK,
        children: parseChild(children)
      };
    } else {
      const lang = 'plaintext';
      const content = childNodes[0].textContent;
      const textArr = content.split('\n').filter(Boolean);
      const children = textArr.map(text => {
        return {
          id: slugid.nice(),
          type: CODE_LINE,
          children: [{
            id: slugid.nice(),
            text: text
          }]
        };
      });
      return {
        id: slugid.nice(),
        language: lang,
        type: CODE_BLOCK,
        children: children
      };
    }
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

    const codes = content.split('\n').filter(Boolean);
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
