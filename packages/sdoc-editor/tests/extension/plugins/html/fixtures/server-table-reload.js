import slugid from 'slugid';

// Portable child-type contract from sdoc-server's models/normalize-element.js.
// Set SDOC_SERVER_NORMALIZER_PATH to run the same cases against its actual source.
const INLINE_TYPES = ['link', 'sdoc_link', 'file_link', 'image', 'seatable_column', 'wiki_link'];
const CHILD_TYPES = {
  table: ['table_row', 'group'],
  table_row: ['table_cell', 'group'],
  table_cell: [...INLINE_TYPES, 'check_list_item', 'ordered_list', 'unordered_list'],
  ordered_list: ['list_item', 'group'],
  unordered_list: ['list_item', 'group'],
  list_item: ['paragraph', 'ordered_list', 'unordered_list', 'group'],
  paragraph: INLINE_TYPES,
  check_list_item: INLINE_TYPES,
};
const DEFAULT_CHILD_TYPES = {
  table: 'table_row',
  table_row: 'table_cell',
  ordered_list: 'list_item',
  unordered_list: 'list_item',
  list_item: 'paragraph',
};

const normalizeWithServerContract = (node) => {
  const types = CHILD_TYPES[node.type];
  if (!types) return node;
  const defaultType = DEFAULT_CHILD_TYPES[node.type];
  const children = (node.children || []).filter(child => (
    child.type ? types.includes(child.type) : !defaultType
  ));
  if (children.length === 0) {
    children.push(defaultType
      ? { id: slugid.nice(), type: defaultType, children: [] }
      : { id: slugid.nice(), text: '' });
  }
  return { ...node, children: children.map(normalizeWithServerContract) };
};

export const reloadTableFromServer = (table) => {
  const saved = JSON.parse(JSON.stringify(table));
  const normalizeElement = process.env.SDOC_SERVER_NORMALIZER_PATH
    ? require(process.env.SDOC_SERVER_NORMALIZER_PATH).normalizeElement
    : normalizeWithServerContract;
  return normalizeElement(saved);
};
