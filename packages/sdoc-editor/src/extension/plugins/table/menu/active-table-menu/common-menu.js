import React, { Component } from 'react';
import { UncontrolledPopover } from 'reactstrap';
import PropTypes from 'prop-types';

class CommonMenu extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isShowMenu: false,
    };
  }

  getClassName = () => {
    const { isRichEditor = true, className = 'menu-group-item', disabled } = this.props;

    let itemClass = 'btn btn-icon btn-secondary btn-active d-flex';
    if (!isRichEditor) {
      return itemClass + ' ' + className + ' sdoc-menu-with-dropdown';
    }

    itemClass = `rich-icon-btn d-flex ${disabled ? 'rich-icon-btn-disabled' : 'rich-icon-btn-hover'}`;
    return itemClass + ' ' + className + ' sdoc-menu-with-dropdown';
  };

  hidePopover = () => {
    this.ref && this.ref.toggle && this.ref.toggle();
  };

  setRef = (ref) => {
    this.ref = ref;
    if (!this.ref) return;
    const { toggle } = this.ref;
    this.ref.toggle = () => {
      toggle && toggle();
      this.setState({ isShowMenu: !this.state.isShowMenu });
    };
  };

  render() {
    const { id, iconClass, children, disabled } = this.props;
    const { isShowMenu } = this.state;

    return (
      <>
        <button id={id} type="button" className={this.getClassName()}>
          <div className="sdoc-menu-with-dropdown-icon">
            <i className={iconClass} />
          </div>
          <div className="sdoc-menu-with-dropdown-triangle">
            <i className={`sdoc-menu-with-dropdown-triangle-icon sdocfont sdoc-${isShowMenu ? 'caret-up' : 'drop-down'}`}></i>
          </div>
        </button>
        {!disabled && (
          <UncontrolledPopover
            target={id}
            className="sdoc-common-menu-popover sdoc-table-menu-popover"
            trigger="legacy"
            placement="bottom-start"
            hideArrow={true}
            fade={false}
            ref={this.setRef}
          >
            <div className="sdoc-dropdown-menu">
              {children}
            </div>
          </UncontrolledPopover>
        )}
      </>
    );
  }
}

CommonMenu.propTypes = {
  disabled: PropTypes.bool,
  isRichEditor: PropTypes.bool,
  id: PropTypes.string,
  iconClass: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.any,
};

export default CommonMenu;
