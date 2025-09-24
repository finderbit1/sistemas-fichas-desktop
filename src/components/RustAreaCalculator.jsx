/**
 * Calculadora de Área Otimizada com Rust/WASM
 * Alta performance para cálculos de dimensões
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Form, InputGroup, Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { Calculator, Zap, CheckCircle, ExclamationTriangle } from 'react-bootstrap-icons';
import { useAreaCalculator } from '../hooks/useRustPerformance';
import ValidationFeedback from './ValidationFeedback';

const RustAreaCalculator = ({ 
  formData, 
  onChange, 
  className = '',
  showPerformance = true,
  showValidation = true 
}) => {
  const { 
    initialized, 
    loading, 
    error, 
    calculateArea, 
    results 
  } = useAreaCalculator();
  
  const [localForm, setLocalForm] = useState({
    largura: formData?.largura || '',
    altura: formData?.altura || '',
    area: formData?.area || ''
  });

  const [performance, setPerformance] = useState({
    lastCalculation: 0,
    totalCalculations: 0,
    averageTime: 0
  });

  // Sincronizar com dados externos
  useEffect(() => {
    if (formData) {
      setLocalForm(prev => ({
        ...prev,
        largura: formData.largura || '',
        altura: formData.altura || '',
        area: formData.area || ''
      }));
    }
  }, [formData]);

  // Calcular área com Rust quando dimensões mudam
  useEffect(() => {
    if (!initialized || !localForm.largura || !localForm.altura) {
      return;
    }

    const width = parseFloat(localForm.largura.replace(',', '.'));
    const height = parseFloat(localForm.altura.replace(',', '.'));

    if (isNaN(width) || isNaN(height)) {
      return;
    }

    const start = performance.now();
    const result = calculateArea(width, height);
    const end = performance.now();

    if (result) {
      const calculationTime = end - start;
      
      // Atualizar performance
      setPerformance(prev => {
        const totalCalculations = prev.totalCalculations + 1;
        const averageTime = (prev.averageTime * prev.totalCalculations + calculationTime) / totalCalculations;
        
        return {
          lastCalculation: calculationTime,
          totalCalculations,
          averageTime
        };
      });

      // Atualizar área
      setLocalForm(prev => ({
        ...prev,
        area: result.formatted_area
      }));

      // Notificar componente pai
      if (onChange) {
        onChange({
          largura: localForm.largura,
          altura: localForm.altura,
          area: result.formatted_area,
          validation: result.validation
        });
      }
    }
  }, [localForm.largura, localForm.altura, initialized, calculateArea, onChange]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    setLocalForm(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Loading state
  if (loading) {
    return (
      <Card className={`rust-area-calculator loading ${className}`}>
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

  // Not initialized
  if (!initialized) {
    return (
      <Alert variant="warning" className={className}>
        <ExclamationTriangle className="me-2" />
        Engine Rust não inicializado
      </Alert>
    );
  }

  const currentResult = results[`${localForm.largura}x${localForm.altura}`];
  const hasValidation = currentResult?.validation;

  return (
    <Card className={`rust-area-calculator ${className}`}>
      <Card.Header className="d-flex align-items-center">
        <Calculator className="me-2" style={{ color: 'var(--color-primary)' }} />
        <strong>Calculadora de Área (Rust)</strong>
        {showPerformance && performance.totalCalculations > 0 && (
          <div className="ms-auto">
            <small className="text-muted">
              <Zap size={12} className="me-1" />
              {performance.lastCalculation.toFixed(2)}ms
            </small>
          </div>
        )}
      </Card.Header>
      
      <Card.Body>
        <Row>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Largura (cm)</Form.Label>
              <Form.Control
                type="text"
                name="largura"
                value={localForm.largura}
                onChange={handleChange}
                placeholder="Ex: 150,5"
                className="form-control"
              />
              {showValidation && hasValidation && hasValidation.valid && (
                <ValidationFeedback
                  success="Dimensão válida"
                  size="xs"
                  className="mt-1"
                />
              )}
              {showValidation && hasValidation && !hasValidation.valid && (
                <ValidationFeedback
                  error={hasValidation.errors[0]}
                  size="xs"
                  className="mt-1"
                />
              )}
            </Form.Group>
          </Col>
          
          <Col md={4}>
            <Form.Group>
              <Form.Label>Altura (cm)</Form.Label>
              <Form.Control
                type="text"
                name="altura"
                value={localForm.altura}
                onChange={handleChange}
                placeholder="Ex: 200,75"
                className="form-control"
              />
              {showValidation && hasValidation && hasValidation.valid && (
                <ValidationFeedback
                  success="Dimensão válida"
                  size="xs"
                  className="mt-1"
                />
              )}
              {showValidation && hasValidation && !hasValidation.valid && (
                <ValidationFeedback
                  error={hasValidation.errors[0]}
                  size="xs"
                  className="mt-1"
                />
              )}
            </Form.Group>
          </Col>
          
          <Col md={4}>
            <Form.Group>
              <Form.Label>Área (m²)</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  value={localForm.area}
                  readOnly
                  className="form-control bg-light"
                  placeholder="0,00"
                />
                <InputGroup.Text>m²</InputGroup.Text>
              </InputGroup>
              {localForm.area && (
                <ValidationFeedback
                  success="Área calculada"
                  size="xs"
                  className="mt-1"
                />
              )}
            </Form.Group>
          </Col>
        </Row>

        {showPerformance && performance.totalCalculations > 0 && (
          <Row className="mt-3">
            <Col>
              <Card className="bg-light">
                <Card.Body className="py-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      <strong>Performance:</strong>
                    </small>
                    <div className="d-flex gap-3">
                      <small>
                        <Zap size={12} className="me-1" />
                        Última: {performance.lastCalculation.toFixed(2)}ms
                      </small>
                      <small>
                        <CheckCircle size={12} className="me-1" />
                        Média: {performance.averageTime.toFixed(2)}ms
                      </small>
                      <small>
                        Total: {performance.totalCalculations}
                      </small>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {showValidation && hasValidation && hasValidation.warnings.length > 0 && (
          <Row className="mt-2">
            <Col>
              <ValidationFeedback
                warning={hasValidation.warnings[0]}
                size="sm"
              />
            </Col>
          </Row>
        )}
      </Card.Body>
    </Card>
  );
};

export default RustAreaCalculator;
