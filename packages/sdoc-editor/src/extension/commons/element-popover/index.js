import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

class ElementPopover extends React.Component {

  constructor(props) {
    super(props);
    this.el = document.createElement('div');
    if (props.className) {
      this.el.className = props.className;
    }
    if (props.style) {
      this.el.style = props.style;
    }
  }

  state = {
    isMounted: false
  };

  componentDidMount() {
    document.body.appendChild(this.el);
  }

  componentDidUpdate() {
    const { className, style } = this.props;
    if (className) {
      this.el.className = className;
    }
    if (style) {
      this.el.style = style;
    }
  }

  componentWillUnmount() {
    document.body.removeChild(this.el);
  }

  render() {
    return ReactDOM.createPortal(
      this.props.children,
      this.el,
    );
  }
}

ElementPopover.propTypes = {
  className: PropTypes.string,
};

export default ElementPopover;
