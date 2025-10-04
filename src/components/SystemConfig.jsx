import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Badge, Row, Col } from 'react-bootstrap';
import { 
  switchMode, 
  getCurrentMode, 
  isUsingRust, 
  isUsingPython,
  getSystemInfo,
  saveConfig,
  resetConfig
} from '../config/system.config';

const SystemConfig = () => {
  const [currentMode, setCurrentMode] = useState(getCurrentMode());
  const [systemInfo, setSystemInfo] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');

  useEffect(() => {
    loadSystemInfo();
  }, []);

  const loadSystemInfo = () => {
    const info = getSystemInfo();
    setSystemInfo(info);
  };

  const handleModeChange = (mode) => {
    if (switchMode(mode)) {
      setCurrentMode(mode);
      setMessage(`Modo alterado para: ${mode === 'rust' ? 'Rust (Tauri)' : 'Python (HTTP)'}`);
      setMessageType('success');
      saveConfig();
      
      // Recarregar informações do sistema
      setTimeout(() => {
        loadSystemInfo();
      }, 1000);
    } else {
      setMessage('Erro ao alterar modo');
      setMessageType('danger');
    }
  };

  const handleReset = () => {
    resetConfig();
    setCurrentMode('rust');
    setMessage('Configurações resetadas');
    setMessageType('warning');
    loadSystemInfo();
  };

  const handleRefresh = () => {
    loadSystemInfo();
    setMessage('Informações atualizadas');
    setMessageType('info');
  };

  return (
    <div className="container-fluid">
      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-gear-fill me-2"></i>
                Configuração do Sistema
              </h5>
            </Card.Header>
            <Card.Body>
              {message && (
                <Alert variant={messageType} dismissible onClose={() => setMessage('')}>
                  {message}
                </Alert>
              )}

              <Form>
                <Form.Group className="mb-4">
                  <Form.Label>
                    <strong>Modo de Operação</strong>
                  </Form.Label>
                  <div className="d-grid gap-2">
                    <Button
                      variant={currentMode === 'rust' ? 'primary' : 'outline-primary'}
                      onClick={() => handleModeChange('rust')}
                      className="d-flex align-items-center justify-content-between"
                    >
                      <div className="d-flex align-items-center">
                        <i className="bi bi-lightning-fill me-2"></i>
                        <div className="text-start">
                          <div><strong>Rust (Tauri)</strong></div>
                          <small className="text-muted">Aplicação desktop nativa</small>
                        </div>
                      </div>
                      <Badge bg={currentMode === 'rust' ? 'success' : 'secondary'}>
                        {currentMode === 'rust' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </Button>

                    <Button
                      variant={currentMode === 'python' ? 'primary' : 'outline-primary'}
                      onClick={() => handleModeChange('python')}
                      className="d-flex align-items-center justify-content-between"
                    >
                      <div className="d-flex align-items-center">
                        <i className="bi bi-globe me-2"></i>
                        <div className="text-start">
                          <div><strong>Python (HTTP)</strong></div>
                          <small className="text-muted">API web tradicional</small>
                        </div>
                      </div>
                      <Badge bg={currentMode === 'python' ? 'success' : 'secondary'}>
                        {currentMode === 'python' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </Button>
                  </div>
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button variant="outline-secondary" onClick={handleRefresh}>
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Atualizar
                  </Button>
                  <Button variant="outline-warning" onClick={handleReset}>
                    <i className="bi bi-arrow-counterclockwise me-2"></i>
                    Resetar
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Informações do Sistema
              </h6>
            </Card.Header>
            <Card.Body>
              {systemInfo && (
                <div>
                  <div className="mb-3">
                    <strong>Modo Atual:</strong>
                    <Badge bg={currentMode === 'rust' ? 'primary' : 'secondary'} className="ms-2">
                      {currentMode === 'rust' ? 'Rust' : 'Python'}
                    </Badge>
                  </div>

                  <div className="mb-3">
                    <strong>Tipo de API:</strong>
                    <br />
                    <small className="text-muted">
                      {systemInfo.apiConfig.type === 'rust' ? 'Tauri Commands' : 'HTTP REST'}
                    </small>
                  </div>

                  <div className="mb-3">
                    <strong>Banco de Dados:</strong>
                    <br />
                    <small className="text-muted">
                      {systemInfo.databaseConfig.type} - {systemInfo.databaseConfig.path}
                    </small>
                  </div>

                  <div className="mb-3">
                    <strong>Plataforma:</strong>
                    <br />
                    <small className="text-muted">
                      {systemInfo.platform}
                    </small>
                  </div>

                  <div className="mb-3">
                    <strong>Última Atualização:</strong>
                    <br />
                    <small className="text-muted">
                      {new Date(systemInfo.timestamp).toLocaleString()}
                    </small>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          <Card className="mt-3">
            <Card.Header>
              <h6 className="mb-0">
                <i className="bi bi-lightbulb me-2"></i>
                Dicas
              </h6>
            </Card.Header>
            <Card.Body>
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  <small>Rust oferece melhor performance</small>
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  <small>Python é mais fácil para debug</small>
                </li>
                <li className="mb-2">
                  <i className="bi bi-info-circle text-info me-2"></i>
                  <small>Reinicie a aplicação após mudança</small>
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SystemConfig;





