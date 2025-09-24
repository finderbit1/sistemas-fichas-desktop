/**
 * Notificação de Atualização
 * Componente para mostrar notificações de atualizações disponíveis
 */

import React, { useState, useEffect } from 'react';
import { Alert, Button, Modal, Badge, Row, Col } from 'react-bootstrap';
import { 
  Download, 
  X, 
  InfoCircle, 
  CheckCircle, 
  Clock,
  FileEarmarkText
} from 'react-bootstrap-icons';
import { useUpdater } from '../hooks/useUpdater';

const UpdateNotification = ({ 
  position = 'top-right',
  autoHide = true,
  hideDelay = 10000,
  className = ''
}) => {
  const {
    status,
    hasUpdateAvailable,
    downloadUpdate,
    installUpdate,
    formatFileSize,
    formatReleaseDate,
    isDownloading,
    isInstalling,
    getTotalProgress
  } = useUpdater();

  const [show, setShow] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Mostrar notificação quando houver atualização
  useEffect(() => {
    if (hasUpdateAvailable() && !isDismissed) {
      setShow(true);
      
      // Auto-hide após delay
      if (autoHide) {
        const timer = setTimeout(() => {
          setShow(false);
        }, hideDelay);
        
        return () => clearTimeout(timer);
      }
    }
  }, [status.available, hasUpdateAvailable, isDismissed, autoHide, hideDelay]);

  // Esconder quando não há atualização
  useEffect(() => {
    if (!hasUpdateAvailable()) {
      setShow(false);
      setIsDismissed(false);
    }
  }, [status.available, hasUpdateAvailable]);

  const handleDismiss = () => {
    setShow(false);
    setIsDismissed(true);
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

  const handleShowDetails = () => {
    setShowDetails(true);
  };

  if (!show || !hasUpdateAvailable()) {
    return null;
  }

  const progress = getTotalProgress();
  const currentOperation = isInstalling ? 'installing' : isDownloading ? 'downloading' : 'idle';

  return (
    <>
      {/* Notificação Principal */}
      <div 
        className={`update-notification update-notification-${position} ${className}`}
        style={{
          position: 'fixed',
          top: position.includes('top') ? '20px' : 'auto',
          bottom: position.includes('bottom') ? '20px' : 'auto',
          right: position.includes('right') ? '20px' : 'auto',
          left: position.includes('left') ? '20px' : 'auto',
          zIndex: 9999,
          maxWidth: '400px',
          animation: 'slideInRight 0.3s ease-out'
        }}
      >
        <Alert 
          variant="info" 
          className="mb-0 shadow-lg border-0"
          style={{ 
            backgroundColor: 'rgba(13, 202, 240, 0.95)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="d-flex align-items-start">
            <div className="flex-grow-1">
              <div className="d-flex align-items-center mb-2">
                <Download size={20} className="me-2" />
                <strong>Nova Atualização Disponível</strong>
                <Badge bg="warning" className="ms-2">
                  v{status.latest_version}
                </Badge>
              </div>
              
              <p className="mb-2 small">
                Uma nova versão do SGP está disponível. 
                Mantenha seu sistema sempre atualizado!
              </p>
              
              {currentOperation !== 'idle' && progress !== null && (
                <div className="mb-2">
                  <div className="d-flex justify-content-between small mb-1">
                    <span>
                      {currentOperation === 'downloading' ? 'Baixando...' : 'Instalando...'}
                    </span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                  <div 
                    className="progress" 
                    style={{ height: '4px' }}
                  >
                    <div 
                      className="progress-bar progress-bar-striped progress-bar-animated" 
                      role="progressbar" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
              
              <div className="d-flex gap-2 flex-wrap">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleDownload}
                  disabled={isDownloading || isInstalling}
                >
                  {isDownloading ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-1" />
                      Baixando...
                    </>
                  ) : (
                    <>
                      <Download size={14} className="me-1" />
                      Baixar
                    </>
                  )}
                </Button>
                
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleInstall}
                  disabled={!status.available || isInstalling}
                >
                  {isInstalling ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-1" />
                      Instalando...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} className="me-1" />
                      Instalar
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleShowDetails}
                >
                  <InfoCircle size={14} className="me-1" />
                  Detalhes
                </Button>
              </div>
            </div>
            
            <Button
              variant="link"
              size="sm"
              onClick={handleDismiss}
              className="p-0 ms-2"
              style={{ color: 'inherit' }}
            >
              <X size={16} />
            </Button>
          </div>
        </Alert>
      </div>

      {/* Modal de Detalhes */}
      <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <Download size={20} className="me-2" />
            Detalhes da Atualização
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {status.update_info && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <div className="d-flex align-items-center mb-2">
                    <CheckCircle className="text-success me-2" />
                    <strong>Versão Atual:</strong>
                    <Badge bg="success" className="ms-2">
                      v{status.current_version}
                    </Badge>
                  </div>
                  
                  <div className="d-flex align-items-center mb-2">
                    <InfoCircle className="text-info me-2" />
                    <strong>Nova Versão:</strong>
                    <Badge bg="warning" className="ms-2">
                      v{status.latest_version}
                    </Badge>
                  </div>
                </Col>
                
                <Col md={6}>
                  <div className="d-flex align-items-center mb-2">
                    <Clock className="text-muted me-2" />
                    <strong>Data:</strong>
                    <span className="ms-2">
                      {formatReleaseDate(status.update_info.date)}
                    </span>
                  </div>
                  
                  <div className="d-flex align-items-center mb-2">
                    <FileEarmarkText className="text-muted me-2" />
                    <strong>Tamanho:</strong>
                    <span className="ms-2">
                      {formatFileSize(status.update_info.size)}
                    </span>
                  </div>
                </Col>
              </Row>
              
              {status.update_info.body && (
                <div className="mb-3">
                  <strong>Descrição:</strong>
                  <div className="bg-light p-3 rounded mt-2">
                    <pre className="mb-0 small">{status.update_info.body}</pre>
                  </div>
                </div>
              )}
              
              {status.update_info.changelog && status.update_info.changelog.length > 0 && (
                <div className="mb-3">
                  <strong>Principais Mudanças:</strong>
                  <ul className="mt-2">
                    {status.update_info.changelog.slice(0, 5).map((change, index) => (
                      <li key={index} className="small">{change}</li>
                    ))}
                  </ul>
                  {status.update_info.changelog.length > 5 && (
                    <p className="text-muted small">
                      E mais {status.update_info.changelog.length - 5} mudanças...
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetails(false)}>
            Fechar
          </Button>
          <Button
            variant="primary"
            onClick={handleDownload}
            disabled={isDownloading || isInstalling}
          >
            {isDownloading ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" />
                Baixando...
              </>
            ) : (
              <>
                <Download size={16} className="me-2" />
                Baixar Atualização
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Estilos CSS */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .update-notification {
          animation: slideInRight 0.3s ease-out;
        }
        
        .update-notification .alert {
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        
        .update-notification .btn {
          border-radius: 8px;
        }
        
        .update-notification .progress {
          border-radius: 4px;
          background-color: rgba(255, 255, 255, 0.3);
        }
        
        .update-notification .progress-bar {
          background-color: #fff;
        }
      `}</style>
    </>
  );
};

export default UpdateNotification;
