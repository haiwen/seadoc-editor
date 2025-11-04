import React, { Component } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import ModalPortal from '../modal-portal.js';
import libIcon from './lib.png';
import SelectOptionGroup from './select-option-group.js';

import './index.css';

class DropdownSelect extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isShowSelectOptions: false
    };
  }

  onSelectToggle = (event) => {
    event.preventDefault();
    if (this.state.isShowSelectOptions) event.stopPropagation();
    let eventClassName = event.target.className;
    if (eventClassName.indexOf('sf2-icon-close') > -1 || eventClassName === 'option-group-search') return;
    if (event.target.value === '') return;
    this.setState({
      isShowSelectOptions: !this.state.isShowSelectOptions
    });
  };

  onClickOutside = (event) => {
    if (this.props.isShowSelected && event.target.className.includes('icon-fork-number')) {
      return;
    }
    if (!this.selector.contains(event.target)) {
      this.closeSelect();
    }
  };

  closeSelect = () => {
    this.setState({ isShowSelectOptions: false });
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.selectedOption?.id !== this.props.selectedOption?.id) {
      // when selectedOption change and dom rendered, calculate top
      setTimeout(() => {
        this.forceUpdate();
      }, 1);
    }
  }

  getSelectedOptionTop = () => {
    if (!this.selector) return 38;
    const { height } = this.selector.getBoundingClientRect();
    return height;
  };

  getFilterOptions = (searchValue) => {
    const { options } = this.props;
    const validSearchVal = searchValue.trim().toLowerCase();
    if (!validSearchVal) return options || [];
    return options.filter(option => option.name.toLowerCase().includes(validSearchVal));
  };

  onSelectOption = (option) => {
    this.props.onSelectOption(option);
    this.setState({ isShowSelectOptions: false });
  };

  render() {
    const { className, selectedOption, options, placeholder, searchPlaceholder, noOptionsPlaceholder, isInModal, hasIcon = false } = this.props;
    const { isShowSelectOptions } = this.state;
    const clazzName = classnames(
      'sdoc-select group-select custom-select',
      { 'focus': isShowSelectOptions },
      className
    );
    return (
      <div ref={(node) => this.selector = node} className={clazzName} onClick={this.onSelectToggle}>
        <div className="selected-option">
          {selectedOption && (
            <span className="selected-option-show">
              <span className="selected-option-item mr-1 px-1">
                {hasIcon && <img src={libIcon} width={'24px'} alt="" className='mr-2'></img>}
                <span className='selected-option-item-name'>{selectedOption.name}</span>
              </span>
            </span>
          )}
          {!selectedOption && <span className="select-placeholder">{placeholder}</span>}
          <i className="sdocfont sdoc-drop-down"></i>
        </div>
        {this.state.isShowSelectOptions && !isInModal && (
          <SelectOptionGroup
            selectedOption={selectedOption}
            top={this.getSelectedOptionTop()}
            options={options}
            onSelectOption={this.onSelectOption}
            searchPlaceholder={searchPlaceholder}
            noOptionsPlaceholder={noOptionsPlaceholder}
            onClickOutside={this.onClickOutside}
            closeSelect={this.closeSelect}
            getFilterOptions={this.getFilterOptions}
          />
        )}
        {this.state.isShowSelectOptions && isInModal && (
          <ModalPortal>
            <SelectOptionGroup
              hasIcon={hasIcon}
              className={className}
              selectedOption={selectedOption}
              position={this.selector.getBoundingClientRect()}
              isInModal={isInModal}
              top={this.getSelectedOptionTop()}
              options={options}
              onSelectOption={this.onSelectOption}
              searchPlaceholder={searchPlaceholder}
              noOptionsPlaceholder={noOptionsPlaceholder}
              onClickOutside={this.onClickOutside}
              closeSelect={this.closeSelect}
              getFilterOptions={this.getFilterOptions}
            />
          </ModalPortal>
        )}
      </div>
    );
  }
}

DropdownSelect.propTypes = {
  className: PropTypes.string,
  selectedOption: PropTypes.object,
  options: PropTypes.array,
  placeholder: PropTypes.string,
  onSelectOption: PropTypes.func,
  searchable: PropTypes.bool,
  searchPlaceholder: PropTypes.string,
  noOptionsPlaceholder: PropTypes.string,
  hasIcon: PropTypes.string,
  isInModal: PropTypes.bool, // if select component in a modal (option group need ModalPortal to show)
};

export default DropdownSelect;
