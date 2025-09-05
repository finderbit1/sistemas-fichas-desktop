import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap';
import { 
  Truck, 
  CreditCard, 
  CurrencyDollar, 
  Box,
  GraphUp,
  Info
} from 'react-bootstrap-icons';
import { 
  getAllFormasEnvios, 
  getAllFormasPagamentos 
} from '../../services/api';

const FormasResumo = () => {
  const [formasEnvio, setFormasEnvio] = useState([]);
  const [formasPagamento, setFormasPagamento] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [enviosResponse, pagamentosResponse] = await Promise.all([
        getAllFormasEnvios().catch(err => {
          console.warn('Erro ao carregar formas de envio:', err);
          return { data: [] };
        }),
        getAllFormasPagamentos().catch(err => {
          console.warn('Erro ao carregar formas de pagamento:', err);
          return { data: [] };
        })
      ]);

      setFormasEnvio(enviosResponse.data || []);
      setFormasPagamento(pagamentosResponse.data || []);

    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const calcularTotalEnvio = () => {
    return formasEnvio.reduce((total, forma) => total + (forma.value || 0), 0);
  };

  const calcularTotalPagamento = () => {
    return formasPagamento.reduce((total, forma) => total + (forma.value || 0), 0);
  };

  const formasComValor = (formas) => {
    return formas.filter(forma => forma.value && forma.value > 0);
  };

  const formasSemValor = (formas) => {
    return formas.filter(forma => !forma.value || forma.value === 0);
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Carregando resumo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <strong>Erro:</strong> {error}
      </Alert>
    );
  }

  return (
    <div>
      <Row className="mb-4">
        <Col md={6}>
          <Card className="h-100">
            <Card.Header className="d-flex align-items-center">
              <Truck size={20} className="me-2 text-primary" />
              <h6 className="mb-0">Formas de Envio</h6>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">Total de formas:</span>
                  <Badge bg="primary">{formasEnvio.length}</Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">Com valor:</span>
                  <Badge bg="success">{formasComValor(formasEnvio).length}</Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">Sem valor:</span>
                  <Badge bg="secondary">{formasSemValor(formasEnvio).length}</Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Valor total:</span>
                  <Badge bg="info">R$ {calcularTotalEnvio().toFixed(2)}</Badge>
                </div>
              </div>

              {formasEnvio.length > 0 && (
                <div>
                  <h6 className="text-muted mb-2">Lista:</h6>
                  <div className="list-group list-group-flush">
                    {formasEnvio.map(forma => (
                      <div key={forma.id} className="list-group-item px-0 py-2 d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <Box size={14} className="me-2 text-muted" />
                          <span>{forma.name}</span>
                        </div>
                        <div>
                          {forma.value ? (
                            <Badge bg="success">R$ {forma.value.toFixed(2)}</Badge>
                          ) : (
                            <Badge bg="secondary">Sem valor</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="h-100">
            <Card.Header className="d-flex align-items-center">
              <CreditCard size={20} className="me-2 text-primary" />
              <h6 className="mb-0">Formas de Pagamento</h6>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">Total de formas:</span>
                  <Badge bg="primary">{formasPagamento.length}</Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">Com valor:</span>
                  <Badge bg="success">{formasComValor(formasPagamento).length}</Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">Sem valor:</span>
                  <Badge bg="secondary">{formasSemValor(formasPagamento).length}</Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Valor total:</span>
                  <Badge bg="info">R$ {calcularTotalPagamento().toFixed(2)}</Badge>
                </div>
              </div>

              {formasPagamento.length > 0 && (
                <div>
                  <h6 className="text-muted mb-2">Lista:</h6>
                  <div className="list-group list-group-flush">
                    {formasPagamento.map(forma => (
                      <div key={forma.id} className="list-group-item px-0 py-2 d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <CreditCard size={14} className="me-2 text-muted" />
                          <span>{forma.name}</span>
                        </div>
                        <div>
                          {forma.value ? (
                            <Badge bg="success">R$ {forma.value.toFixed(2)}</Badge>
                          ) : (
                            <Badge bg="secondary">Sem valor</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Card>
            <Card.Header className="d-flex align-items-center">
              <GraphUp size={20} className="me-2 text-primary" />
              <h6 className="mb-0">Resumo Geral</h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <div className="text-center">
                    <CurrencyDollar size={24} className="text-success mb-2" />
                    <h5 className="text-success">R$ {(calcularTotalEnvio() + calcularTotalPagamento()).toFixed(2)}</h5>
                    <p className="text-muted mb-0">Valor Total</p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center">
                    <Truck size={24} className="text-primary mb-2" />
                    <h5 className="text-primary">{formasEnvio.length}</h5>
                    <p className="text-muted mb-0">Formas de Envio</p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center">
                    <CreditCard size={24} className="text-info mb-2" />
                    <h5 className="text-info">{formasPagamento.length}</h5>
                    <p className="text-muted mb-0">Formas de Pagamento</p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Alert variant="info" className="mt-3">
        <Info size={16} className="me-2" />
        <strong>Dica:</strong> Use as abas "Formas de Pagamento" e "Formas de Envio" para gerenciar os valores e configurações.
      </Alert>
    </div>
  );
};

export default FormasResumo;
