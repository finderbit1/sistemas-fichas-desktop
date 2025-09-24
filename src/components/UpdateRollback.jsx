/**
 * Sistema de Rollback de Atualizações
 * Permite reverter para versões anteriores em caso de problemas
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Alert, 
  Modal, 
  ListGroup, 
  Badge, 
  ProgressBar,
  Row,
  Col,
  Form
} from 'react-bootstrap';
import { 
  ArrowCounterclockwise, 
  ExclamationTriangle, 
  CheckCircle, 
  Clock,
  Download,
  InfoCircle,
  Shield,
  XCircle
} from 'react-bootstrap-icons';

const UpdateRollback = ({ className = '' }) => {
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [rollbackProgress, setRollbackProgress] = useState(0);
  const [rollbackError, setRollbackError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    auto_backup: true,
    backup_retention_days: 30,
    rollback_confirmation: true,
  });

  // ===== ESTADOS SIMULADOS =====
  // Em uma implementação real, estes dados viriam da API
  
  useEffect(() => {
    // Simular carregamento de versões disponíveis
    const mockVersions = [
      {
        id: '1',
        version: '0.1.0',
        date: '2024-01-15T10:00:00Z',
        status: 'current',
        description: 'Versão atual em uso',
        backup_available: true,
        size: 45000000, // 45MB
        changelog: [
          'Correções de bugs críticos',
          'Melhorias de performance',
          'Novas funcionalidades de relatórios'
        ]
      },
      {
        id: '2',
        version: '0.0.9',
        date: '2024-01-10T15:30:00Z',
        status: 'previous',
        description: 'Versão anterior estável',
        backup_available: true,
        size: 42000000, // 42MB
        changelog: [
          'Correções de interface',
          'Melhorias de segurança',
          'Otimizações de memória'
        ]
      },
      {
        id: '3',
        version: '0.0.8',
        date: '2024-01-05T09:15:00Z',
        status: 'backup',
        description: 'Backup de segurança',
        backup_available: true,
        size: 40000000, // 40MB
        changelog: [
          'Primeira versão estável',
          'Funcionalidades básicas',
          'Interface inicial'
        ]
      }
    ];
    
    setVersions(mockVersions);
  }, []);

  // ===== HANDLERS =====

  const handleRollback = async (version) => {
    if (settings.rollback_confirmation) {
      setSelectedVersion(version);
      setShowConfirmModal(true);
    } else {
      await performRollback(version);
    }
  };

  const performRollback = async (version) => {
    setIsRollingBack(true);
    setRollbackError(null);
    setRollbackProgress(0);
    setShowConfirmModal(false);

    try {
      // Simular processo de rollback
      const steps = [
        { progress: 20, message: 'Criando backup da versão atual...' },
        { progress: 40, message: 'Verificando integridade dos arquivos...' },
        { progress: 60, message: 'Baixando versão anterior...' },
        { progress: 80, message: 'Instalando versão anterior...' },
        { progress: 100, message: 'Rollback concluído com sucesso!' }
      ];

      for (const step of steps) {
        setRollbackProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Simular reinicialização do app
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      setRollbackError(error.message);
      setIsRollingBack(false);
    }
  };

  const handleConfirmRollback = () => {
    if (selectedVersion) {
      performRollback(selectedVersion);
    }
  };

  const handleDownloadBackup = async (version) => {
    try {
      // Simular download do backup
      console.log(`Baixando backup da versão ${version.version}...`);
      // Aqui você implementaria o download real
    } catch (error) {
      console.error('Erro ao baixar backup:', error);
    }
  };

  const formatFileSize = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'current':
        return <Badge bg="success">Atual</Badge>;
      case 'previous':
        return <Badge bg="warning">Anterior</Badge>;
      case 'backup':
        return <Badge bg="info">Backup</Badge>;
      default:
        return <Badge bg="secondary">Desconhecido</Badge>;
    }
  };

  return (
    <div className={`update-rollback ${className}`}>
      {/* Header */}
      <Card className="mb-4">
        <Card.Header className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <Shield size={20} className="me-2 text-warning" />
            <strong>Sistema de Rollback</strong>
            <Badge bg="warning" className="ms-2">Segurança</Badge>
          </div>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setShowSettings(true)}
          >
            Configurações
          </Button>
        </Card.Header>
        <Card.Body>
          <Alert variant="warning" className="mb-3">
            <ExclamationTriangle size={16} className="me-2" />
            <strong>Atenção:</strong> O rollback irá reverter todas as mudanças para a versão selecionada. 
            Certifique-se de fazer backup dos dados importantes antes de prosseguir.
          </Alert>

          {/* Progresso do Rollback */}
          {isRollingBack && (
            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0">
                  <ArrowCounterclockwise size={16} className="me-2" />
                  Executando Rollback...
                </h6>
              </Card.Header>
              <Card.Body>
                <ProgressBar 
                  now={rollbackProgress} 
                  label={`${rollbackProgress}%`}
                  variant="warning"
                  animated
                  className="mb-3"
                />
                <p className="text-muted small mb-0">
                  {rollbackProgress < 20 && 'Criando backup da versão atual...'}
                  {rollbackProgress >= 20 && rollbackProgress < 40 && 'Verificando integridade dos arquivos...'}
                  {rollbackProgress >= 40 && rollbackProgress < 60 && 'Baixando versão anterior...'}
                  {rollbackProgress >= 60 && rollbackProgress < 80 && 'Instalando versão anterior...'}
                  {rollbackProgress >= 80 && 'Finalizando rollback...'}
                </p>
              </Card.Body>
            </Card>
          )}

          {/* Erro no Rollback */}
          {rollbackError && (
            <Alert variant="danger" className="mb-3">
              <XCircle size={16} className="me-2" />
              <strong>Erro no Rollback:</strong> {rollbackError}
            </Alert>
          )}

          {/* Lista de Versões */}
          <Card>
            <Card.Header>
              <h6 className="mb-0">
                <Clock size={16} className="me-2" />
                Versões Disponíveis para Rollback
              </h6>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {versions.map((version) => (
                  <ListGroup.Item key={version.id} className="px-0">
                    <Row className="align-items-center">
                      <Col md={8}>
                        <div className="d-flex align-items-center mb-2">
                          <strong className="me-2">v{version.version}</strong>
                          {getStatusBadge(version.status)}
                          {version.backup_available && (
                            <Badge bg="success" className="ms-2">
                              <CheckCircle size={12} className="me-1" />
                              Backup Disponível
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-muted small mb-1">
                          <Clock size={12} className="me-1" />
                          {formatDate(version.date)}
                        </p>
                        
                        <p className="text-muted small mb-2">
                          {version.description}
                        </p>
                        
                        <div className="d-flex align-items-center gap-3">
                          <span className="text-muted small">
                            <Download size={12} className="me-1" />
                            {formatFileSize(version.size)}
                          </span>
                          
                          {version.changelog && version.changelog.length > 0 && (
                            <span className="text-muted small">
                              <InfoCircle size={12} className="me-1" />
                              {version.changelog.length} mudanças
                            </span>
                          )}
                        </div>
                      </Col>
                      
                      <Col md={4} className="text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          {version.status !== 'current' && (
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => handleRollback(version)}
                              disabled={isRollingBack}
                            >
                              <ArrowCounterclockwise size={14} className="me-1" />
                              Fazer Rollback
                            </Button>
                          )}
                          
                          {version.backup_available && (
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => handleDownloadBackup(version)}
                            >
                              <Download size={14} className="me-1" />
                              Backup
                            </Button>
                          )}
                        </div>
                      </Col>
                    </Row>
                    
                    {/* Changelog da Versão */}
                    {version.changelog && version.changelog.length > 0 && (
                      <div className="mt-3">
                        <details>
                          <summary className="small text-primary cursor-pointer">
                            Ver mudanças desta versão
                          </summary>
                          <ul className="mt-2 small text-muted">
                            {version.changelog.map((change, index) => (
                              <li key={index}>{change}</li>
                            ))}
                          </ul>
                        </details>
                      </div>
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>

      {/* Modal de Confirmação */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <ExclamationTriangle size={20} className="me-2 text-warning" />
            Confirmar Rollback
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger" className="mb-3">
            <strong>ATENÇÃO:</strong> Esta ação irá reverter o sistema para a versão anterior e 
            não pode ser desfeita facilmente.
          </Alert>

          {selectedVersion && (
            <div>
              <h6>Detalhes do Rollback:</h6>
              <Row className="mb-3">
                <Col md={6}>
                  <p><strong>Versão Atual:</strong> v{versions.find(v => v.status === 'current')?.version}</p>
                  <p><strong>Versão de Destino:</strong> v{selectedVersion.version}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Data da Versão:</strong> {formatDate(selectedVersion.date)}</p>
                  <p><strong>Tamanho:</strong> {formatFileSize(selectedVersion.size)}</p>
                </Col>
              </Row>

              <div className="bg-light p-3 rounded mb-3">
                <strong>O que acontecerá:</strong>
                <ul className="mb-0 mt-2">
                  <li>Um backup da versão atual será criado</li>
                  <li>O sistema será revertido para v{selectedVersion.version}</li>
                  <li>O aplicativo será reiniciado automaticamente</li>
                  <li>Dados do usuário serão preservados</li>
                </ul>
              </div>

              <Form.Check
                type="checkbox"
                id="confirm-rollback"
                label="Entendo os riscos e confirmo o rollback"
                className="mb-3"
              />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="warning" 
            onClick={handleConfirmRollback}
            disabled={isRollingBack}
          >
            {isRollingBack ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" />
                Executando...
              </>
            ) : (
              <>
                <ArrowCounterclockwise size={16} className="me-2" />
                Confirmar Rollback
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Configurações */}
      <Modal show={showSettings} onHide={() => setShowSettings(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <Shield size={20} className="me-2" />
            Configurações de Rollback
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                id="auto-backup"
                label="Criar backup automático antes do rollback"
                checked={settings.auto_backup}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  auto_backup: e.target.checked
                }))}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Retenção de Backups (dias)</Form.Label>
              <Form.Select
                value={settings.backup_retention_days}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  backup_retention_days: parseInt(e.target.value)
                }))}
              >
                <option value={7}>7 dias</option>
                <option value={15}>15 dias</option>
                <option value={30}>30 dias</option>
                <option value={60}>60 dias</option>
                <option value={90}>90 dias</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                id="rollback-confirmation"
                label="Solicitar confirmação antes do rollback"
                checked={settings.rollback_confirmation}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  rollback_confirmation: e.target.checked
                }))}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSettings(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={() => setShowSettings(false)}>
            Salvar Configurações
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UpdateRollback;
