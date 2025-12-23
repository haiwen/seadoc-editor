import React from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import toaster from '../../../../components/toast';
import KeyCodes from '../../../../constants/key-codes';

import './index.css';

const propTypes = {
  hasSuffix: PropTypes.bool,
  name: PropTypes.string.isRequired,
  onRenameConfirm: PropTypes.func.isRequired,
  onRenameCancel: PropTypes.func.isRequired,
  t: PropTypes.func,
};

class Rename extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      name: props.name
    };
    this.inputRef = React.createRef();
  }

  registerEventHandle = () => {
    document.addEventListener('click', this.onOutClick);
  };

  onOutClick = (event) => {
    if (!this.inputRef.current.contains(event.target)) {
      this.onRenameConfirm();
      document.removeEventListener('click', this.onOutClick);
    }
  };

  onClick = (e) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    this.registerEventHandle();
  };

  onChange = (e) => {
    this.setState({ name: e.target.value });
  };

  onKeyDown = (e) => {
    if (e.keyCode === KeyCodes.Enter) {
      this.onRenameConfirm(e);
    } else if (e.keyCode === KeyCodes.Esc) {
      this.onRenameCancel(e);
    }
    e.nativeEvent.stopImmediatePropagation();
  };

  onRenameConfirm = (e) => {
    e && e.nativeEvent.stopImmediatePropagation();
    let newName = this.state.name.trim();
    if (newName === this.props.name) {
      this.props.onRenameCancel();
      return;
    }

    let { isValid, errMessage } = this.validateInput();
    if (!isValid) {
      toaster.danger(errMessage);
      this.props.onRenameCancel();
    } else {
      this.props.onRenameConfirm(newName);
    }
  };

  onRenameCancel = (e) => {
    document.removeEventListener('click', this.onOutClick);
    e.nativeEvent.stopImmediatePropagation();
    this.props.onRenameCancel();
  };

  validateInput = () => {
    const { t } = this.props;
    let newName = this.state.name.trim();
    let isValid = true;
    let errMessage = '';

    if (newName.indexOf('/') > -1) {
      isValid = false;
      // eslint-disable-next-line no-useless-concat
      errMessage = t('Name should not include ' + '\'/\'' + '.');
      return { isValid, errMessage };
    }

    return { isValid, errMessage };
  };

  render() {
    return (
      <div className="sdoc-file-view-rename">
        <input
          ref={this.inputRef}
          value={this.state.name}
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
          onClick={this.onClick}
        />
      </div>
    );
  }
}

Rename.propTypes = propTypes;

export default withTranslation('sdoc-editor')(Rename);
