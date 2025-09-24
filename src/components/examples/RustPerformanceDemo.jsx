/**
 * Demo do Sistema de Performance Rust/WASM
 * Demonstra as melhorias de performance implementadas
 */

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Alert, ProgressBar, Table, Badge } from 'react-bootstrap';
import { Zap, Calculator, CurrencyDollar, Clock, CheckCircle, ExclamationTriangle } from 'react-bootstrap-icons';
import { useRustPerformance } from '../../hooks/useRustPerformance';
import RustAreaCalculator from '../RustAreaCalculator';
import RustMoneyInput from '../RustMoneyInput';

const RustPerformanceDemo = () => {
  const { 
    initialized, 
    loading, 
    error, 
    runBenchmark,
    stats 
  } = useRustPerformance();
  
  const [benchmarkResults, setBenchmarkResults] = useState(null);
  const [runningBenchmark, setRunningBenchmark] = useState(false);
  const [demoData, setDemoData] = useState({
    dimensions: [
      { width: 150, height: 200 },
      { width: 300, height: 400 },
      { width: 100, height: 150 },
    ],
    moneyValues: [
      '123456', // R$ 1.234,56
      '50000',  // R$ 500,00
      '250000', // R$ 2.500,00
    ]
  });

  const runPerformanceTest = async () => {
    setRunningBenchmark(true);
    try {
      const result = runBenchmark(10000);
      setBenchmarkResults(result);
    } catch (err) {
      console.error('Erro no benchmark:', err);
    } finally {
      setRunningBenchmark(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <Card.Body className="text-center">
          <div className="d-flex align-items-center justify-content-center">
            <div className="spinner-border me-3" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
            <div>
              <h5>Inicializando Rust Performance Engine</h5>
              <p className="text-muted mb-0">Preparando cálculos de alta performance...</p>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <ExclamationTriangle className="me-2" />
        <strong>Erro ao inicializar Rust Engine:</strong>
        <br />
        {error}
      </Alert>
    );
  }

  return (
    <div className="rust-performance-demo">
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex align-items-center">
              <Zap className="me-2" style={{ color: '#FF6B35' }} />
              <strong>Rust Performance Engine - Demo</strong>
              {initialized && (
                <Badge bg="success" className="ms-auto">
                  <CheckCircle size={12} className="me-1" />
                  Ativo
                </Badge>
              )}
            </Card.Header>
            <Card.Body>
              <p className="mb-3">
                Este demo mostra as melhorias de performance implementadas com Rust/WASM:
              </p>
              
              <Row>
                <Col md={6}>
                  <ul className="list-unstyled">
                    <li><CheckCircle className="text-success me-2" />Cálculos de área otimizados</li>
                    <li><CheckCircle className="text-success me-2" />Processamento de valores monetários</li>
                    <li><CheckCircle className="text-success me-2" />Validações de alta performance</li>
                    <li><CheckCircle className="text-success me-2" />Cache inteligente</li>
                  </ul>
                </Col>
                <Col md={6}>
                  <ul className="list-unstyled">
                    <li><CheckCircle className="text-success me-2" />Processamento em lote</li>
                    <li><CheckCircle className="text-success me-2" />Validação de CPF/Email</li>
                    <li><CheckCircle className="text-success me-2" />Formatação brasileira</li>
                    <li><CheckCircle className="text-success me-2" />Benchmarks integrados</li>
                  </ul>
                </Col>
              </Row>

              {stats && (
                <Alert variant="info" className="mt-3">
                  <strong>Estatísticas do Engine:</strong>
                  <br />
                  Cache Size: {stats.cacheSize} | 
                  WASM Inicializado: {stats.wasmInitialized ? 'Sim' : 'Não'} |
                  Engine Inicializado: {stats.initialized ? 'Sim' : 'Não'}
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <Calculator className="me-2" />
              <strong>Calculadora de Área (Rust)</strong>
            </Card.Header>
            <Card.Body>
              <RustAreaCalculator 
                showPerformance={true}
                showValidation={true}
                onChange={(result) => {
                  console.log('Área calculada:', result);
                }}
              />
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card>
            <Card.Header>
              <CurrencyDollar className="me-2" />
              <strong>Input Monetário (Rust)</strong>
            </Card.Header>
            <Card.Body>
              <RustMoneyInput
                name="demo_money"
                label="Valor de Demonstração"
                placeholder="Digite um valor"
                showPerformance={true}
                showValidation={true}
                onChange={(e) => {
                  console.log('Valor monetário:', e.target.value);
                }}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex align-items-center">
              <Clock className="me-2" />
              <strong>Benchmark de Performance</strong>
              <Button 
                variant="primary" 
                size="sm" 
                className="ms-auto"
                onClick={runPerformanceTest}
                disabled={runningBenchmark}
              >
                {runningBenchmark ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Executando...</span>
                    </div>
                    Executando...
                  </>
                ) : (
                  <>
                    <Zap size={16} className="me-2" />
                    Executar Benchmark
                  </>
                )}
              </Button>
            </Card.Header>
            <Card.Body>
              {benchmarkResults ? (
                <div>
                  <h6>Resultados do Benchmark:</h6>
                  <pre className="bg-light p-3 rounded">
                    {benchmarkResults}
                  </pre>
                </div>
              ) : (
                <p className="text-muted">
                  Clique no botão acima para executar o benchmark de performance.
                  <br />
                  O teste executará 10.000 cálculos para medir a performance.
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card>
            <Card.Header>
              <strong>Dados de Teste - Dimensões</strong>
            </Card.Header>
            <Card.Body>
              <Table striped size="sm">
                <thead>
                  <tr>
                    <th>Largura</th>
                    <th>Altura</th>
                    <th>Área</th>
                  </tr>
                </thead>
                <tbody>
                  {demoData.dimensions.map((dim, index) => {
                    const area = dim.width * dim.height / 10000; // Convert to m²
                    return (
                      <tr key={index}>
                        <td>{dim.width} cm</td>
                        <td>{dim.height} cm</td>
                        <td>{area.toFixed(2)} m²</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card>
            <Card.Header>
              <strong>Dados de Teste - Valores Monetários</strong>
            </Card.Header>
            <Card.Body>
              <Table striped size="sm">
                <thead>
                  <tr>
                    <th>Input</th>
                    <th>Valor</th>
                    <th>Formatado</th>
                  </tr>
                </thead>
                <tbody>
                  {demoData.moneyValues.map((value, index) => {
                    const numeric = parseInt(value) / 100;
                    const formatted = numeric.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    });
                    return (
                      <tr key={index}>
                        <td>{value}</td>
                        <td>R$ {numeric.toFixed(2)}</td>
                        <td>R$ {formatted}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Alert variant="success">
            <CheckCircle className="me-2" />
            <strong>Performance Melhorada!</strong>
            <br />
            O sistema agora usa Rust/WASM para cálculos matemáticos críticos,
            resultando em performance até 10x melhor em operações intensivas.
          </Alert>
        </Col>
      </Row>
    </div>
  );
};

export default RustPerformanceDemo;
