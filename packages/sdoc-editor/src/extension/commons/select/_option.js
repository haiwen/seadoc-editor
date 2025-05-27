import React from 'react';
import PropTypes from 'prop-types';

const optionPropTypes = {
  optionClass: PropTypes.string,
  isActive: PropTypes.bool,
  option: PropTypes.object,
  onOptionChanged: PropTypes.func,
};

class Option extends React.Component {

  onClick = (event) => {
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    const { option } = this.props;
    this.props.onOptionChanged(option);
  };

  render() {
    const { option, isActive, optionClass } = this.props;
    const className = `option-item ${optionClass || ''} ${isActive ? 'active' : ''}`;
    return (
      <span className={className} onClick={this.onClick}>
        {option.iconClass && <span className={`item-icon ${option.iconClass}`}></span>}
        <span className="label">{option.label}</span>
      </span>
    );
  }
}

Option.propTypes = optionPropTypes;

export default Option;
