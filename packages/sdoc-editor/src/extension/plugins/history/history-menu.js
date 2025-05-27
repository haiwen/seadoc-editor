import React from 'react';
import PropTypes from 'prop-types';
import { MenuItem } from '../../commons';
import { MENUS_CONFIG_MAP, REDO, UNDO } from '../../constants';

const propTypes = {
  readonly: PropTypes.bool,
  isRichEditor: PropTypes.bool,
  className: PropTypes.string,
  editor: PropTypes.object,
};

class HistoryMenu extends React.Component {

  isDisabled = (type) => {
    const { editor, readonly } = this.props;
    if (readonly) return true;
    const { history } = editor;
    if (type === UNDO) {
      return history.undos.length === 0;
    }

    return history.redos.length === 0;
  };

  onUndoMouseDown = () => {
    const { editor } = this.props;

    editor.undo();
  };

  onRedoMouseDown = () => {
    const { editor } = this.props;
    editor.redo();
  };

  render() {
    const { isRichEditor, className } = this.props;
    const undoConfig = MENUS_CONFIG_MAP[UNDO];
    const redoConfig = MENUS_CONFIG_MAP[REDO];

    const undoProps = {
      isRichEditor,
      className,
      ariaLabel: 'undo',
      ...undoConfig,
      disabled: this.isDisabled(UNDO),
      isActive: false,
      onMouseDown: this.onUndoMouseDown,
    };

    const redoProps = {
      isRichEditor,
      className,
      ariaLabel: 'redo',
      ...redoConfig,
      disabled: this.isDisabled(REDO),
      isActive: false,
      onMouseDown: this.onRedoMouseDown,
    };

    return (
      <>
        <MenuItem {...undoProps} />
        <MenuItem {...redoProps} />
      </>
    );

  }
}

HistoryMenu.propTypes = propTypes;

export default HistoryMenu;
