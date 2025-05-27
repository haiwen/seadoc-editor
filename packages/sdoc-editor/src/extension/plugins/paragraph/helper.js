import { Node, Text } from '@seafile/slate';

export const isEmptyNode = (node) => {
  const nodeChildren = node.children;
  const isSingleChild = nodeChildren.length === 1;
  const firstChild = nodeChildren[0];
  const isText = Text.isText(firstChild);
  const isEmptyContent = Node.string(firstChild) === '';

  let isEmpty = isSingleChild && isText && isEmptyContent;
  return isEmpty;
};
