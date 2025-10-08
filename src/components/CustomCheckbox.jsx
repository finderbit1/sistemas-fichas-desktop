import React from 'react';
import './CustomCheckbox.css';

const CustomCheckbox = ({ 
  checked, 
  onChange, 
  disabled = false, 
  size = 'large',
  className = '',
  label = '',
  labelPosition = 'right', // 'left' | 'right' | 'top' | 'bottom'
  showLabel = true,
  ...props 
}) => {
  const sizeClass = `custom-checkbox-${size}`;
  
  const renderLabel = () => {
    if (!label || !showLabel) return null;
    
    return (
      <span className={`custom-checkbox-label custom-checkbox-label-${labelPosition}`}>
        {label}
      </span>
    );
  };
  
  const checkboxElement = (
    <>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="custom-checkbox-input"
        {...props}
      />
      <div className="custom-checkbox-display">
        {checked && (
          <svg className="custom-checkbox-checkmark" viewBox="0 0 24 24" fill="none">
            <path 
              d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" 
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </>
  );
  
  return (
    <label className={`custom-checkbox-wrapper ${sizeClass} ${className} ${label ? 'custom-checkbox-with-label' : ''}`}>
      {labelPosition === 'left' && renderLabel()}
      {labelPosition === 'top' && renderLabel()}
      
      {checkboxElement}
      
      {labelPosition === 'right' && renderLabel()}
      {labelPosition === 'bottom' && renderLabel()}
    </label>
  );
};

export default CustomCheckbox;