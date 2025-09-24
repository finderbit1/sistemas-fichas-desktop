/**
 * Componente de Feedback Visual para Validação
 * Exibe erros e warnings de forma elegante
 */

import React from 'react';
import { ExclamationTriangle, CheckCircle, InfoCircle, XCircle } from 'react-bootstrap-icons';

const ValidationFeedback = ({ 
  error, 
  warning, 
  success, 
  info, 
  className = '',
  size = 'sm',
  showIcon = true,
  inline = false
}) => {
  // Se não há feedback para mostrar
  if (!error && !warning && !success && !info) {
    return null;
  }

  // Determinar tipo e configurações
  let type, message, icon, iconColor, bgColor, borderColor, textColor;

  if (error) {
    type = 'error';
    message = error;
    icon = XCircle;
    iconColor = '#dc3545';
    bgColor = '#f8d7da';
    borderColor = '#f5c6cb';
    textColor = '#721c24';
  } else if (warning) {
    type = 'warning';
    message = warning;
    icon = ExclamationTriangle;
    iconColor = '#ffc107';
    bgColor = '#fff3cd';
    borderColor = '#ffeaa7';
    textColor = '#856404';
  } else if (success) {
    type = 'success';
    message = success;
    icon = CheckCircle;
    iconColor = '#28a745';
    bgColor = '#d4edda';
    borderColor = '#c3e6cb';
    textColor = '#155724';
  } else if (info) {
    type = 'info';
    message = info;
    icon = InfoCircle;
    iconColor = '#17a2b8';
    bgColor = '#d1ecf1';
    borderColor = '#bee5eb';
    textColor = '#0c5460';
  }

  const IconComponent = icon;

  // Classes CSS baseadas no tamanho
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };

  // Estilos inline para cores
  const inlineStyles = {
    backgroundColor: bgColor,
    borderColor: borderColor,
    color: textColor,
    border: `1px solid ${borderColor}`,
    borderRadius: '6px',
    display: inline ? 'inline-flex' : 'flex',
    alignItems: 'center',
    gap: '8px',
    width: inline ? 'auto' : '100%',
    minHeight: size === 'xs' ? '24px' : size === 'sm' ? '32px' : size === 'md' ? '40px' : '48px'
  };

  return (
    <div 
      className={`validation-feedback validation-feedback--${type} ${sizeClasses[size]} ${className}`}
      style={inlineStyles}
      role="alert"
      aria-live="polite"
    >
      {showIcon && IconComponent && (
        <IconComponent 
          size={size === 'xs' ? 12 : size === 'sm' ? 14 : size === 'md' ? 16 : 18} 
          style={{ color: iconColor, flexShrink: 0 }}
          aria-hidden="true"
        />
      )}
      <span className="validation-feedback__message" style={{ flex: 1 }}>
        {message}
      </span>
    </div>
  );
};

// Componente específico para feedback de campo
export const FieldValidationFeedback = ({ 
  error, 
  warning, 
  success, 
  fieldName,
  className = ''
}) => {
  return (
    <ValidationFeedback
      error={error}
      warning={warning}
      success={success}
      className={`field-feedback field-feedback--${fieldName} ${className}`}
      size="xs"
      inline={false}
    />
  );
};

// Componente para lista de erros
export const ValidationErrorList = ({ 
  errors = [], 
  title = 'Erros encontrados',
  className = '',
  showTitle = true
}) => {
  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <div className={`validation-error-list ${className}`}>
      {showTitle && (
        <div className="validation-error-list__title">
          <XCircle size={16} className="me-2" style={{ color: '#dc3545' }} />
          <strong>{title}</strong>
        </div>
      )}
      <ul className="validation-error-list__items">
        {errors.map((error, index) => (
          <li key={index} className="validation-error-list__item">
            <ValidationFeedback 
              error={error} 
              size="xs" 
              inline={true}
              showIcon={false}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

// Componente para lista de warnings
export const ValidationWarningList = ({ 
  warnings = [], 
  title = 'Avisos',
  className = '',
  showTitle = true
}) => {
  if (!warnings || warnings.length === 0) {
    return null;
  }

  return (
    <div className={`validation-warning-list ${className}`}>
      {showTitle && (
        <div className="validation-warning-list__title">
          <ExclamationTriangle size={16} className="me-2" style={{ color: '#ffc107' }} />
          <strong>{title}</strong>
        </div>
      )}
      <ul className="validation-warning-list__items">
        {warnings.map((warning, index) => (
          <li key={index} className="validation-warning-list__item">
            <ValidationFeedback 
              warning={warning} 
              size="xs" 
              inline={true}
              showIcon={false}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

// Componente de loading para validação
export const ValidationLoading = ({ 
  message = 'Validando...',
  size = 'sm',
  className = ''
}) => {
  return (
    <div className={`validation-loading ${className}`} style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: '#6c757d',
      fontSize: size === 'xs' ? '12px' : size === 'sm' ? '14px' : '16px'
    }}>
      <div className="spinner-border spinner-border-sm" role="status" aria-hidden="true">
        <span className="visually-hidden">{message}</span>
      </div>
      <span>{message}</span>
    </div>
  );
};

export default ValidationFeedback;
