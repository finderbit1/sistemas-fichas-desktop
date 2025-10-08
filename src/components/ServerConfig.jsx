import React, { useState } from 'react';
import { Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { 
  Server, 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  ExclamationTriangle,
  ArrowClockwise,
  Save,
  ArrowCounterclockwise,
  Trash
} from 'react-bootstrap-icons';
import { useServerConfig } from '../contexts/ServerConfigContext';
import Tooltip from './Tooltip';
import cacheManager from '../utils/cacheManager';

const ServerConfig = () => {
  const { 
    serverConfig, 
    updateServerConfig, 
    testConnection, 
    resetToDefault,
    isConnected, 
    connectionStatus 
  } = useServerConfig();

  const [formData, setFormData] = useState(serverConfig);
  const [isTesting, setIsTesting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCacheCleared, setShowCacheCleared] = useState(false);
  const [cacheStats, setCacheStats] = useState(() => cacheManager.getStats());

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    updateServerConfig(formData);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleTest = async () => {
    setIsTesting(true);
    await testConnection(formData.baseURL);
    setIsTesting(false);
  };

  const handleReset = () => {
    const defaultConfig = {
      baseURL: 'http://localhost:8000',
      timeout: 10000,
      retries: 3
    };
    setFormData(defaultConfig);
    resetToDefault();
  };

  const handleClearCache = () => {
    const count = cacheManager.clearAll();
    setCacheStats(cacheManager.getStats());
    setShowCacheCleared(true);
    setTimeout(() => setShowCacheCleared(false), 3000);
    console.log(`🧹 ${count} itens de cache removidos`);
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle size={20} style={{ color: 'var(--color-success)' }} />;
      case 'error':
        return <ExclamationTriangle size={20} style={{ color: 'var(--color-error)' }} />;
      case 'checking':
        return <ArrowClockwise size={20} className="animate-rotate" style={{ color: 'var(--color-warning)' }} />;
      default:
        return <WifiOff size={20} style={{ color: 'var(--color-neutral-400)' }} />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Conectado';
      case 'error':
        return 'Erro de conexão';
      case 'checking':
        return 'Testando...';
      default:
        return 'Desconectado';
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'success';
      case 'error':
        return 'danger';
      case 'checking':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <h5 className="dashboard-card-title">
          <Server className="dashboard-card-icon" />
          Configuração do Servidor
        </h5>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
          {getStatusIcon()}
          <span style={{ 
            fontSize: 'var(--font-size-sm)', 
            color: `var(--color-${getStatusColor()})`,
            fontWeight: 'var(--font-weight-medium)'
          }}>
            {getStatusText()}
          </span>
        </div>
      </div>

      {showSuccess && (
        <Alert variant="success" className="mb-4">
          <CheckCircle size={16} style={{ marginRight: '8px' }} />
          Configuração salva com sucesso!
        </Alert>
      )}

      {showCacheCleared && (
        <Alert variant="info" className="mb-4">
          <Trash size={16} style={{ marginRight: '8px' }} />
          Cache limpo com sucesso! Os dados serão recarregados da API.
        </Alert>
      )}

      <Form>
        <Row className="mb-4">
          <Col md={8}>
            <div className="form-group">
              <label className="form-label">
                <Server size={16} style={{ marginRight: '8px' }} />
                URL do Servidor
              </label>
              <Form.Control
                type="url"
                name="baseURL"
                value={formData.baseURL}
                onChange={handleChange}
                placeholder="http://localhost:8000"
                className="form-control"
                style={{ fontFamily: 'var(--font-family-mono)' }}
              />
              <small className="text-muted">
                URL base da API do servidor (ex: http://localhost:8000)
              </small>
            </div>
          </Col>
          <Col md={4}>
            <div className="form-group">
              <label className="form-label">
                <Wifi size={16} style={{ marginRight: '8px' }} />
                Testar Conexão
              </label>
              <div>
                <Tooltip content="Testar se o servidor está respondendo" position="top">
                  <Button
                    variant={isConnected ? "success" : "outline-secondary"}
                    onClick={handleTest}
                    disabled={isTesting}
                    style={{ width: '100%' }}
                  >
                    {isTesting ? (
                      <>
                        <ArrowClockwise size={16} className="animate-rotate" style={{ marginRight: '8px' }} />
                        Testando...
                      </>
                    ) : (
                      <>
                        <Wifi size={16} style={{ marginRight: '8px' }} />
                        Testar
                      </>
                    )}
                  </Button>
                </Tooltip>
              </div>
            </div>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={6}>
            <div className="form-group">
              <label className="form-label">Timeout (ms)</label>
              <Form.Control
                type="number"
                name="timeout"
                value={formData.timeout}
                onChange={handleChange}
                min="1000"
                max="60000"
                step="1000"
                className="form-control"
              />
              <small className="text-muted">
                Tempo limite para requisições (1000-60000ms)
              </small>
            </div>
          </Col>
          <Col md={6}>
            <div className="form-group">
              <label className="form-label">Tentativas</label>
              <Form.Control
                type="number"
                name="retries"
                value={formData.retries}
                onChange={handleChange}
                min="1"
                max="10"
                className="form-control"
              />
              <small className="text-muted">
                Número de tentativas em caso de falha (1-10)
              </small>
            </div>
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <div style={{ display: 'flex', gap: 'var(--spacing-3)', justifyContent: 'space-between' }}>
              <div>
                <Tooltip content="Limpar todos os dados em cache e forçar atualização" position="top">
                  <Button
                    variant="outline-warning"
                    onClick={handleClearCache}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Trash size={16} />
                    Limpar Cache
                  </Button>
                </Tooltip>
              </div>
              
              <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
                <Tooltip content="Restaurar configurações padrão" position="top">
                  <Button
                    variant="outline-secondary"
                    onClick={handleReset}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <ArrowCounterclockwise size={16} />
                    Restaurar Padrão
                  </Button>
                </Tooltip>
                
                <Button
                  variant="primary"
                  onClick={handleSave}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Save size={16} />
                  Salvar Configuração
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Form>

      <div style={{ 
        marginTop: 'var(--spacing-6)', 
        padding: 'var(--spacing-4)', 
        background: 'var(--color-neutral-50)', 
        borderRadius: 'var(--border-radius)',
        border: '1px solid var(--color-neutral-200)'
      }}>
        <h6 style={{ 
          fontSize: 'var(--font-size-sm)', 
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-neutral-700)',
          marginBottom: 'var(--spacing-3)'
        }}>
          Informações da Conexão
        </h6>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-3)' }}>
          <div>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-neutral-500)' }}>URL Atual:</span>
            <p style={{ 
              margin: '4px 0 0 0', 
              fontFamily: 'var(--font-family-mono)', 
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-neutral-700)'
            }}>
              {serverConfig.baseURL}
            </p>
          </div>
          <div>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-neutral-500)' }}>Status:</span>
            <p style={{ 
              margin: '4px 0 0 0', 
              fontSize: 'var(--font-size-sm)',
              color: `var(--color-${getStatusColor()})`,
              fontWeight: 'var(--font-weight-medium)'
            }}>
              {getStatusText()}
            </p>
          </div>
          <div>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-neutral-500)' }}>Cache:</span>
            <p style={{ 
              margin: '4px 0 0 0', 
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-neutral-700)',
              fontWeight: 'var(--font-weight-medium)'
            }}>
              {cacheStats.total} itens ({cacheStats.tamanho.kb} KB)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerConfig;
