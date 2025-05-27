import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { Input } from 'reactstrap';
import isHotkey from 'is-hotkey';
import PropTypes from 'prop-types';
import { TABLE_MAX_COLUMNS, TABLE_MAX_ROWS, TABLE_ELEMENT, TABLE_ELEMENT_POSITION } from '../../constants';

class InsertTableElement extends Component {

  constructor(props) {
    super(props);
    this.state = {
      count: props.count || 1,
    };
    this.maxCount = props.type === TABLE_ELEMENT.ROW ? TABLE_MAX_ROWS : TABLE_MAX_COLUMNS;
  }

  insertTableElement = () => {
    const { type, position } = this.props;
    const { count } = this.state;
    this.props.insertTableElement(type, position, count);
  };

  getTip = () => {
    const { type, position, t } = this.props;
    if (type === TABLE_ELEMENT.ROW) {
      return position === TABLE_ELEMENT_POSITION.AFTER ? t('Insert_below') : t('Insert_above');
    }
    return position === TABLE_ELEMENT_POSITION.AFTER ? t('Insert_on_the_right') : t('Insert_on_the_left');
  };

  onKeyDown = (event) => {
    if (isHotkey('enter', event)) {
      event.preventDefault();
      this.insertTableElement();
      return;
    }
  };

  onChange = (event) => {
    const value = event.target.value || '0';
    const newValue = value ? value.replace(/[^\d,]/g, '') : value;
    if (newValue === this.state.count) return;
    const { currentCount } = this.props;
    const numberValue = parseInt(newValue);
    if (currentCount + numberValue > this.maxCount) {
      this.setState({ count: this.maxCount - currentCount });
      return;
    }
    this.setState({ count: numberValue });
  };

  render() {
    const { count } = this.state;
    const { t, type, currentCount } = this.props;
    const isDisabled = currentCount >= this.maxCount;

    return (
      <button
        onMouseDown={this.insertTableElement}
        className="dropdown-item d-flex align-items-center justify-content-between"
        disabled={isDisabled}
      >
        {this.getTip()}
        <div className="insert-number d-flex align-items-center">
          <Input
            disabled={isDisabled}
            className="insert-number-input"
            onMouseDown={e => {
              e.stopPropagation();
            }}
            onKeyDown={this.onKeyDown}
            value={count}
            onChange={this.onChange}
          />
          <span>{type === TABLE_ELEMENT.ROW ? t('Row(s)') : t('Column(s)')}</span>
        </div>
      </button>
    );
  }
}

InsertTableElement.propTypes = {
  type: PropTypes.string,
  count: PropTypes.number,
  position: PropTypes.string,
  insertTableElement: PropTypes.func,
  t: PropTypes.func,
};

export default withTranslation('sdoc-editor')(InsertTableElement);
