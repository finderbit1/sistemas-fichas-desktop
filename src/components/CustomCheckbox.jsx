import React from 'react';

const CustomCheckbox = ({ id, label, checked, onChange, disabled = false, name, value }) => {
  return (
    <label className={`ccheck ${disabled ? 'ccheck--disabled' : ''}`} htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        className="ccheck__input"
        checked={!!checked}
        onChange={onChange}
        disabled={disabled}
        name={name}
        value={value}
      />
      <span className="ccheck__box" aria-hidden="true" />
      <span className="ccheck__label">{label}</span>
    </label>
  );
};

export default CustomCheckbox;




