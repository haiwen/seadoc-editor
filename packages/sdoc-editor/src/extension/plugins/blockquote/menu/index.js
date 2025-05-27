import React from 'react';
import PropTypes from 'prop-types';
import { MenuItem } from '../../../commons';
import { BLOCKQUOTE, MENUS_CONFIG_MAP } from '../../../constants';
import { getBlockQuoteType, insertBlockQuote, isMenuDisabled } from '../helpers';

const propTypes = {
  readonly: PropTypes.bool,
  isRichEditor: PropTypes.bool,
  className: PropTypes.string,
  editor: PropTypes.object,
};

class QuoteMenu extends React.Component {

  isActive = () => {
    const { editor } = this.props;
    return getBlockQuoteType(editor) === BLOCKQUOTE;
  };

  isDisabled = () => {
    const { editor, readonly } = this.props;
    return isMenuDisabled(editor, readonly);
  };

  onMouseDown = (e) => {
    const { editor } = this.props;

    const active = this.isActive(editor);
    insertBlockQuote(editor, active);
  };

  render() {
    const { isRichEditor, className } = this.props;
    const menuConfig = MENUS_CONFIG_MAP[BLOCKQUOTE];
    const props = {
      isRichEditor,
      className,
      ariaLabel: 'blockquote',
      ...menuConfig,
      disabled: this.isDisabled(),
      isActive: this.isActive(),
      onMouseDown: this.onMouseDown,
    };

    return <MenuItem { ...props } />;
  }
}

QuoteMenu.propTypes = propTypes;

export default QuoteMenu;
