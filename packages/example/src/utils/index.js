import { getCellValueDisplayString, getCellValueStringResult, CellType } from 'dtable-utils';

export const getDirPath = (path) => {
  let dir = path.slice(0, path.lastIndexOf('/'));
  if (dir === '') {
    return '/';
  } else {
    return dir;
  }
};

export const generateDefaultDocContent = () => {
  const defaultValue = {
    version: 0,
    children: [{ id: 'aaaa', type: 'paragraph', children: [{ text: '' }] }]
  };
  return defaultValue;
};

export const getColumnCellValue = (tables, tableId, rowIdx, columnKey, values) => {
  const activeTable = tables.find(table => table._id === tableId);

  const { columns } = activeTable;
  const column = columns.find((item) => item.key === columnKey);
  if (!column) return '';
  const { type, key, data } = column;
  const row = activeTable.rows[rowIdx];
  const isBaiduMap = true;
  const geolocationHyphen = '';
  const { departments = [], collaborators = [], formulaRows = {} } = values || {};

  if (type === CellType.LINK) {
    const displayValue = getCellValueStringResult(row, column, { collaborators, formulaRows });
    return displayValue;
  }

  return getCellValueDisplayString(row, type, key, {
    data,
    formulaRows,
    departments,
    collaborators,
    isBaiduMap,
    geolocationHyphen,
  });
};

export const getTableById = (tables, tableId) => {
  return tables.find(table => table._id === tableId);
};

