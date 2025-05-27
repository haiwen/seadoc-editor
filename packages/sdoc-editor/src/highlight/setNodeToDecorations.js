import { Node, Element, Editor } from '@seafile/slate';
import { useSlateStatic } from '@seafile/slate-react';
import { CODE_BLOCK } from '../extension/constants';
import { getValidLang } from '../extension/plugins/code-block/helpers';
import Prism, { normalizeTokens, normalizeTokensByLanguageType } from '../extension/plugins/code-block/prismjs';

const mergeMaps = (...maps) => {
  const map = new Map();

  for (const m of maps) {
    for (const item of m) {
      map.set(...item);
    }
  }

  return map;
};

const getChildNodeToDecorations = ([block, blockPath]) => {
  const nodeToDecorations = new Map();

  const text = block.children.map(line => Node.string(line)).join('\n');

  const language = getValidLang(block.language);
  let tokens = Prism.tokenize(text, Prism.languages[language]);

  if (Object.keys(normalizeTokensByLanguageType).includes(language)) {
    tokens = normalizeTokensByLanguageType[language](tokens);
  }
  const normalizedTokens = normalizeTokens(tokens); // make tokens flat and grouped by line
  const blockChildren = block.children;

  for (let index = 0; index < normalizedTokens.length; index++) {
    const tokens = normalizedTokens[index];
    const element = blockChildren[index];
    if (element) {
      if (!nodeToDecorations.has(element)) {
        nodeToDecorations.set(element, []);
      }
    }

    let start = 0;
    for (const token of tokens) {

      const length = token.content.length;
      if (!length) {
        continue;
      }

      const end = start + length;

      const path = [...blockPath, index, 0];
      const range = {
        anchor: { path, offset: start },
        focus: { path, offset: end },
        token: true,
        ...Object.fromEntries(token.types.map(type => [type, true])),
      };

      if (nodeToDecorations.get(element)) {
        nodeToDecorations.get(element).push(range);
      }

      start = end;
    }
  }

  return nodeToDecorations;
};

export const SetNodeToDecorations = () => {
  const editor = useSlateStatic();

  const blockEntries = Array.from(
    Editor.nodes(editor, {
      at: [],
      mode: 'highest',
      match: n => Element.isElement(n) && n.type === CODE_BLOCK,
    })
  );

  const nodeToDecorations = mergeMaps(
    ...blockEntries.map(getChildNodeToDecorations)
  );

  editor.nodeToDecorations = nodeToDecorations;

  return null;
};
