import slugid from 'slugid';
import { TABLE, TABLE_CELL, TABLE_ROW } from '../../../constants';

const ROW_GROUP_TAGS = ['THEAD', 'TBODY', 'TFOOT'];
const CELL_TEXT_BLOCK_TAGS = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'PRE', 'HR', 'TABLE'];

const createEmptyCell = (isCombined = false) => ({
  id: slugid.nice(),
  type: TABLE_CELL,
  ...(isCombined && { is_combined: true }),
  children: [{ id: slugid.nice(), text: '' }],
});

const normalizeRowGroup = (rows) => {
  const normalizedRows = rows.map(row => ({ ...row, children: [] }));
  rows.forEach((row, rowIndex) => {
    let columnIndex = 0;
    row.children.forEach(cell => {
      const { colspan = 1, rowspan = 1 } = cell;
      // HTML spans cannot extend beyond their row group; zero means all remaining rows.
      const rowSpan = Math.min(rowspan || rows.length, rows.length - rowIndex);
      const cells = normalizedRows[rowIndex].children;
      while (cells.slice(columnIndex, columnIndex + colspan).some(Boolean)) {
        columnIndex++;
      }

      cells[columnIndex] = {
        ...cell,
        ...(cell.rowspan !== undefined && { rowspan: rowSpan, colspan }),
      };
      // SDOC keeps a hidden cell at every position covered by a merge.
      for (let i = rowIndex; i < rowIndex + rowSpan; i++) {
        for (let j = columnIndex; j < columnIndex + colspan; j++) {
          if (i === rowIndex && j === columnIndex) continue;
          normalizedRows[i].children[j] = createEmptyCell(true);
        }
      }
      columnIndex += colspan;
    });
  });
  return normalizedRows;
};

const tableRule = (element, parseChild) => {
  const { nodeName, childNodes } = element;
  // Read unsupported cell blocks before other rules turn them into block nodes.
  if (CELL_TEXT_BLOCK_TAGS.includes(nodeName) && element.closest('td, th')) {
    return { id: slugid.nice(), text: element.textContent };
  }

  if (nodeName === 'TABLE') {
    const elements = Array.from(element.children);
    const caption = elements.find(child => child.nodeName === 'CAPTION');
    const captionNodes = caption ? parseChild(caption.childNodes) : [];
    // Only rows belong inside the table. Captions are preserved before it.
    const rows = elements.flatMap(child => {
      if (ROW_GROUP_TAGS.includes(child.nodeName)) {
        return normalizeRowGroup(parseChild(Array.from(child.children).filter(row => row.nodeName === 'TR')));
      }
      if (child.nodeName === 'TR') return normalizeRowGroup(parseChild([child]));
      return [];
    });
    const columnCount = rows.reduce((count, row) => Math.max(count, row.children.length), 0);
    if (!columnCount) return captionNodes.length > 0 ? captionNodes : null;

    rows.forEach(row => {
      for (let i = 0; i < columnCount; i++) {
        if (!row.children[i]) row.children[i] = createEmptyCell();
      }
    });
    const table = {
      id: slugid.nice(),
      type: TABLE,
      children: rows,
    };
    return captionNodes.length > 0 ? [...captionNodes, table] : table;
  }

  if (ROW_GROUP_TAGS.includes(nodeName)) {
    return parseChild(Array.from(element.children).filter(child => child.nodeName === 'TR'));
  }

  if (nodeName === 'TR') {
    return {
      id: slugid.nice(),
      type: TABLE_ROW,
      children: parseChild(Array.from(element.children).filter(child => child.nodeName === 'TH' || child.nodeName === 'TD'))
    };
  }

  if (nodeName === 'TH' || nodeName === 'TD') {
    const children = parseChild(childNodes);
    const { rowSpan, colSpan } = element;
    return {
      id: slugid.nice(),
      type: TABLE_CELL,
      ...((rowSpan !== 1 || colSpan !== 1) && { rowspan: rowSpan, colspan: colSpan }),
      children: children.length > 0 ? children : [{ id: slugid.nice(), text: '' }]
    };
  }

  return;
};

export default tableRule;
