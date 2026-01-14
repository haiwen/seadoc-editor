import React from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { INTERNAL_EVENT } from '../../../../../constants';
import EventBus from '../../../../../utils/event-bus';
import KebabToCamel from '../../../../../utils/Kebab-to-camel';
import ObjectUtils from '../../../../../utils/object-utils';
import { ElementPopover } from '../../../../commons';
import { ELEMENT_TYPE } from '../../../../constants';
import { getSelectedNodeByType } from '../../../../core';
import { TABLE_MAX_COLUMNS, TABLE_MAX_ROWS, TABLE_ELEMENT, TABLE_ELEMENT_POSITION, EMPTY_SELECTED_RANGE, TABLE_CELL_STYLE } from '../../constants';
import { insertTableElement, removeTableElement, combineCells, isTableWidthFitScreen, fitTableColumnToScreen } from '../../helpers';
import ColorSelectorPopover from '../color-selector-popover';
import HorizontalAlignPopover from '../horizontal-align-popover';
import VerticalAlignPopover from '../vertical-align-popover';
import InsertTableElement from './insert-table-element';

import './index.css';

class TableContextMenu extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      contextStyle: {},
      isDisableFitTableWidthToScreen: false
    };
    this.position = null;
    this.eventBus = EventBus.getInstance();
    this.horizontalAlignRef = React.createRef();
    this.verticalAlignRef = React.createRef();
    this.colorSelectorRef = React.createRef();
  }

  componentDidMount() {
    this.position = this.props.contextMenuPosition;
    this.updateMenuPosition();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const nextContextMenuPosition = nextProps.contextMenuPosition;
    if (!ObjectUtils.isSameObject(nextContextMenuPosition, this.props.contextMenuPosition)) {
      this.position = nextContextMenuPosition;
      this.updateMenuPosition();
    }
  }

  componentWillUnmount() {
    this.menu = null;
  }

  updateMenuPosition = () => {
    const menuHeight = this.menu.offsetHeight;

    // get height of context menu when the menu is drawing completed in this page
    if (menuHeight === 0) {
      requestAnimationFrame(this.updateMenuPosition);
      return;
    }
    let top = 0;
    if (this.position.top + menuHeight > document.body.clientHeight) {
      top = document.body.clientHeight - menuHeight - 5;
    } else {
      top = this.position.top;
    }
    const left = this.position.left + 3;
    this.setState({ contextStyle: { top, left } });
  };

  insertTableElement = (type, position, count) => {
    const { editor } = this.props;
    insertTableElement(editor, type, position, count);
  };

  removeTableElements = (type) => {
    const { editor } = this.props;
    removeTableElement(editor, type);
  };

  renderRemoveBtn = (type, title) => {
    return (
      <button
        onMouseDown={this.removeTableElements.bind(this, type)}
        className="dropdown-item"
      >
        {this.props.t(title)}
      </button>
    );
  };

  combineCells = () => {
    const { editor } = this.props;
    combineCells(editor);
  };

  toggleSplitCellSettingDialog = () => {
    this.eventBus.dispatch(INTERNAL_EVENT.INSERT_ELEMENT, { type: ELEMENT_TYPE.TABLE_CELL });
  };

  isMergedCell() {
    const { editor } = this.props;
    const { colspan, rowspan } = getSelectedNodeByType(editor, ELEMENT_TYPE.TABLE_CELL);
    return colspan > 1 || rowspan > 1;
  }

  render() {
    const { contextStyle, isDisableFitTableWidthToScreen } = this.state;
    const { editor, t, readonly } = this.props;
    const currentTable = getSelectedNodeByType(editor, ELEMENT_TYPE.TABLE);
    if (!currentTable) return null;

    const currentRow = getSelectedNodeByType(editor, ELEMENT_TYPE.TABLE_ROW);
    const currentRowsCount = currentTable.children.length;
    const currentColumnsCount = currentRow.children.length;
    const { tableSelectedRange } = editor;
    const selectedRows = tableSelectedRange.maxRowIndex - tableSelectedRange.minRowIndex + 1;
    const selectedCols = tableSelectedRange.maxColIndex - tableSelectedRange.minColIndex + 1;
    const canAddRowsCount = currentRowsCount + selectedRows > TABLE_MAX_ROWS ? TABLE_MAX_ROWS - currentRowsCount : selectedRows;
    const canAddColsCount = currentColumnsCount + selectedCols > TABLE_MAX_COLUMNS ? TABLE_MAX_COLUMNS - currentColumnsCount : selectedCols;

    const enableCombineCell = !ObjectUtils.isSameObject(tableSelectedRange, EMPTY_SELECTED_RANGE);
    const enableSplitCell = !enableCombineCell;
    const isMergedCell = this.isMergedCell();
    const tableCellNode = getSelectedNodeByType(editor, ELEMENT_TYPE.TABLE_CELL);
    const horizontalAlign = tableCellNode?.style?.[TABLE_CELL_STYLE.TEXT_ALIGN];
    const verticalAlign = tableCellNode?.style?.[KebabToCamel(TABLE_CELL_STYLE.ALIGN_ITEMS)];
    // Check if the table width is fit to screen
    // Use queueMicrotask to resolve the issue that the table cell combined or split, the table width is not updated immediately
    queueMicrotask(() => {
      const isDisable = isTableWidthFitScreen(editor);
      if (isDisableFitTableWidthToScreen !== isDisable) {
        this.setState({ isDisableFitTableWidthToScreen: isTableWidthFitScreen(editor) });
      }
    });

    return (
      <ElementPopover className='sdoc-context-menu'>
        <div
          style={contextStyle}
          ref={ref => this.menu = ref}
          className="sdoc-table-context-menu dropdown-menu"
        >
          <InsertTableElement
            type={TABLE_ELEMENT.ROW}
            count={canAddRowsCount}
            currentCount={currentRowsCount}
            position={TABLE_ELEMENT_POSITION.BEFORE}
            insertTableElement={this.insertTableElement}
          />
          <InsertTableElement
            type={TABLE_ELEMENT.ROW}
            count={canAddRowsCount}
            currentCount={currentRowsCount}
            position={TABLE_ELEMENT_POSITION.AFTER}
            insertTableElement={this.insertTableElement}
          />
          <InsertTableElement
            type={TABLE_ELEMENT.COLUMN}
            count={canAddColsCount}
            currentCount={currentColumnsCount}
            position={TABLE_ELEMENT_POSITION.BEFORE}
            insertTableElement={this.insertTableElement}
          />
          <InsertTableElement
            type={TABLE_ELEMENT.COLUMN}
            count={canAddColsCount}
            currentCount={currentColumnsCount}
            position={TABLE_ELEMENT_POSITION.AFTER}
            insertTableElement={this.insertTableElement}
          />
          <div className={'seafile-divider dropdown-divider'}></div>
          {this.renderRemoveBtn(TABLE_ELEMENT.ROW, 'Delete_row')}
          {this.renderRemoveBtn(TABLE_ELEMENT.COLUMN, 'Delete_column')}
          {this.renderRemoveBtn(TABLE_ELEMENT.TABLE, 'Delete_table')}
          <div className={'seafile-divider dropdown-divider'}></div>
          <button
            className="dropdown-item"
            disabled={!enableCombineCell}
            onMouseDown={this.combineCells}
          >
            {t('Combine_cell')}
          </button>
          <button
            className="dropdown-item"
            disabled={!isMergedCell || !enableSplitCell}
            onMouseDown={this.toggleSplitCellSettingDialog}
          >
            {t('Split_cell')}
          </button>
          <button
            ref={this.horizontalAlignRef}
            className="dropdown-item side-extendable"
          >
            <span>{t('Horizontal_align')}</span>
            <i className='sdocfont sdoc-arrow-right'></i>
          </button>
          {this.horizontalAlignRef.current && <HorizontalAlignPopover target={this.horizontalAlignRef} editor={editor} readonly={readonly} horizontalAlign={horizontalAlign} />}
          <button
            ref={this.verticalAlignRef}
            className="dropdown-item side-extendable"
          >
            <span>{t('Vertical_align')}</span>
            <i className='sdocfont sdoc-arrow-right'></i>
          </button>
          {this.verticalAlignRef.current && <VerticalAlignPopover target={this.verticalAlignRef} editor={editor} readonly={readonly} verticalAlign={verticalAlign} />}
          <button
            ref={this.colorSelectorRef}
            className="dropdown-item side-extendable"
          >
            <span>{t('Background_color')}</span>
            <i className='sdocfont sdoc-arrow-right'></i>
          </button>
          {this.colorSelectorRef.current && <ColorSelectorPopover target={this.colorSelectorRef} editor={editor} readonly={readonly} />}
          <div className={'seafile-divider dropdown-divider'}></div>
          <button
            className="dropdown-item"
            disabled={isDisableFitTableWidthToScreen}
            onMouseDown={() => fitTableColumnToScreen(editor)}
          >
            {t('Fit_table_to_page_width')}
          </button>
        </div>
      </ElementPopover>
    );
  }
}

TableContextMenu.propTypes = {
  editor: PropTypes.object,
  t: PropTypes.func,
  readonly: PropTypes.bool,
};

export default withTranslation('sdoc-editor')(TableContextMenu);
