import React from 'react';

const cursorStyleBase = {
  position: 'absolute',
  top: -2,
  pointerEvents: 'none',
  userSelect: 'none',
  transform: 'translateY(-100%)',
  fontSize: 10,
  color: 'white',
  background: 'palevioletred',
  whiteSpace: 'nowrap'
};

const caretStyleBase = {
  position: 'absolute',
  // pointerEvents: 'none',
  userSelect: 'none',
  height: '1.2em',
  width: 2,
  background: 'palevioletred'
};

const Caret = ({ cursor_color: color, name }) => {
  const cursorStyles = {
    ...cursorStyleBase,
    background: color,
    left: '0%',
    cursor: 'default'
  };

  const caretStyles = {
    ...caretStyleBase,
    background: color,
    left: '0%'
  };

  caretStyles['top'] = 1;

  return (
    <>
      <span className='caret-item' contentEditable={false} style={caretStyles}>
        <span style={{ position: 'relative' }}>
          <span name={name} className='caret-name' contentEditable={false} style={cursorStyles}/>
        </span>
      </span>
    </>
  );
};

export default Caret;
