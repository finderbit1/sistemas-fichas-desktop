import React from 'react';

const CustomRadio = ({ id, label, checked, onChange, disabled = false, name, value }) => {
  return (
    <label className={`cradio ${disabled ? 'cradio--disabled' : ''}`} htmlFor={id}>
      <input
        id={id}
        type="radio"
        className="cradio__input"
        checked={!!checked}
        onChange={onChange}
        disabled={disabled}
        name={name}
        value={value}
      />
      <span className="cradio__dot" aria-hidden="true" />
      <span className="cradio__label">{label}</span>
    </label>
  );
};

export default CustomRadio;




