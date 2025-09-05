import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Badge, Form, Row, Col, Alert } from 'react-bootstrap';
import { 
  ClipboardData, 
  Download, 
  Trash, 
  Search, 
  Filter,
  Calendar,
  Person,
  Activity
} from 'react-bootstrap-icons';
import logger from '../utils/logger';

export default function LogsModal({ show, onHide }) {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [filters, setFilters] = useState({
    action: '',
    level: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  useEffect(() => {
    if (show) {
      loadLogs();
    }
  }, [show]);

  useEffect(() => {
    applyFilters();
  }, [logs, filters]);

  const loadLogs = () => {
    const allLogs = logger.getAllLogs();
    setLogs(allLogs);
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // Filtrar por ação
    if (filters.action) {
      filtered = filtered.filter(log => log.action === filters.action);
    }

    // Filtrar por nível
    if (filters.level) {
      filtered = filtered.filter(log => log.level === filters.level);
    }

    // Filtrar por data
    if (filters.dateFrom) {
      filtered = filtered.filter(log => new Date(log.timestamp) >= new Date(filters.dateFrom));
    }

    if (filters.dateTo) {
      filtered = filtered.filter(log => new Date(log.timestamp) <= new Date(filters.dateTo));
    }

    // Filtrar por texto de busca
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(searchTerm) ||
        log.data?.pedidoId?.toString().includes(searchTerm) ||
        log.data?.numeroPedido?.toLowerCase().includes(searchTerm) ||
        log.data?.cliente?.toLowerCase().includes(searchTerm) ||
        log.user?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredLogs(filtered);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      action: '',
      level: '',
      dateFrom: '',
      dateTo: '',
      search: ''
    });
  };

  const exportLogs = () => {
    const csv = logger.exportLogsCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const exportLogsJSON = () => {
    const json = logger.exportLogs();
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const clearLogs = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os logs? Esta ação não pode ser desfeita.')) {
      logger.clearLogs();
      loadLogs();
    }
  };

  const getLevelBadge = (level) => {
    const variants = {
      info: 'info',
      success: 'success',
      warning: 'warning',
      error: 'danger'
    };
    return <Badge bg={variants[level] || 'secondary'}>{level.toUpperCase()}</Badge>;
  };

  const getActionIcon = (action) => {
    const icons = {
      PEDIDO_CREATED: '📝',
      PEDIDO_UPDATED: '✏️',
      PEDIDO_DELETED: '🗑️',
      SETOR_CHANGED: '🔄',
      PRINT: '🖨️',
      ERROR: '❌',
      API_CALL: '🌐'
    };
    return icons[action] || '📋';
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  const getUniqueActions = () => {
    return [...new Set(logs.map(log => log.action))].sort();
  };

  const getUniqueLevels = () => {
    return [...new Set(logs.map(log => log.level))].sort();
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <Activity className="me-2" />
          Logs do Sistema
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {/* Filtros */}
        <div className="mb-4">
          <Row>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Buscar</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Buscar em logs..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Ação</Form.Label>
                <Form.Select
                  value={filters.action}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                >
                  <option value="">Todas</option>
                  {getUniqueActions().map(action => (
                    <option key={action} value={action}>{action}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Nível</Form.Label>
                <Form.Select
                  value={filters.level}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                >
                  <option value="">Todos</option>
                  {getUniqueLevels().map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Data Início</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Data Fim</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={1}>
              <Form.Group>
                <Form.Label>&nbsp;</Form.Label>
                <Button
                  variant="outline-secondary"
                  onClick={clearFilters}
                  className="w-100"
                  title="Limpar filtros"
                >
                  <Filter size={16} />
                </Button>
              </Form.Group>
            </Col>
          </Row>
        </div>

        {/* Estatísticas */}
        <div className="mb-3">
          <Alert variant="info" className="mb-0">
            <strong>Total de logs:</strong> {filteredLogs.length} de {logs.length}
            {filters.action && ` | Ação: ${filters.action}`}
            {filters.level && ` | Nível: ${filters.level}`}
          </Alert>
        </div>

        {/* Tabela de logs */}
        <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <Table striped bordered hover size="sm">
            <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
              <tr>
                <th>Timestamp</th>
                <th>Ação</th>
                <th>Nível</th>
                <th>Usuário</th>
                <th>Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted">
                    Nenhum log encontrado
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => (
                  <tr key={log.id || index}>
                    <td>
                      <small>{formatTimestamp(log.timestamp)}</small>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="me-2">{getActionIcon(log.action)}</span>
                        <span>{log.action}</span>
                      </div>
                    </td>
                    <td>{getLevelBadge(log.level)}</td>
                    <td>
                      <Person size={14} className="me-1" />
                      {log.user || 'Sistema'}
                    </td>
                    <td>
                      <div style={{ maxWidth: '300px', wordBreak: 'break-word' }}>
                        {log.data?.pedidoId && (
                          <div><strong>Pedido:</strong> #{log.data.numeroPedido || log.data.pedidoId}</div>
                        )}
                        {log.data?.cliente && (
                          <div><strong>Cliente:</strong> {log.data.cliente}</div>
                        )}
                        {log.data?.setor && (
                          <div><strong>Setor:</strong> {log.data.setor}</div>
                        )}
                        {log.data?.changes && (
                          <div><strong>Alterações:</strong> {log.data.changes.join(', ')}</div>
                        )}
                        {log.data?.note && (
                          <div><strong>Nota:</strong> {log.data.note}</div>
                        )}
                        {log.data?.error && (
                          <div><strong>Erro:</strong> {log.data.error}</div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={clearLogs}>
          <Trash className="me-2" />
          Limpar Logs
        </Button>
        <Button variant="outline-primary" onClick={exportLogsJSON}>
          <Download className="me-2" />
          Exportar JSON
        </Button>
        <Button variant="outline-success" onClick={exportLogs}>
          <Download className="me-2" />
          Exportar CSV
        </Button>
        <Button variant="secondary" onClick={onHide}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
