
import React from 'react';
import PropTypes from 'prop-types';
import Option from './_option';
import FieldSetting from './field-setting';

import './style.css';

const propTypes = {
  isSelected: PropTypes.bool,
  selectClass: PropTypes.string,
  optionClass: PropTypes.string,
  defaultOptionName: PropTypes.string,
  value: PropTypes.object,
  options: PropTypes.array.isRequired,
  onChange: PropTypes.func,
};

class Select extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isShowSelector: false,
      currentOption: this.getCurrentOption(),
    };
    this.dropdownContainerHasInit = false;
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleSelector);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleSelector);
  }

  componentDidUpdate() {
    const { options } = this.props;
    const { currentOption } = this.state;
    const activeIndex = currentOption && options.findIndex(option => option.value === currentOption.value);
    if (activeIndex > -1) {
      const scrollTop = 48 + (activeIndex + 1) * 32 - 150;
      if (scrollTop < 0) return;
      if (this.dropdownContainer && !this.dropdownContainerHasInit) {
        this.dropdownContainerHasInit = true;
        this.dropdownContainer.scrollTop = scrollTop;
      }
    }
  }

  handleSelector = (event) => {
    if (this.selector && !this.selector.contains(event.target)) {
      this.setState({ isShowSelector: false });
    }
  };

  getCurrentOption = () => {
    const { value, options } = this.props;
    const currentOption = value && options.find(option => option.value === value.value);
    return currentOption;
  };

  onSelectToggle = (event) => {
    const { isShowSelector } = this.state;
    const newValue = !isShowSelector;
    if (newValue) {
      this.dropdownContainerHasInit = false;
    }
    this.setState({ isShowSelector: newValue });
  };

  onChange = (option) => {
    this.setState({
      isShowSelector: false,
      currentOption: option
    });
    this.props.onChange(option);
  };

  onUpdateOption = (option) => {
    this.setState({ currentOption: option });
    this.props.onChange(option);
  };

  setContainerRef = (ref) => {
    this.dropdownContainer = ref;
  };

  setSelectorRef = (ref) => {
    this.selector = ref;
  };

  render() {
    const { selectClass, optionClass, isSelected, options, placeholder } = this.props;
    const { currentOption, isShowSelector } = this.state;
    const isActive = isShowSelector || isSelected;

    return (
      <span ref={this.setSelectorRef} className={`sdoc-select-container ${selectClass || ''}`}>
        <span className={`sdoc-control-container ${isActive ? 'active' : ''}`} onClick={this.onSelectToggle}>
          {!currentOption && <span className='sdoc-select-label placeholder'>{placeholder}</span>}
          {currentOption &&
            <>
              <span className={`sdoc-control-icon ${currentOption.iconClass}`}></span>
              <span className='control-label'>{currentOption.label}</span>
            </>
          }
          <span className='sdoc-select-operation'>
            <i className="sdocfont sdoc-arrow-down sdoc-select-arrow"></i>
          </span>
        </span>
        {isShowSelector && (
          <span className="sdoc-select-popover">
            <FieldSetting option={currentOption} onUpdateOption={this.onUpdateOption} />
            <span className='sdoc-option-item-divider'></span>
            <span className="sdoc-option-item-wrapper" ref={this.setContainerRef}>
              {options.map(option => {
                const isActive = option.value === (currentOption && currentOption.value);
                return (
                  <Option
                    key={option.value}
                    optionClass={optionClass}
                    isActive={isActive}
                    option={option}
                    onOptionChanged={this.onChange}
                  />
                );
              })}
            </span>
          </span>
        )}
      </span>
    );
  }
}

Select.propTypes = propTypes;

export default Select;
