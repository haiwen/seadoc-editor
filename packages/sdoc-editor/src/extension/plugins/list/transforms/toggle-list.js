import { Node, Range, Transforms, Element, Editor } from '@seafile/slate';
import { LIST_ITEM, PARAGRAPH, INSERT_POSITION } from '../../../constants';
import { findNode, getCurrentNode, focusEditor, getNodeEntries, getNodeType, getSelectedNodeEntryByType, isRangeAcrossBlocks } from '../../../core';
import { generateEmptyList, generateEmptyListContent, generateEmptyListItem } from '../model';
import { getListItemEntry, getListTypes } from '../queries';
import { unwrapList } from './unwrap-list';

const wrapLineList = (editor, type) => {
  const list = generateEmptyList(type);
  Transforms.wrapNodes(editor, list);
  const nodeEntry = getSelectedNodeEntryByType(editor, PARAGRAPH);
  if (!nodeEntry) return;

  // select is paragraph
  // 1 handle paragraph

  // 2 wrap list_item
  const [, path] = nodeEntry;
  const listItem = generateEmptyListItem();
  Transforms.wrapNodes(editor, listItem, { at: path });
  return;
};

const wrapRangeList = (editor, type) => {
  // 选中的是一个区间
  Editor.withoutNormalizing(editor, () => {
    // 1. 获取公共祖先
    const [startPoint, endPoint] = Range.edges(editor.selection);
    const commonAncestor = Node.common(editor, startPoint.path, endPoint.path);
    const listTypes = getListTypes();

    // 2. 公共祖先如果是 ordered_list | unordered_list
    if (listTypes.includes(commonAncestor[0].type) || commonAncestor[0].type === LIST_ITEM) {
      if (commonAncestor[0].type !== type) {
        const start = Range.start(editor.selection);
        const end = Range.end(editor.selection);
        const options = {
          at: start,
          match: { type: listTypes },
          mode: 'lowest',
        };
        const startList = findNode(editor, options);
        const endList = findNode(editor, { ...options, ...{ at: end } });
        const rangeLength = Math.min(startList[1].length, endList[1].length);

        Transforms.setNodes(editor, { type }, {
          at: editor.selection,
          match: (n, path) => Element.isElement(n) && listTypes.includes(n.type) && path.length >= rangeLength,
          mode: 'all',
        });
      } else {
        unwrapList(editor);
      }
      return;
    }

    // 获取选中的所有节点的子元素
    const rootPathLength = commonAncestor[1].length;
    const _nodes = getNodeEntries(editor, { mode: 'all' });
    const nodes = Array.from(_nodes).filter(([, path]) => path.length === rootPathLength + 1);

    nodes.forEach(n => {
      if (listTypes.includes(n[0].type)) {
        Transforms.setNodes(editor, { type }, {
          at: n[1],
          match: (_n) => Element.isElement(_n) && listTypes.includes(_n.type),
          mode: 'all',
        });
      } else {
        // select content is paragraph
        // 1 handle content

        // 2. wrap list_item
        const listItem = generateEmptyListItem();
        Transforms.wrapNodes(editor, listItem, { at: n[1] });

        // 3. wrap list
        const list = generateEmptyList(type);
        Transforms.wrapNodes(editor, list, { at: n[1] });
      }
    });
  });
};

const toggleList = (editor, type, insertPosition, focusSelection = true) => {
  if (insertPosition === INSERT_POSITION.AFTER) {
    const list = generateEmptyList(type);
    const listContent = generateEmptyListContent();

    const path = Editor.path(editor, editor.selection);
    Transforms.insertNodes(editor, listContent, { at: [path[0] + 1] });
    Transforms.select(editor, [path[0] + 1]);
    Transforms.wrapNodes(editor, list);
    return;
  }

  Editor.withoutNormalizing(editor, () => {
    const { selection } = editor;
    if (!selection) return false;
    const [currentNode,] = getCurrentNode(editor);

    // selection is collapsed, anchor === focus
    // selection is in one block
    if (Range.isCollapsed(selection) || !isRangeAcrossBlocks(editor)) {
      const res = getListItemEntry(editor);
      if (res) {
        const { list } = res;
        // 选中内容的类型是另一个类型, 如： select_type: ordered_list, 将被切换为 unordered_list
        if (list[0].type !== type) {
          const match = (n) => getListTypes().includes(getNodeType(n));
          Transforms.setNodes(editor, { type }, { at: editor.selection, match: match, mode: 'lowest' });
        } else {
          unwrapList(editor);
        }
      } else {
        wrapLineList(editor, type);
      }

      // When currentNode is empty
      if (!Node.string(currentNode) && currentNode.children.length === 1 && focusSelection) {
        focusEditor(editor, editor.selection);
      }
      return;
    }

    // selection is a range
    wrapRangeList(editor, type);
  });
};

export default toggleList;
