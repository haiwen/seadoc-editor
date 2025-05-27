import React from 'react';
import { Input } from 'reactstrap';
import PropTypes from 'prop-types';

function NumberInput({
  value,
  onChange,
  className,
  min = 0,
  step = 1,
  max = Infinity,
  readOnly = false,
}) {
  return (
    <Input
      type="number"
      className={className}
      value={value}
      min={min}
      step={step}
      max={max}
      readOnly={readOnly}
      onChange={onChange}
    />
  );
}

NumberInput.propTypes = {
  readOnly: PropTypes.bool,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  onChange: PropTypes.func.isRequired,
};

export default NumberInput;
