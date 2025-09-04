import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Form, Row, Col } from 'react-bootstrap';
import { 
  FileText, 
  Filter, 
  Download, 
  Trash, 
  Search,
  InfoCircle,
  ExclamationTriangle,
  XCircle,
  CheckCircle
} from 'react-bootstrap-icons';

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [filters, setFilters] = useState({
    level: 'all',
    search: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de logs
    const loadLogs = () => {
      setIsLoading(true);
      
      // Simular dados de logs
      const mockLogs = [
        {
          id: 1,
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'Sistema iniciado com sucesso',
          module: 'System',
          user: 'admin'
        },
        {
          id: 2,
          timestamp: new Date(Date.now() - 300000).toISOString(),
          level: 'warning',
          message: 'Alto uso de CPU detectado',
          module: 'Monitor',
          user: 'system'
        },
        {
          id: 3,
          timestamp: new Date(Date.now() - 600000).toISOString(),
          level: 'error',
          message: 'Falha na conexão com o banco de dados',
          module: 'Database',
          user: 'system'
        },
        {
          id: 4,
          timestamp: new Date(Date.now() - 900000).toISOString(),
          level: 'success',
          message: 'Backup realizado com sucesso',
          module: 'Backup',
          user: 'admin'
        },
        {
          id: 5,
          timestamp: new Date(Date.now() - 1200000).toISOString(),
          level: 'info',
          message: 'Usuário admin fez login',
          module: 'Auth',
          user: 'admin'
        }
      ];

      setTimeout(() => {
        setLogs(mockLogs);
        setFilteredLogs(mockLogs);
        setIsLoading(false);
      }, 1000);
    };

    loadLogs();
  }, []);

  useEffect(() => {
    let filtered = logs;

    if (filters.level !== 'all') {
      filtered = filtered.filter(log => log.level === filters.level);
    }

    if (filters.search) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(filters.search.toLowerCase()) ||
        log.module.toLowerCase().includes(filters.search.toLowerCase()) ||
        log.user.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  }, [logs, filters]);

  const getLevelIcon = (level) => {
    switch (level) {
      case 'info': return <InfoCircle size={14} />;
      case 'warning': return <ExclamationTriangle size={14} />;
      case 'error': return <XCircle size={14} />;
      case 'success': return <CheckCircle size={14} />;
      default: return <InfoCircle size={14} />;
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'info': return 'info';
      case 'warning': return 'warning';
      case 'error': return 'danger';
      case 'success': return 'success';
      default: return 'secondary';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleClearLogs = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os logs?')) {
      setLogs([]);
      setFilteredLogs([]);
    }
  };

  const handleExportLogs = () => {
    const csvContent = [
      'Timestamp,Level,Module,User,Message',
      ...filteredLogs.map(log => 
        `"${log.timestamp}","${log.level}","${log.module}","${log.user}","${log.message}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h5 className="dashboard-card-title">
            <FileText className="dashboard-card-icon" />
            Logs do Sistema
          </h5>
        </div>
        <div style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
          <div className="loading" style={{ marginBottom: 'var(--spacing-4)' }} />
          <p style={{ color: 'var(--color-neutral-600)' }}>Carregando logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <h5 className="dashboard-card-title">
          <FileText className="dashboard-card-icon" />
          Logs do Sistema
        </h5>
        <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleExportLogs}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Download size={14} />
            Exportar
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={handleClearLogs}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Trash size={14} />
            Limpar
          </Button>
        </div>
      </div>

      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
              <Filter size={14} style={{ marginRight: '8px' }} />
              Nível
            </Form.Label>
            <Form.Select
              value={filters.level}
              onChange={(e) => setFilters({ ...filters, level: e.target.value })}
              size="sm"
            >
              <option value="all">Todos</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="success">Success</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
              <Search size={14} style={{ marginRight: '8px' }} />
              Buscar
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Buscar em logs..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              size="sm"
            />
          </Form.Group>
        </Col>
      </Row>

      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <Table hover size="sm">
          <thead style={{ position: 'sticky', top: 0, background: 'var(--color-neutral-50)', zIndex: 1 }}>
            <tr>
              <th style={{ width: '120px' }}>Timestamp</th>
              <th style={{ width: '80px' }}>Nível</th>
              <th style={{ width: '100px' }}>Módulo</th>
              <th style={{ width: '100px' }}>Usuário</th>
              <th>Mensagem</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--spacing-8)', color: 'var(--color-neutral-500)' }}>
                  Nenhum log encontrado
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-family-mono)' }}>
                    {formatTimestamp(log.timestamp)}
                  </td>
                  <td>
                    <Badge bg={getLevelColor(log.level)} style={{ display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
                      {getLevelIcon(log.level)}
                      {log.level.toUpperCase()}
                    </Badge>
                  </td>
                  <td style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                    {log.module}
                  </td>
                  <td style={{ fontSize: 'var(--font-size-sm)' }}>
                    {log.user}
                  </td>
                  <td style={{ fontSize: 'var(--font-size-sm)' }}>
                    {log.message}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      <div style={{ 
        marginTop: 'var(--spacing-4)', 
        padding: 'var(--spacing-3)', 
        background: 'var(--color-neutral-50)', 
        borderRadius: 'var(--border-radius)',
        border: '1px solid var(--color-neutral-200)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)' }}>
            Total de logs: <strong>{filteredLogs.length}</strong>
          </span>
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)' }}>
            Última atualização: {new Date().toLocaleTimeString('pt-BR')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SystemLogs;
