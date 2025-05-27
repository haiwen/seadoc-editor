import { TABLE } from '../../constants';
import { TableMenu } from './menu';
import Table from './model';
import withTable from './plugin';
import { renderTable,
  renderTableRow,
  renderTableCell,
} from './render-elem';


const TablePlugin = {
  type: TABLE,
  nodeType: 'element',
  model: Table,
  editorMenus: [TableMenu],
  editorPlugin: withTable,
  renderElements: [renderTable, renderTableRow, renderTableCell],
};

export default TablePlugin;
