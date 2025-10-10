import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Row, Col, Alert } from 'react-bootstrap';
import { Trash, ArrowClockwise, InfoCircle, Database, Clock } from 'react-bootstrap-icons';
import cacheManager from '../../utils/cacheManager';

/**
 * Componente de Gerenciamento de Cache
 * Permite visualizar, limpar e invalidar caches
 */
function CacheManagement() {
  const [stats, setStats] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const loadStats = () => {
    const newStats = cacheManager.getStats();
    setStats(newStats);
    setLastUpdate(new Date());
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleClearAll = () => {
    if (confirm('Tem certeza que deseja limpar todo o cache? Isso irá recarregar todos os dados da API na próxima vez.')) {
      cacheManager.clearAll();
      loadStats();
    }
  };

  const handleInvalidate = (key) => {
    cacheManager.invalidate(key);
    loadStats();
  };

  const handleCleanExpired = () => {
    const count = cacheManager.cleanExpired();
    if (count === 0) {
      alert('Nenhum cache expirado encontrado!');
    }
    loadStats();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  if (!stats) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="p-4">
      <Row className="mb-4">
        <Col>
          <h3 className="mb-3">
            <Database size={24} className="me-2" />
            Gerenciamento de Cache
          </h3>
          <p className="text-muted">
            Sistema de cache local para reduzir requisições à API e melhorar a performance.
          </p>
        </Col>
      </Row>

      {/* Estatísticas Gerais */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="dashboard-card">
            <Card.Body>
              <div className="text-center">
                <div className="h1 mb-2 text-primary">{stats.total}</div>
                <div className="text-muted">Total de Caches</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="dashboard-card">
            <Card.Body>
              <div className="text-center">
                <div className="h1 mb-2 text-success">{stats.validos}</div>
                <div className="text-muted">Válidos</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="dashboard-card">
            <Card.Body>
              <div className="text-center">
                <div className="h1 mb-2 text-danger">{stats.expirados}</div>
                <div className="text-muted">Expirados</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="dashboard-card">
            <Card.Body>
              <div className="text-center">
                <div className="h1 mb-2 text-info">{stats.tamanho.kb} KB</div>
                <div className="text-muted">Tamanho Total</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Ações Rápidas */}
      <Row className="mb-4">
        <Col>
          <Card className="dashboard-card">
            <Card.Header>
              <h5 className="mb-0">Ações Rápidas</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex gap-2">
                <Button variant="primary" onClick={loadStats}>
                  <ArrowClockwise size={16} className="me-2" />
                  Atualizar Estatísticas
                </Button>
                <Button variant="warning" onClick={handleCleanExpired}>
                  <Trash size={16} className="me-2" />
                  Limpar Expirados
                </Button>
                <Button variant="danger" onClick={handleClearAll}>
                  <Trash size={16} className="me-2" />
                  Limpar Todo Cache
                </Button>
              </div>
              <div className="mt-2 text-muted" style={{ fontSize: '0.85rem' }}>
                <Clock size={14} className="me-1" />
                Última atualização: {formatDate(lastUpdate)}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Informação sobre Cache */}
      <Row className="mb-4">
        <Col>
          <Alert variant="info">
            <InfoCircle size={18} className="me-2" />
            <strong>Como funciona:</strong> Os dados são salvos localmente no navegador para evitar requisições repetidas à API. 
            Cada tipo de dado tem um tempo de expiração configurado. Quando o cache expira, os dados são automaticamente 
            recarregados da API na próxima vez que forem necessários.
          </Alert>
        </Col>
      </Row>

      {/* Detalhes dos Caches */}
      <Row>
        <Col>
          <Card className="dashboard-card">
            <Card.Header>
              <h5 className="mb-0">Detalhes dos Caches</h5>
            </Card.Header>
            <Card.Body>
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th>Chave</th>
                    <th>Status</th>
                    <th>Expira em</th>
                    <th>Tempo Total</th>
                    <th>Tamanho</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.caches.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center text-muted py-4">
                        Nenhum cache encontrado. Os caches serão criados conforme você usa o sistema.
                      </td>
                    </tr>
                  ) : (
                    stats.caches.map((cache) => (
                      <tr key={cache.key}>
                        <td>
                          <strong>{cache.key}</strong>
                        </td>
                        <td>
                          {cache.isValid ? (
                            <Badge bg="success">✅ Válido</Badge>
                          ) : (
                            <Badge bg="danger">❌ Expirado</Badge>
                          )}
                        </td>
                        <td>
                          {cache.isValid ? (
                            <span className="text-success">
                              {cache.tempoRestanteMin} min
                            </span>
                          ) : (
                            <span className="text-danger">Expirado</span>
                          )}
                        </td>
                        <td className="text-muted" style={{ fontSize: '0.9rem' }}>
                          {Math.round(cache.ttl / 1000 / 60)} min
                        </td>
                        <td className="text-muted" style={{ fontSize: '0.9rem' }}>
                          {formatSize(cache.dataSize)}
                        </td>
                        <td>
                          <Button
                            variant="outline-warning"
                            size="sm"
                            onClick={() => handleInvalidate(cache.key)}
                            title="Invalidar cache - forçará reload da API"
                          >
                            <ArrowClockwise size={14} />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Informações Técnicas */}
      <Row className="mt-4">
        <Col>
          <Card className="dashboard-card">
            <Card.Header>
              <h6 className="mb-0">Tempos de Expiração Configurados</h6>
            </Card.Header>
            <Card.Body>
              <Table size="sm" bordered>
                <thead>
                  <tr>
                    <th>Tipo de Dado</th>
                    <th>Tempo de Cache</th>
                    <th>Motivo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Designers / Vendedores</td>
                    <td><Badge bg="primary">1 hora</Badge></td>
                    <td className="text-muted">Raramente muda</td>
                  </tr>
                  <tr>
                    <td>Formas Pagamento / Envio</td>
                    <td><Badge bg="primary">2 horas</Badge></td>
                    <td className="text-muted">Quase nunca muda</td>
                  </tr>
                  <tr>
                    <td>Tecidos / Materiais</td>
                    <td><Badge bg="warning">30 minutos</Badge></td>
                    <td className="text-muted">Pode ser editado</td>
                  </tr>
                  <tr>
                    <td>Descontos</td>
                    <td><Badge bg="warning">15 minutos</Badge></td>
                    <td className="text-muted">Muda com frequência</td>
                  </tr>
                  <tr>
                    <td>Clientes</td>
                    <td><Badge bg="warning">10 minutos</Badge></td>
                    <td className="text-muted">Pode ser adicionado</td>
                  </tr>
                  <tr>
                    <td>Pedidos Pendentes</td>
                    <td><Badge bg="danger">5 minutos</Badge></td>
                    <td className="text-muted">Muda constantemente</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default CacheManagement;


