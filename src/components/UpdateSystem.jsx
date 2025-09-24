/**
 * Sistema Completo de Atualização
 * Componente principal que integra todas as funcionalidades de atualização
 */

import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Nav, 
  Tab, 
  Container,
  Badge,
  Alert
} from 'react-bootstrap';
import { 
  ArrowClockwise, 
  Shield, 
  Bell, 
  Gear,
  InfoCircle,
  CheckCircle
} from 'react-bootstrap-icons';
import UpdateManager from './UpdateManager';
import UpdateNotification from './UpdateNotification';
import UpdateRollback from './UpdateRollback';
import { useUpdater } from '../hooks/useUpdater';

const UpdateSystem = ({ className = '' }) => {
  const { status, isInitialized } = useUpdater();
  const [activeTab, setActiveTab] = useState('manager');

  const getUpdateStatusBadge = () => {
    if (!isInitialized) {
      return <Badge bg="secondary">Inicializando...</Badge>;
    }
    
    if (status.available) {
      return <Badge bg="warning">Atualização Disponível</Badge>;
    }
    
    return <Badge bg="success">Atualizado</Badge>;
  };

  const getSystemStatus = () => {
    if (!isInitialized) {
      return {
        status: 'initializing',
        message: 'Sistema de atualização inicializando...',
        variant: 'info'
      };
    }
    
    if (status.error) {
      return {
        status: 'error',
        message: `Erro no sistema: ${status.error}`,
        variant: 'danger'
      };
    }
    
    if (status.available) {
      return {
        status: 'update_available',
        message: `Nova versão ${status.latest_version} disponível`,
        variant: 'warning'
      };
    }
    
    return {
      status: 'up_to_date',
      message: 'Sistema atualizado e funcionando perfeitamente',
      variant: 'success'
    };
  };

  const systemStatus = getSystemStatus();

  return (
    <div className={`update-system ${className}`}>
      {/* Notificação Flutuante */}
      <UpdateNotification 
        position="top-right"
        autoHide={true}
        hideDelay={15000}
      />

      <Container fluid>
        <Row>
          <Col>
            {/* Header do Sistema */}
            <Card className="mb-4">
              <Card.Header className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <ArrowClockwise size={24} className="me-3 text-primary" />
                  <div>
                    <h4 className="mb-0">Sistema de Atualização Automática</h4>
                    <small className="text-muted">
                      Gerencie atualizações, backups e rollbacks do SGP
                    </small>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  {getUpdateStatusBadge()}
                  <Badge bg="info">
                    v{status.current_version}
                  </Badge>
                </div>
              </Card.Header>
              
              <Card.Body>
                <Alert variant={systemStatus.variant} className="mb-0">
                  <div className="d-flex align-items-center">
                    {systemStatus.status === 'initializing' && (
                      <div className="spinner-border spinner-border-sm me-2" />
                    )}
                    {systemStatus.status === 'error' && (
                      <InfoCircle size={16} className="me-2" />
                    )}
                    {systemStatus.status === 'update_available' && (
                      <ArrowClockwise size={16} className="me-2" />
                    )}
                    {systemStatus.status === 'up_to_date' && (
                      <CheckCircle size={16} className="me-2" />
                    )}
                    <span>{systemStatus.message}</span>
                  </div>
                </Alert>
              </Card.Body>
            </Card>

            {/* Navegação por Abas */}
            <Card>
              <Card.Header>
                <Nav variant="tabs" activeKey={activeTab} onSelect={setActiveTab}>
                  <Nav.Item>
                    <Nav.Link eventKey="manager">
                      <ArrowClockwise size={16} className="me-2" />
                      Gerenciador de Atualizações
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="rollback">
                      <Shield size={16} className="me-2" />
                      Sistema de Rollback
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="notifications">
                      <Bell size={16} className="me-2" />
                      Notificações
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="about">
                      <InfoCircle size={16} className="me-2" />
                      Sobre o Sistema
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Header>

              <Card.Body>
                <Tab.Content>
                  <Tab.Pane eventKey="manager">
                    <UpdateManager />
                  </Tab.Pane>
                  
                  <Tab.Pane eventKey="rollback">
                    <UpdateRollback />
                  </Tab.Pane>
                  
                  <Tab.Pane eventKey="notifications">
                    <NotificationSettings />
                  </Tab.Pane>
                  
                  <Tab.Pane eventKey="about">
                    <AboutUpdateSystem />
                  </Tab.Pane>
                </Tab.Content>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

// Componente de Configurações de Notificação
const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    show_notifications: true,
    notification_position: 'top-right',
    auto_hide: true,
    hide_delay: 10000,
    sound_enabled: false,
    desktop_notifications: true
  });

  return (
    <div className="notification-settings">
      <h5 className="mb-4">
        <Bell size={20} className="me-2" />
        Configurações de Notificação
      </h5>
      
      <Row>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Notificações de Atualização</h6>
            </Card.Header>
            <Card.Body>
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="show-notifications"
                  checked={settings.show_notifications}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    show_notifications: e.target.checked
                  }))}
                />
                <label className="form-check-label" htmlFor="show-notifications">
                  Mostrar notificações de atualização
                </label>
              </div>
              
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="auto-hide"
                  checked={settings.auto_hide}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    auto_hide: e.target.checked
                  }))}
                />
                <label className="form-check-label" htmlFor="auto-hide">
                  Ocultar automaticamente
                </label>
              </div>
              
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="sound-enabled"
                  checked={settings.sound_enabled}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    sound_enabled: e.target.checked
                  }))}
                />
                <label className="form-check-label" htmlFor="sound-enabled">
                  Reproduzir som nas notificações
                </label>
              </div>
              
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="desktop-notifications"
                  checked={settings.desktop_notifications}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    desktop_notifications: e.target.checked
                  }))}
                />
                <label className="form-check-label" htmlFor="desktop-notifications">
                  Notificações do sistema
                </label>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Posicionamento</h6>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <label className="form-label">Posição da notificação</label>
                <select
                  className="form-select"
                  value={settings.notification_position}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    notification_position: e.target.value
                  }))}
                >
                  <option value="top-right">Canto superior direito</option>
                  <option value="top-left">Canto superior esquerdo</option>
                  <option value="bottom-right">Canto inferior direito</option>
                  <option value="bottom-left">Canto inferior esquerdo</option>
                  <option value="top-center">Centro superior</option>
                  <option value="bottom-center">Centro inferior</option>
                </select>
              </div>
              
              <div className="mb-3">
                <label className="form-label">
                  Tempo de exibição (segundos)
                </label>
                <input
                  type="range"
                  className="form-range"
                  min="5000"
                  max="30000"
                  step="1000"
                  value={settings.hide_delay}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    hide_delay: parseInt(e.target.value)
                  }))}
                  disabled={!settings.auto_hide}
                />
                <div className="d-flex justify-content-between small text-muted">
                  <span>5s</span>
                  <span>{settings.hide_delay / 1000}s</span>
                  <span>30s</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <div className="mt-4">
        <button className="btn btn-primary">
          <Gear size={16} className="me-2" />
          Salvar Configurações
        </button>
      </div>
    </div>
  );
};

// Componente Sobre o Sistema
const AboutUpdateSystem = () => {
  return (
    <div className="about-update-system">
      <h5 className="mb-4">
        <InfoCircle size={20} className="me-2" />
        Sobre o Sistema de Atualização
      </h5>
      
      <Row>
        <Col md={8}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Funcionalidades</h6>
            </Card.Header>
            <Card.Body>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <CheckCircle size={16} className="text-success me-2" />
                  <strong>Verificação Automática:</strong> Verifica atualizações em intervalos configuráveis
                </li>
                <li className="mb-2">
                  <CheckCircle size={16} className="text-success me-2" />
                  <strong>Download Seguro:</strong> Downloads com verificação de integridade
                </li>
                <li className="mb-2">
                  <CheckCircle size={16} className="text-success me-2" />
                  <strong>Instalação Automática:</strong> Instalação sem interrupção do trabalho
                </li>
                <li className="mb-2">
                  <CheckCircle size={16} className="text-success me-2" />
                  <strong>Sistema de Rollback:</strong> Reversão para versões anteriores em caso de problemas
                </li>
                <li className="mb-2">
                  <CheckCircle size={16} className="text-success me-2" />
                  <strong>Notificações Inteligentes:</strong> Alertas contextuais sobre atualizações
                </li>
                <li className="mb-2">
                  <CheckCircle size={16} className="text-success me-2" />
                  <strong>Backup Automático:</strong> Criação automática de backups antes de atualizações
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Informações Técnicas</h6>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong>Versão do Sistema:</strong>
                <br />
                <Badge bg="primary">v2.0.0</Badge>
              </div>
              
              <div className="mb-3">
                <strong>Tecnologias:</strong>
                <br />
                <Badge bg="secondary" className="me-1">Tauri</Badge>
                <Badge bg="secondary" className="me-1">Rust</Badge>
                <Badge bg="secondary">React</Badge>
              </div>
              
              <div className="mb-3">
                <strong>Segurança:</strong>
                <br />
                <Badge bg="success">Assinatura Digital</Badge>
              </div>
              
              <div className="mb-3">
                <strong>Compatibilidade:</strong>
                <br />
                <small className="text-muted">
                  Windows, macOS, Linux
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Card className="mt-4">
        <Card.Header>
          <h6 className="mb-0">Como Funciona</h6>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <div className="text-center">
                <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{width: '40px', height: '40px'}}>
                  1
                </div>
                <h6>Verificação</h6>
                <small className="text-muted">
                  Sistema verifica automaticamente por atualizações
                </small>
              </div>
            </Col>
            
            <Col md={3}>
              <div className="text-center">
                <div className="bg-warning text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{width: '40px', height: '40px'}}>
                  2
                </div>
                <h6>Download</h6>
                <small className="text-muted">
                  Baixa atualização com verificação de integridade
                </small>
              </div>
            </Col>
            
            <Col md={3}>
              <div className="text-center">
                <div className="bg-info text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{width: '40px', height: '40px'}}>
                  3
                </div>
                <h6>Backup</h6>
                <small className="text-muted">
                  Cria backup da versão atual automaticamente
                </small>
              </div>
            </Col>
            
            <Col md={3}>
              <div className="text-center">
                <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{width: '40px', height: '40px'}}>
                  4
                </div>
                <h6>Instalação</h6>
                <small className="text-muted">
                  Instala nova versão e reinicia aplicativo
                </small>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default UpdateSystem;
