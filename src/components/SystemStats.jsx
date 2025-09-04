import React, { useState, useEffect } from 'react';
import { Card, Row, Col, ProgressBar, Badge } from 'react-bootstrap';
import { 
  Cpu, 
  Hdd, 
  Memory, 
  Wifi, 
  Clock, 
  CheckCircle, 
  ExclamationTriangle,
  XCircle
} from 'react-bootstrap-icons';

const SystemStats = () => {
  const [stats, setStats] = useState({
    cpu: 0,
    memory: 0,
    disk: 0,
    uptime: '0d 0h 0m',
    connections: 0,
    status: 'online'
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de estatísticas
    const loadStats = () => {
      setIsLoading(true);
      
      // Simular dados do sistema
      setTimeout(() => {
        setStats({
          cpu: Math.floor(Math.random() * 30) + 10, // 10-40%
          memory: Math.floor(Math.random() * 40) + 20, // 20-60%
          disk: Math.floor(Math.random() * 20) + 15, // 15-35%
          uptime: `${Math.floor(Math.random() * 30) + 1}d ${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m`,
          connections: Math.floor(Math.random() * 50) + 10,
          status: Math.random() > 0.1 ? 'online' : 'warning'
        });
        setIsLoading(false);
      }, 1000);
    };

    loadStats();
    const interval = setInterval(loadStats, 30000); // Atualizar a cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return <CheckCircle size={16} />;
      case 'warning': return <ExclamationTriangle size={16} />;
      case 'error': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getProgressVariant = (value) => {
    if (value < 50) return 'success';
    if (value < 80) return 'warning';
    return 'danger';
  };

  if (isLoading) {
    return (
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h5 className="dashboard-card-title">
            <Cpu className="dashboard-card-icon" />
            Estatísticas do Sistema
          </h5>
        </div>
        <div style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
          <div className="loading" style={{ marginBottom: 'var(--spacing-4)' }} />
          <p style={{ color: 'var(--color-neutral-600)' }}>Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <h5 className="dashboard-card-title">
          <Cpu className="dashboard-card-icon" />
          Estatísticas do Sistema
        </h5>
        <Badge bg={getStatusColor(stats.status)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {getStatusIcon(stats.status)}
          {stats.status === 'online' ? 'Online' : stats.status === 'warning' ? 'Atenção' : 'Erro'}
        </Badge>
      </div>

      <Row className="mb-4">
        <Col md={6}>
          <div style={{ marginBottom: 'var(--spacing-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-2)' }}>
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                <Cpu size={14} style={{ marginRight: '8px' }} />
                CPU
              </span>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)' }}>
                {stats.cpu}%
              </span>
            </div>
            <ProgressBar 
              variant={getProgressVariant(stats.cpu)} 
              now={stats.cpu} 
              style={{ height: '8px', borderRadius: 'var(--border-radius-sm)' }}
            />
          </div>

          <div style={{ marginBottom: 'var(--spacing-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-2)' }}>
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                <Memory size={14} style={{ marginRight: '8px' }} />
                Memória
              </span>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)' }}>
                {stats.memory}%
              </span>
            </div>
            <ProgressBar 
              variant={getProgressVariant(stats.memory)} 
              now={stats.memory} 
              style={{ height: '8px', borderRadius: 'var(--border-radius-sm)' }}
            />
          </div>
        </Col>

        <Col md={6}>
          <div style={{ marginBottom: 'var(--spacing-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-2)' }}>
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                <Hdd size={14} style={{ marginRight: '8px' }} />
                Disco
              </span>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)' }}>
                {stats.disk}%
              </span>
            </div>
            <ProgressBar 
              variant={getProgressVariant(stats.disk)} 
              now={stats.disk} 
              style={{ height: '8px', borderRadius: 'var(--border-radius-sm)' }}
            />
          </div>

          <div style={{ 
            background: 'var(--color-neutral-50)', 
            padding: 'var(--spacing-4)', 
            borderRadius: 'var(--border-radius)',
            border: '1px solid var(--color-neutral-200)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-2)' }}>
              <Clock size={14} style={{ marginRight: '8px', color: 'var(--color-primary)' }} />
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                Tempo de Atividade
              </span>
            </div>
            <p style={{ 
              margin: 0, 
              fontSize: 'var(--font-size-lg)', 
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-primary)'
            }}>
              {stats.uptime}
            </p>
          </div>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <div style={{ 
            background: 'var(--color-neutral-50)', 
            padding: 'var(--spacing-4)', 
            borderRadius: 'var(--border-radius)',
            border: '1px solid var(--color-neutral-200)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Wifi size={16} style={{ marginRight: '8px', color: 'var(--color-success)' }} />
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                  Conexões Ativas
                </span>
              </div>
              <span style={{ 
                fontSize: 'var(--font-size-lg)', 
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-success)'
              }}>
                {stats.connections}
              </span>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default SystemStats;
