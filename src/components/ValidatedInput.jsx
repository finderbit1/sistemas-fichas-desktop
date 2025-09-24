/**
 * Componente de Input com Validação Integrada
 * Combina input com feedback visual de validação
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Form } from 'react-bootstrap';
import ValidationFeedback from './ValidationFeedback';
import useValidation from '../hooks/useValidation';

const ValidatedInput = ({
  name,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  type = 'text',
  required = false,
  disabled = false,
  readOnly = false,
  autoComplete = 'off',
  className = '',
  labelClassName = '',
  inputClassName = '',
  validationHook,
  validateOnChange = true,
  validateOnBlur = true,
  debounceMs = 500,
  tipoProducao = '',
  // Props específicas para diferentes tipos de input
  options = [], // Para select
  rows = 3, // Para textarea
  min,
  max,
  step,
  pattern,
  // Props de validação customizada
  customValidation,
  customErrorMessage,
  // Props de feedback
  showValidationFeedback = true,
  showSuccessFeedback = false,
  // Event handlers
  onValidationChange,
  onValidationError,
  onValidationSuccess,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value || '');
  const [isFocused, setIsFocused] = useState(false);
  const [hasBeenValidated, setHasBeenValidated] = useState(false);

  // Hook de validação local se não foi fornecido
  const localValidation = useValidation(tipoProducao);
  const validation = validationHook || localValidation;

  // Sincronizar valor interno com valor externo
  useEffect(() => {
    setInternalValue(value || '');
  }, [value]);

  // Validação em tempo real
  const handleValidation = useCallback((val, force = false) => {
    if (!validation || (!validateOnChange && !force)) return;

    // Se há validação customizada, usar ela
    if (customValidation) {
      const result = customValidation(val);
      if (result !== true) {
        onValidationError?.(result);
        return;
      }
      onValidationSuccess?.();
      return;
    }

    // Validação padrão
    if (validateOnChange || force) {
      validation.validateFieldRealTime(name, val, debounceMs);
    }
  }, [validation, validateOnChange, name, debounceMs, customValidation, onValidationError, onValidationSuccess]);

  // Handler de mudança
  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    
    // Chamar onChange do pai
    onChange?.(e);
    
    // Validar se necessário
    handleValidation(newValue);
    
    // Notificar mudança de validação
    onValidationChange?.(newValue, validation.hasFieldError(name));
  }, [onChange, handleValidation, onValidationChange, validation, name]);

  // Handler de blur
  const handleBlur = useCallback((e) => {
    setIsFocused(false);
    setHasBeenValidated(true);
    
    // Validar no blur se necessário
    if (validateOnBlur) {
      handleValidation(internalValue, true);
    }
    
    // Chamar onBlur do pai
    onBlur?.(e);
  }, [validateOnBlur, handleValidation, internalValue, onBlur]);

  // Handler de focus
  const handleFocus = useCallback((e) => {
    setIsFocused(true);
  }, []);

  // Determinar classes CSS
  const getInputClasses = () => {
    let classes = inputClassName || 'form-control';
    
    if (validation?.hasFieldError(name)) {
      classes += ' is-invalid';
    } else if (validation?.hasFieldWarning(name)) {
      classes += ' is-warning';
    } else if (hasBeenValidated && !validation?.hasFieldError(name) && internalValue) {
      classes += ' is-valid';
    }
    
    if (isFocused) {
      classes += ' focused';
    }
    
    return classes;
  };

  // Renderizar input baseado no tipo
  const renderInput = () => {
    const inputProps = {
      name,
      value: internalValue,
      onChange: handleChange,
      onBlur: handleBlur,
      onFocus: handleFocus,
      placeholder,
      disabled,
      readOnly,
      autoComplete,
      className: getInputClasses(),
      required,
      ...props
    };

    switch (type) {
      case 'select':
        return (
          <Form.Select {...inputProps}>
            {!required && <option value="">Selecione uma opção</option>}
            {options.map((option) => (
              <option key={option.value || option} value={option.value || option}>
                {option.label || option}
              </option>
            ))}
          </Form.Select>
        );

      case 'textarea':
        return (
          <Form.Control
            as="textarea"
            rows={rows}
            {...inputProps}
          />
        );

      case 'number':
        return (
          <Form.Control
            type="number"
            min={min}
            max={max}
            step={step}
            {...inputProps}
          />
        );

      case 'email':
        return (
          <Form.Control
            type="email"
            pattern={pattern}
            {...inputProps}
          />
        );

      case 'password':
        return (
          <Form.Control
            type="password"
            {...inputProps}
          />
        );

      default:
        return (
          <Form.Control
            type={type}
            pattern={pattern}
            {...inputProps}
          />
        );
    }
  };

  return (
    <div className={`validated-input validated-input--${name} ${className}`}>
      {label && (
        <Form.Label className={`form-label ${labelClassName}`}>
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </Form.Label>
      )}
      
      {renderInput()}
      
      {showValidationFeedback && (
        <div className="validation-feedback-container">
          {/* Feedback de erro */}
          {validation?.hasFieldError(name) && (
            <ValidationFeedback
              error={validation.getFieldError(name)}
              size="xs"
              className="mt-1"
            />
          )}
          
          {/* Feedback de warning */}
          {validation?.hasFieldWarning(name) && !validation?.hasFieldError(name) && (
            <ValidationFeedback
              warning={validation.getFieldWarning(name)}
              size="xs"
              className="mt-1"
            />
          )}
          
          {/* Feedback de sucesso */}
          {showSuccessFeedback && hasBeenValidated && !validation?.hasFieldError(name) && !validation?.hasFieldWarning(name) && internalValue && (
            <ValidationFeedback
              success="Campo válido"
              size="xs"
              className="mt-1"
            />
          )}
          
          {/* Loading de validação */}
          {validation?.isValidating && (
            <ValidationFeedback
              info="Validando..."
              size="xs"
              className="mt-1"
            />
          )}
        </div>
      )}
    </div>
  );
};

// Componente específico para select
export const ValidatedSelect = (props) => (
  <ValidatedInput type="select" {...props} />
);

// Componente específico para textarea
export const ValidatedTextarea = (props) => (
  <ValidatedInput type="textarea" {...props} />
);

// Componente específico para number
export const ValidatedNumber = (props) => (
  <ValidatedInput type="number" {...props} />
);

// Componente específico para email
export const ValidatedEmail = (props) => (
  <ValidatedInput type="email" {...props} />
);

export default ValidatedInput;
