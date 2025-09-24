/**
 * Gerenciador de Atualizações - Interface Completa
 * Componente para gerenciar verificações, downloads e instalações
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Row, 
  Col, 
  ProgressBar, 
  Alert, 
  Badge, 
  Accordion,
  Form,
  Modal,
  ListGroup,
  Spinner
} from 'react-bootstrap';
import { 
  Download, 
  Play, 
  CheckCircle, 
  ExclamationTriangle, 
  InfoCircle,
  Gear,
  Clock,
  FileEarmarkText,
  ArrowClockwise,
  XCircle
} from 'react-bootstrap-icons';
import { useUpdater, useUpdateMonitor, useUpdateNotifications } from '../hooks/useUpdater';

const UpdateManager = ({ className = '' }) => {
  const {
    status,
    settings,
    isInitialized,
    isChecking,
    isDownloading,
    isInstalling,
    checkForUpdates,
    forceCheckUpdates,
    downloadUpdate,
    installUpdate,
    updateSettings,
    hasUpdateAvailable,
    getTotalProgress,
    getCurrentOperation,
    formatFileSize,
    formatReleaseDate,
  } = useUpdater();

  const { lastCheck } = useUpdateMonitor();
  const { hasNotified, resetNotification } = useUpdateNotifications();

  const [showSettings, setShowSettings] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  // Sincronizar configurações locais
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // ===== HANDLERS =====

  const handleCheckUpdates = async () => {
    try {
      await checkForUpdates();
      resetNotification();
    } catch (error) {
      console.error('Erro ao verificar atualizações:', error);
    }
  };

  const handleForceCheck = async () => {
    try {
      await forceCheckUpdates();
      resetNotification();
    } catch (error) {
      console.error('Erro ao forçar verificação:', error);
    }
  };

  const handleDownload = async () => {
    try {
      await downloadUpdate();
    } catch (error) {
      console.error('Erro ao baixar atualização:', error);
    }
  };

  const handleInstall = async () => {
    try {
      await installUpdate();
    } catch (error) {
      console.error('Erro ao instalar atualização:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      await updateSettings(localSettings);
      setShowSettings(false);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // ===== RENDERIZAÇÃO =====

  if (!isInitialized) {
    return (
      <Card className={`update-manager ${className}`}>
        <Card.Body className="text-center">
          <Spinner animation="border" size="sm" className="me-2" />
          <span>Inicializando sistema de atualização...</span>
        </Card.Body>
      </Card>
    );
  }

  const currentOperation = getCurrentOperation();
  const totalProgress = getTotalProgress();
  const hasUpdate = hasUpdateAvailable();

  return (
    <div className={`update-manager ${className}`}>
      {/* Status Principal */}
      <Card className="mb-4">
        <Card.Header className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <ArrowClockwise size={20} className="me-2" />
            <strong>Sistema de Atualização</strong>
            {hasUpdate && (
              <Badge bg="warning" className="ms-2">
                Nova Versão Disponível
              </Badge>
            )}
          </div>
          <div>
            <Button
              variant="outline-secondary"
              size="sm"
              className="me-2"
              onClick={() => setShowSettings(true)}
            >
              <Gear size={16} />
            </Button>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={handleCheckUpdates}
              disabled={isChecking}
            >
              {isChecking ? (
                <Spinner size="sm" className="me-1" />
              ) : (
                <ArrowClockwise size={16} className="me-1" />
              )}
              Verificar
            </Button>
          </div>
        </Card.Header>

        <Card.Body>
          {/* Versão Atual */}
          <Row className="mb-3">
            <Col md={6}>
              <div className="d-flex align-items-center">
                <CheckCircle className="text-success me-2" />
                <div>
                  <strong>Versão Atual:</strong>
                  <br />
                  <Badge bg="success">{status.current_version}</Badge>
                </div>
              </div>
            </Col>
            <Col md={6}>
              {status.latest_version && (
                <div className="d-flex align-items-center">
                  <InfoCircle className="text-info me-2" />
                  <div>
                    <strong>Última Versão:</strong>
                    <br />
                    <Badge bg={hasUpdate ? "warning" : "success"}>
                      {status.latest_version}
                    </Badge>
                  </div>
                </div>
              )}
            </Col>
          </Row>

          {/* Status da Operação */}
          {currentOperation !== 'idle' && (
            <Alert variant="info" className="mb-3">
              <div className="d-flex align-items-center">
                {currentOperation === 'checking' && (
                  <>
                    <Spinner size="sm" className="me-2" />
                    <span>Verificando atualizações...</span>
                  </>
                )}
                {currentOperation === 'downloading' && (
                  <>
                    <Download size={16} className="me-2" />
                    <span>Baixando atualização...</span>
                  </>
                )}
                {currentOperation === 'installing' && (
                  <>
                    <Play size={16} className="me-2" />
                    <span>Instalando atualização...</span>
                  </>
                )}
              </div>
              
              {totalProgress !== null && (
                <div className="mt-2">
                  <ProgressBar 
                    now={totalProgress} 
                    label={`${totalProgress.toFixed(1)}%`}
                    variant="primary"
                    animated
                  />
                </div>
              )}
            </Alert>
          )}

          {/* Erro */}
          {status.error && (
            <Alert variant="danger" className="mb-3">
              <XCircle size={16} className="me-2" />
              <strong>Erro:</strong> {status.error}
            </Alert>
          )}

          {/* Informações da Atualização */}
          {hasUpdate && status.update_info && (
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">
                  <FileEarmarkText size={16} className="me-2" />
                  Nova Atualização Disponível
                </h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <p><strong>Data:</strong> {formatReleaseDate(status.update_info.date)}</p>
                    <p><strong>Tamanho:</strong> {formatFileSize(status.update_info.size)}</p>
                  </Col>
                  <Col md={6}>
                    <div className="d-flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleDownload}
                        disabled={isDownloading || isInstalling}
                      >
                        <Download size={16} className="me-1" />
                        Baixar
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => setShowChangelog(true)}
                      >
                        <FileEarmarkText size={16} className="me-1" />
                        Changelog
                      </Button>
                    </div>
                  </Col>
                </Row>
                
                {status.update_info.body && (
                  <div className="mt-3">
                    <strong>Descrição:</strong>
                    <p className="text-muted small mt-1">
                      {status.update_info.body.substring(0, 200)}
                      {status.update_info.body.length > 200 && '...'}
                    </p>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

          {/* Ações de Atualização */}
          {hasUpdate && (
            <Card>
              <Card.Header>
                <h6 className="mb-0">Ações de Atualização</h6>
              </Card.Header>
              <Card.Body>
                <div className="d-flex gap-2 flex-wrap">
                  <Button
                    variant="primary"
                    onClick={handleDownload}
                    disabled={isDownloading || isInstalling}
                  >
                    {isDownloading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Baixando...
                      </>
                    ) : (
                      <>
                        <Download size={16} className="me-2" />
                        Baixar Atualização
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="success"
                    onClick={handleInstall}
                    disabled={!status.available || isInstalling}
                  >
                    {isInstalling ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Instalando...
                      </>
                    ) : (
                      <>
                        <Play size={16} className="me-2" />
                        Instalar Agora
                      </>
                    )}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Informações do Sistema */}
          <Card className="mt-3">
            <Card.Header>
              <h6 className="mb-0">
                <Clock size={16} className="me-2" />
                Informações do Sistema
              </h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p><strong>Última Verificação:</strong></p>
                  <p className="text-muted">
                    {settings.last_check 
                      ? new Date(settings.last_check).toLocaleString('pt-BR')
                      : 'Nunca'
                    }
                  </p>
                </Col>
                <Col md={6}>
                  <p><strong>Verificação Automática:</strong></p>
                  <p className="text-muted">
                    {settings.auto_check ? 'Ativada' : 'Desativada'}
                    {settings.auto_check && (
                      <span className="ms-2">
                        (a cada {settings.check_interval_hours}h)
                      </span>
                    )}
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>

      {/* Modal de Configurações */}
      <Modal show={showSettings} onHide={() => setShowSettings(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <Gear size={20} className="me-2" />
            Configurações de Atualização
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="auto-check"
                    label="Verificação Automática"
                    checked={localSettings.auto_check}
                    onChange={(e) => setLocalSettings(prev => ({
                      ...prev,
                      auto_check: e.target.checked
                    }))}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Intervalo de Verificação (horas)</Form.Label>
                  <Form.Select
                    value={localSettings.check_interval_hours}
                    onChange={(e) => setLocalSettings(prev => ({
                      ...prev,
                      check_interval_hours: parseInt(e.target.value)
                    }))}
                    disabled={!localSettings.auto_check}
                  >
                    <option value={1}>A cada hora</option>
                    <option value={6}>A cada 6 horas</option>
                    <option value={12}>A cada 12 horas</option>
                    <option value={24}>Diariamente</option>
                    <option value={168}>Semanalmente</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="auto-download"
                    label="Download Automático"
                    checked={localSettings.auto_download}
                    onChange={(e) => setLocalSettings(prev => ({
                      ...prev,
                      auto_download: e.target.checked
                    }))}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="auto-install"
                    label="Instalação Automática"
                    checked={localSettings.auto_install}
                    onChange={(e) => setLocalSettings(prev => ({
                      ...prev,
                      auto_install: e.target.checked
                    }))}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                id="beta-updates"
                label="Receber Atualizações Beta"
                checked={localSettings.beta_updates}
                onChange={(e) => setLocalSettings(prev => ({
                  ...prev,
                  beta_updates: e.target.checked
                }))}
              />
              <Form.Text className="text-muted">
                Inclui versões de desenvolvimento e testes
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSettings(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? (
              <>
                <Spinner size="sm" className="me-2" />
                Salvando...
              </>
            ) : (
              'Salvar Configurações'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Changelog */}
      <Modal show={showChangelog} onHide={() => setShowChangelog(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FileEarmarkText size={20} className="me-2" />
            Changelog - v{status.latest_version}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {status.update_info?.changelog && status.update_info.changelog.length > 0 ? (
            <ListGroup>
              {status.update_info.changelog.map((change, index) => (
                <ListGroup.Item key={index} className="d-flex align-items-start">
                  <CheckCircle size={16} className="text-success me-2 mt-1" />
                  <span>{change}</span>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <Alert variant="info">
              <InfoCircle size={16} className="me-2" />
              Nenhum changelog disponível para esta versão.
            </Alert>
          )}
          
          {status.update_info?.body && (
            <div className="mt-3">
              <h6>Descrição Completa:</h6>
              <div className="bg-light p-3 rounded">
                <pre className="mb-0">{status.update_info.body}</pre>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowChangelog(false)}>
            Fechar
          </Button>
          {hasUpdate && (
            <Button variant="primary" onClick={handleDownload}>
              <Download size={16} className="me-2" />
              Baixar Atualização
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UpdateManager;
