import { ELEMENT_TYPE } from '../../constants';
import { TABLE_CELL_MIN_WIDTH, TABLE_ROW_MIN_HEIGHT } from './constants';

class Table {

  constructor(options) {
    this.type = options.type || ELEMENT_TYPE.TABLE;
    this.children = options.children || [ // 1 x 1
      {
        id: '',
        type: ELEMENT_TYPE.TABLE_ROW,
        children: [
          {
            id: '',
            type: ELEMENT_TYPE.TABLE_CELL,
            children: [
              {
                text: '',
                id: ''
              }
            ],
            style: {
              text_align: 'left',
              alignItems: 'center',
              background_color: ''
            },
            // inherit from table,when insert new cell
            inherit_style: {
              text_align: 'left',
              background_color: ''
            }
          },
        ],
        style: {
          'min_height': 42
        }
      }
    ];
    this.columns = options.columns || [{ width: TABLE_CELL_MIN_WIDTH }];
    this.ui = options.ui || {
      alternate_highlight: true, // alternate row highlight
      alternate_highlight_color: ''
    };
    this.style = options.style || {
      gridTemplateColumns: `repeat(1, ${TABLE_CELL_MIN_WIDTH}}px)`, // grid
      gridAutoRows: `minmax(${TABLE_ROW_MIN_HEIGHT}}px, auto)`
    };
  }

}

export default Table;
