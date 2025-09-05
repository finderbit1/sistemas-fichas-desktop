import React, { useState } from 'react';
import { Card, Button, ProgressBar, Alert, ListGroup, Badge } from 'react-bootstrap';
import { 
  CloudDownload, 
  CloudUpload, 
  Clock, 
  CheckCircle, 
  ExclamationTriangle,
  Hdd,
  Calendar,
  FileEarmarkZip
} from 'react-bootstrap-icons';

const SystemBackup = () => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [backupStatus, setBackupStatus] = useState('idle');
  const [backupHistory, setBackupHistory] = useState([
    {
      id: 1,
      date: new Date(Date.now() - 86400000).toISOString(),
      size: '2.4 MB',
      status: 'success',
      type: 'automático'
    },
    {
      id: 2,
      date: new Date(Date.now() - 172800000).toISOString(),
      size: '2.1 MB',
      status: 'success',
      type: 'manual'
    },
    {
      id: 3,
      date: new Date(Date.now() - 259200000).toISOString(),
      size: '1.9 MB',
      status: 'warning',
      type: 'automático'
    }
  ]);

  const handleBackup = async () => {
    setIsBackingUp(true);
    setBackupStatus('running');
    setBackupProgress(0);

    // Simular processo de backup
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBackingUp(false);
          setBackupStatus('success');
          
          // Adicionar novo backup ao histórico
          const newBackup = {
            id: backupHistory.length + 1,
            date: new Date().toISOString(),
            size: '2.5 MB',
            status: 'success',
            type: 'manual'
          };
          setBackupHistory(prev => [newBackup, ...prev]);
          
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
  };

  const handleRestore = (backupId) => {
    if (window.confirm('Tem certeza que deseja restaurar este backup? Esta ação não pode ser desfeita.')) {
      // Simular restauração
      // Backup restaurado com sucesso
    }
  };

  const handleDownload = (backupId) => {
    // Simular download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `backup-${backupId}.zip`;
    link.click();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle size={16} />;
      case 'warning': return <ExclamationTriangle size={16} />;
      case 'error': return <ExclamationTriangle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'danger';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <h5 className="dashboard-card-title">
          <CloudDownload className="dashboard-card-icon" />
          Backup do Sistema
        </h5>
        <Badge bg="info" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Hdd size={14} />
          Ativo
        </Badge>
      </div>

      {/* Seção de Backup Manual */}
      <div style={{ marginBottom: 'var(--spacing-6)' }}>
        <h6 style={{ 
          fontSize: 'var(--font-size-base)', 
          fontWeight: 'var(--font-weight-semibold)',
          marginBottom: 'var(--spacing-4)',
          color: 'var(--color-neutral-800)'
        }}>
          Backup Manual
        </h6>
        
        {backupStatus === 'running' && (
          <Alert variant="info" style={{ marginBottom: 'var(--spacing-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
              <div className="animate-rotate">
                <CloudUpload size={16} />
              </div>
              <span>Realizando backup...</span>
            </div>
            <ProgressBar 
              now={backupProgress} 
              variant="info" 
              style={{ marginTop: 'var(--spacing-2)', height: '8px' }}
            />
            <small style={{ color: 'var(--color-neutral-600)' }}>
              {Math.round(backupProgress)}% concluído
            </small>
          </Alert>
        )}

        {backupStatus === 'success' && (
          <Alert variant="success" style={{ marginBottom: 'var(--spacing-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
              <CheckCircle size={16} />
              <span>Backup realizado com sucesso!</span>
            </div>
          </Alert>
        )}

        <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
          <Button
            variant="primary"
            onClick={handleBackup}
            disabled={isBackingUp}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <CloudUpload size={16} />
            {isBackingUp ? 'Fazendo Backup...' : 'Fazer Backup Agora'}
          </Button>
          
          <Button
            variant="outline-secondary"
            disabled={isBackingUp}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Calendar size={16} />
            Agendar Backup
          </Button>
        </div>
      </div>

      {/* Histórico de Backups */}
      <div>
        <h6 style={{ 
          fontSize: 'var(--font-size-base)', 
          fontWeight: 'var(--font-weight-semibold)',
          marginBottom: 'var(--spacing-4)',
          color: 'var(--color-neutral-800)'
        }}>
          Histórico de Backups
        </h6>

        <ListGroup>
          {backupHistory.map((backup) => (
            <ListGroup.Item
              key={backup.id}
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                border: '1px solid var(--color-neutral-200)',
                borderRadius: 'var(--border-radius)',
                marginBottom: 'var(--spacing-2)',
                padding: 'var(--spacing-4)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 'var(--spacing-2)',
                  color: `var(--color-${getStatusColor(backup.status)})`
                }}>
                  {getStatusIcon(backup.status)}
                </div>
                
                <div>
                  <div style={{ 
                    fontSize: 'var(--font-size-sm)', 
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-neutral-800)'
                  }}>
                    Backup #{backup.id}
                  </div>
                  <div style={{ 
                    fontSize: 'var(--font-size-xs)', 
                    color: 'var(--color-neutral-600)'
                  }}>
                    {formatDate(backup.date)} • {backup.size} • {backup.type}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => handleDownload(backup.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <FileEarmarkZip size={14} />
                  Download
                </Button>
                
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => handleRestore(backup.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <CloudDownload size={14} />
                  Restaurar
                </Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>

      {/* Informações do Sistema */}
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
          marginBottom: 'var(--spacing-3)',
          color: 'var(--color-neutral-700)'
        }}>
          Informações do Backup
        </h6>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
          <div>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-neutral-500)' }}>
              Próximo Backup Automático:
            </span>
            <p style={{ 
              margin: '4px 0 0 0', 
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-neutral-700)'
            }}>
              Hoje às 23:00
            </p>
          </div>
          
          <div>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-neutral-500)' }}>
              Espaço Disponível:
            </span>
            <p style={{ 
              margin: '4px 0 0 0', 
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-success)'
            }}>
              15.2 GB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemBackup;
