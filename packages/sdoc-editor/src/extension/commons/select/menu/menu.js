import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  position: PropTypes.object,
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.object])
};

class Menu extends React.Component {

  getStyle = () => {
    const { position } = this.props;
    const { width } = position;
    return {
      marginLeft: width - 10,
      marginTop: '30px',
    };
  };

  render() {
    const style = this.getStyle();
    return (
      <span className='sdoc-menu-container' style={style}>
        {this.props.children}
      </span>
    );
  }
}

Menu.propTypes = propTypes;

export default Menu;
