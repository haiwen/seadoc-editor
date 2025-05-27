import slugid from 'slugid';
import typeOf from 'type-of';
import { INLINE_LEVEL_TYPES, LIST_ITEM, PARAGRAPH, TOP_LEVEL_TYPES, UNORDERED_LIST } from './constants';
import rules from './rules';

const cruftNewline = element => {
  return !(element.nodeName === '#text' && element.nodeValue === '\n');
};

const deserializeElement = (element) => {
  let node;
  const next = (elements) => {
    if (Object.prototype.toString.call(elements) === '[object NodeList]') {
      elements = Array.from(elements);
    }
    switch (typeOf(elements)) {
      case 'array':
        return deserializeElements(elements);
      case 'object':
        return deserializeElement(elements);
      case 'null':
      case 'undefined':
        return;
      default:
        throw new Error(`The \`next\` argument was called with invalid children: "${elements}".`);
    }

  };

  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    if (!rule) continue;
    const ret = rule(element, next);
    const type = typeOf(ret);

    if (type !== 'array' && type !== 'object' && type !== 'null' && type !== 'undefined') {
      throw new Error(`A rule returned an invalid deserialized representation: "${node}".`);
    }

    // Not eligible for current component processing
    if (ret === undefined) {
      continue;
    }

    // Empty tags will be discarded and not converted accordingly
    if (ret === null) {
      return null;
    }

    // Assign the final processing result to node
    node = ret;
    break;
  }

  // If node is undefined, it means that the label is not processed, and continue to process the child nodes of the element
  return node || next(element.childNodes);
};

const deserializeElements = (elements = [], isTopLevel = false) => {
  let nodes = [];
  elements.filter(cruftNewline).forEach(element => {
    const node = deserializeElement(element);
    switch (typeOf(node)) {
      case 'array':
        const formatNode = isTopLevel ? formatElementNodes(node) : node;
        nodes = nodes.concat(formatNode);
        break;
      case 'object':
        nodes.push(node);
        break;
      default:
        // nothing todo
    }
  });

  return nodes;
};

const formatElementNodes = (nodes) => {
  if (nodes.length === 0) {
    return [
      {
        id: slugid.nice(),
        type: PARAGRAPH,
        children: [{ text: '', id: slugid.nice() }]
      }
    ];
  }

  nodes = nodes.reduce((memo, node) => {
    if (TOP_LEVEL_TYPES.includes(node.type)) {
      memo.push(node);
    }

    if (node.type === LIST_ITEM) {
      const newNode = {
        id: slugid.nice(),
        type: UNORDERED_LIST,
        children: [node],
      };
      memo.push(newNode);
      return memo;
    }

    // The following types will not appear individually during the pasting process
    // code_line
    // table_row | table_cell

    // text | image | link
    if (!node.type || INLINE_LEVEL_TYPES.includes(node.type)) {
      let prevNode = memo[memo.length - 1];
      if (prevNode && prevNode.type === PARAGRAPH) {
        prevNode.children.push(node);
        return memo;
      }

      const newNode = {
        id: slugid.nice(),
        type: PARAGRAPH,
        children: [node],
      };
      memo.push(newNode);
      return memo;
    }

    return memo;
  }, []);

  return nodes;
};

const deserializeHtml = (html) => {
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const fragment = parsed.body;
  const children = Array.from(fragment.childNodes);

  let nodes = [];
  nodes = deserializeElements(children, true);
  nodes = formatElementNodes(nodes);

  return nodes;
};

export default deserializeHtml;
