import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Alert, Spinner } from 'react-bootstrap';
import { migrationHelper } from '../utils/migration';

const MigrationStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const systemStatus = await migrationHelper.getSystemStatus();
      setStatus(systemStatus);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestAPI = async () => {
    try {
      setLoading(true);
      const result = await migrationHelper.testRustAPI();
      if (result.success) {
        setError(null);
        await loadStatus(); // Recarregar status
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    try {
      setLoading(true);
      await migrationHelper.backupData();
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !status) {
    return (
      <Card className="mb-3">
        <Card.Body className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Carregando status do sistema...</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-3">
      <Card.Header>
        <h5 className="mb-0">
          <i className="bi bi-gear-fill me-2"></i>
          Status da Migração Rust
        </h5>
      </Card.Header>
      <Card.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            <Alert.Heading>Erro!</Alert.Heading>
            {error}
          </Alert>
        )}

        {status && (
          <div className="row">
            <div className="col-md-6">
              <h6>Informações do Sistema</h6>
              <ul className="list-unstyled">
                <li>
                  <strong>Plataforma:</strong>{' '}
                  <Badge bg={status.isTauri ? 'success' : 'warning'}>
                    {status.isTauri ? 'Tauri' : 'Web'}
                  </Badge>
                </li>
                <li>
                  <strong>Tipo de API:</strong>{' '}
                  <Badge bg={status.isTauri ? 'primary' : 'secondary'}>
                    {status.apiType}
                  </Badge>
                </li>
                <li>
                  <strong>Status da API:</strong>{' '}
                  <Badge bg={status.apiStatus === 'OK' ? 'success' : 'danger'}>
                    {status.apiStatus || 'N/A'}
                  </Badge>
                </li>
                <li>
                  <strong>Última verificação:</strong>{' '}
                  <small className="text-muted">
                    {new Date(status.timestamp).toLocaleString()}
                  </small>
                </li>
              </ul>
            </div>
            
            <div className="col-md-6">
              <h6>Ações</h6>
              <div className="d-grid gap-2">
                <Button 
                  variant="outline-primary" 
                  onClick={handleTestAPI}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Testando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Testar API Rust
                    </>
                  )}
                </Button>
                
                {status.isTauri && (
                  <Button 
                    variant="outline-success" 
                    onClick={handleBackup}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Fazendo backup...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-download me-2"></i>
                        Fazer Backup
                      </>
                    )}
                  </Button>
                )}
                
                <Button 
                  variant="outline-secondary" 
                  onClick={loadStatus}
                  disabled={loading}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Atualizar Status
                </Button>
              </div>
            </div>
          </div>
        )}

        {status?.apiMessage && (
          <Alert variant={status.apiStatus === 'OK' ? 'success' : 'warning'} className="mt-3">
            <strong>Mensagem da API:</strong> {status.apiMessage}
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default MigrationStatus;


