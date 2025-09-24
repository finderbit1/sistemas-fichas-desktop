/**
 * Input de Valores Monetários Otimizado com Rust/WASM
 * Alta performance para processamento de valores em formato brasileiro
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Form, InputGroup, Card, Row, Col, Spinner, Alert, Button } from 'react-bootstrap';
import { CurrencyDollar, Zap, CheckCircle, ExclamationTriangle, Calculator } from 'react-bootstrap-icons';
import { useMoneyProcessor } from '../hooks/useRustPerformance';
import ValidationFeedback from './ValidationFeedback';

const RustMoneyInput = ({ 
  name,
  label,
  value,
  onChange,
  required = false,
  placeholder = "0,00",
  className = '',
  showPerformance = false,
  showValidation = true,
  allowNegative = false
}) => {
  const { 
    initialized, 
    loading, 
    error, 
    parseMoney, 
    formatMoney,
    processedValues 
  } = useMoneyProcessor();
  
  const [localValue, setLocalValue] = useState(value || '');
  const [performance, setPerformance] = useState({
    lastProcessing: 0,
    totalProcessing: 0,
    averageTime: 0
  });

  // Sincronizar com valor externo
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = useCallback((e) => {
    const inputValue = e.target.value;
    
    // Permitir apenas números e vírgula
    const cleaned = inputValue.replace(/[^\d,]/g, '');
    
    setLocalValue(cleaned);

    // Processar com Rust se engine estiver pronto
    if (initialized && cleaned) {
      const start = performance.now();
      const result = parseMoney(cleaned);
      const end = performance.now();

      if (result) {
        const processingTime = end - start;
        
        // Atualizar performance
        setPerformance(prev => {
          const totalProcessing = prev.totalProcessing + 1;
          const averageTime = (prev.averageTime * prev.totalProcessing + processingTime) / totalProcessing;
          
          return {
            lastProcessing: processingTime,
            totalProcessing,
            averageTime
          };
        });

        // Notificar componente pai
        if (onChange) {
          const syntheticEvent = {
            target: {
              name,
              value: result.formatted_value
            }
          };
          onChange(syntheticEvent);
        }
      }
    } else if (onChange) {
      // Se não estiver inicializado, usar valor limpo
      const syntheticEvent = {
        target: {
          name,
          value: cleaned
        }
      };
      onChange(syntheticEvent);
    }
  }, [initialized, name, onChange, parseMoney]);

  const handleBlur = useCallback(() => {
    if (initialized && localValue) {
      const result = parseMoney(localValue);
      if (result && result.formatted_value !== localValue) {
        setLocalValue(result.formatted_value);
        if (onChange) {
          const syntheticEvent = {
            target: {
              name,
              value: result.formatted_value
            }
          };
          onChange(syntheticEvent);
        }
      }
    }
  }, [initialized, localValue, name, onChange, parseMoney]);

  const currentResult = processedValues[localValue];

  // Loading state
  if (loading) {
    return (
      <Card className={`rust-money-input loading ${className}`}>
        <Card.Body className="text-center">
          <Spinner animation="border" size="sm" className="me-2" />
          <span>Inicializando engine Rust...</span>
        </Card.Body>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="danger" className={className}>
        <ExclamationTriangle className="me-2" />
        Erro ao inicializar engine Rust: {error}
      </Alert>
    );
  }

  // Not initialized - fallback para input normal
  if (!initialized) {
    return (
      <Form.Group className={className}>
        {label && (
          <Form.Label>
            {label}
            {required && <span className="text-danger ms-1">*</span>}
          </Form.Label>
        )}
        <InputGroup>
          <InputGroup.Text>R$</InputGroup.Text>
          <Form.Control
            type="text"
            name={name}
            value={localValue}
            onChange={handleChange}
            placeholder={placeholder}
            required={required}
            className="form-control"
          />
        </InputGroup>
        <Form.Text className="text-muted">
          Engine Rust não disponível - usando fallback
        </Form.Text>
      </Form.Group>
    );
  }

  return (
    <div className={`rust-money-input ${className}`}>
      {label && (
        <Form.Label>
          <CurrencyDollar size={16} className="me-1" />
          {label}
          {required && <span className="text-danger ms-1">*</span>}
          {showPerformance && performance.totalProcessing > 0 && (
            <small className="text-muted ms-2">
              <Zap size={12} className="me-1" />
              {performance.lastProcessing.toFixed(2)}ms
            </small>
          )}
        </Form.Label>
      )}
      
      <InputGroup>
        <InputGroup.Text>R$</InputGroup.Text>
        <Form.Control
          type="text"
          name={name}
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          className={`form-control ${
            currentResult?.validation?.valid ? 'is-valid' : 
            currentResult?.validation?.errors?.length ? 'is-invalid' : ''
          }`}
        />
      </InputGroup>

      {/* Feedback de validação */}
      {showValidation && currentResult?.validation && (
        <div className="mt-1">
          {currentResult.validation.valid ? (
            <ValidationFeedback
              success={`Valor: R$ ${currentResult.formatted_value}`}
              size="xs"
            />
          ) : (
            <ValidationFeedback
              error={currentResult.validation.errors[0]}
              size="xs"
            />
          )}
          
          {currentResult.validation.warnings?.length > 0 && (
            <ValidationFeedback
              warning={currentResult.validation.warnings[0]}
              size="xs"
            />
          )}
        </div>
      )}

      {/* Performance stats */}
      {showPerformance && performance.totalProcessing > 0 && (
        <Card className="bg-light mt-2">
          <Card.Body className="py-2">
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted">
                <strong>Performance Rust:</strong>
              </small>
              <div className="d-flex gap-3">
                <small>
                  <Zap size={12} className="me-1" />
                  Última: {performance.lastProcessing.toFixed(2)}ms
                </small>
                <small>
                  <CheckCircle size={12} className="me-1" />
                  Média: {performance.averageTime.toFixed(2)}ms
                </small>
                <small>
                  Total: {performance.totalProcessing}
                </small>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Debug info */}
      {currentResult && (
        <Form.Text className="text-muted">
          <small>
            Raw: {currentResult.raw_value} | 
            Cents: {currentResult.cents} | 
            Formatted: {currentResult.formatted_value}
          </small>
        </Form.Text>
      )}
    </div>
  );
};

// Componente para múltiplos valores monetários
export const RustMoneyCalculator = ({ 
  values = [], 
  onTotalChange,
  className = '' 
}) => {
  const { 
    initialized, 
    loading, 
    error, 
    calculateTotal 
  } = useMoneyProcessor();
  
  const [total, setTotal] = useState(null);
  const [performance, setPerformance] = useState({
    lastCalculation: 0,
    totalCalculations: 0
  });

  useEffect(() => {
    if (!initialized || values.length === 0) return;

    const start = performance.now();
    const result = calculateTotal(values);
    const end = performance.now();

    if (result) {
      const calculationTime = end - start;
      
      setPerformance(prev => ({
        lastCalculation: calculationTime,
        totalCalculations: prev.totalCalculations + 1
      }));

      setTotal(result);
      
      if (onTotalChange) {
        onTotalChange(result);
      }
    }
  }, [values, initialized, calculateTotal, onTotalChange]);

  if (loading || !initialized) {
    return (
      <Card className={`rust-money-calculator ${className}`}>
        <Card.Body className="text-center">
          <Spinner animation="border" size="sm" className="me-2" />
          <span>Calculando total...</span>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className={className}>
        <ExclamationTriangle className="me-2" />
        Erro: {error}
      </Alert>
    );
  }

  return (
    <Card className={`rust-money-calculator ${className}`}>
      <Card.Header className="d-flex align-items-center">
        <Calculator className="me-2" />
        <strong>Calculadora de Total (Rust)</strong>
        {performance.totalCalculations > 0 && (
          <small className="text-muted ms-auto">
            <Zap size={12} className="me-1" />
            {performance.lastCalculation.toFixed(2)}ms
          </small>
        )}
      </Card.Header>
      
      <Card.Body>
        {total ? (
          <div className="text-center">
            <h4 className="text-success">
              R$ {total.formatted_value}
            </h4>
            <small className="text-muted">
              {values.length} valores processados
            </small>
            
            {total.validation?.warnings?.length > 0 && (
              <ValidationFeedback
                warning={total.validation.warnings[0]}
                size="sm"
                className="mt-2"
              />
            )}
          </div>
        ) : (
          <div className="text-center text-muted">
            Adicione valores para calcular o total
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default RustMoneyInput;
