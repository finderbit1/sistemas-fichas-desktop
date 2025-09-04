import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Badge, 
  Button, 
  Form, 
  Row, 
  Col, 
  Alert,
  Modal,
  ListGroup,
  ProgressBar
} from 'react-bootstrap';
import { 
  Shield, 
  ExclamationTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  Download,
  Funnel,
  Search,
  ExclamationCircle,
  Lock,
  Unlock,
  PersonCheck,
  PersonX
} from 'react-bootstrap-icons';

const SecurityAudit = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [filters, setFilters] = useState({
    type: 'all',
    severity: 'all',
    dateRange: '7d',
    search: ''
  });
  const [selectedLog, setSelectedLog] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock data - substituir por API real
  useEffect(() => {
    const mockAuditLogs = [
      {
        id: 1,
        timestamp: '2024-01-15 14:30:25',
        user: 'João Silva',
        action: 'LOGIN',
        description: 'Login realizado com sucesso',
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        severity: 'info',
        status: 'success',
        details: {
          location: 'São Paulo, SP',
          device: 'Desktop',
          browser: 'Chrome 120.0'
        }
      },
      {
        id: 2,
        timestamp: '2024-01-15 14:25:10',
        user: 'Maria Santos',
        action: 'USER_CREATE',
        description: 'Criou novo usuário: Pedro Costa',
        ip: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        severity: 'warning',
        status: 'success',
        details: {
          location: 'Rio de Janeiro, RJ',
          device: 'MacBook Pro',
          browser: 'Safari 17.0'
        }
      },
      {
        id: 3,
        timestamp: '2024-01-15 14:20:45',
        user: 'admin@exemplo.com',
        action: 'LOGIN_FAILED',
        description: 'Tentativa de login com credenciais inválidas',
        ip: '203.45.67.89',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        severity: 'danger',
        status: 'failed',
        details: {
          location: 'Brasília, DF',
          device: 'Desktop',
          browser: 'Chrome 120.0',
          attempts: 3
        }
      },
      {
        id: 4,
        timestamp: '2024-01-15 14:15:30',
        user: 'Pedro Costa',
        action: 'DATA_EXPORT',
        description: 'Exportou relatório de clientes',
        ip: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        severity: 'info',
        status: 'success',
        details: {
          location: 'Belo Horizonte, MG',
          device: 'Desktop',
          browser: 'Edge 120.0',
          fileSize: '2.5 MB'
        }
      },
      {
        id: 5,
        timestamp: '2024-01-15 14:10:15',
        user: 'João Silva',
        action: 'PASSWORD_CHANGE',
        description: 'Alterou senha de usuário',
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        severity: 'warning',
        status: 'success',
        details: {
          location: 'São Paulo, SP',
          device: 'Desktop',
          browser: 'Chrome 120.0'
        }
      }
    ];

    const mockSecurityAlerts = [
      {
        id: 1,
        type: 'MULTIPLE_FAILED_LOGINS',
        title: 'Múltiplas tentativas de login falhadas',
        description: '3 tentativas de login falhadas em 5 minutos',
        severity: 'high',
        timestamp: '2024-01-15 14:20:45',
        status: 'active',
        user: 'admin@exemplo.com',
        ip: '203.45.67.89'
      },
      {
        id: 2,
        type: 'UNUSUAL_ACCESS_PATTERN',
        title: 'Padrão de acesso incomum',
        description: 'Acesso de localização diferente do habitual',
        severity: 'medium',
        timestamp: '2024-01-15 13:45:20',
        status: 'resolved',
        user: 'Maria Santos',
        ip: '45.67.89.123'
      },
      {
        id: 3,
        type: 'PRIVILEGE_ESCALATION',
        title: 'Tentativa de escalação de privilégios',
        description: 'Usuário tentou acessar funcionalidade restrita',
        severity: 'high',
        timestamp: '2024-01-15 12:30:10',
        status: 'active',
        user: 'Pedro Costa',
        ip: '192.168.1.102'
      }
    ];

    const mockSessions = [
      {
        id: 1,
        user: 'João Silva',
        ip: '192.168.1.100',
        location: 'São Paulo, SP',
        device: 'Desktop - Chrome 120.0',
        loginTime: '2024-01-15 14:30:25',
        lastActivity: '2024-01-15 15:45:30',
        status: 'active',
        duration: '1h 15m'
      },
      {
        id: 2,
        user: 'Maria Santos',
        ip: '192.168.1.101',
        location: 'Rio de Janeiro, RJ',
        device: 'MacBook Pro - Safari 17.0',
        loginTime: '2024-01-15 14:25:10',
        lastActivity: '2024-01-15 15:30:45',
        status: 'active',
        duration: '1h 5m'
      },
      {
        id: 3,
        user: 'Pedro Costa',
        ip: '192.168.1.102',
        location: 'Belo Horizonte, MG',
        device: 'Desktop - Edge 120.0',
        loginTime: '2024-01-15 13:45:20',
        lastActivity: '2024-01-15 14:20:15',
        status: 'inactive',
        duration: '35m'
      }
    ];

    setAuditLogs(mockAuditLogs);
    setSecurityAlerts(mockSecurityAlerts);
    setSessions(mockSessions);
  }, []);

  const getSeverityBadge = (severity) => {
    const variants = {
      info: 'primary',
      warning: 'warning',
      danger: 'danger',
      success: 'success'
    };
    return <Badge bg={variants[severity] || 'secondary'}>{severity.toUpperCase()}</Badge>;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="text-success" size={16} />;
      case 'failed':
        return <XCircle className="text-danger" size={16} />;
      case 'pending':
        return <Clock className="text-warning" size={16} />;
      default:
        return <ExclamationCircle className="text-info" size={16} />;
    }
  };

  const getAlertSeverityBadge = (severity) => {
    const variants = {
      low: 'success',
      medium: 'warning',
      high: 'danger',
      critical: 'dark'
    };
    return <Badge bg={variants[severity] || 'secondary'}>{severity.toUpperCase()}</Badge>;
  };

  const getSessionStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge bg="success"><Unlock size={12} /> Ativa</Badge>;
      case 'inactive':
        return <Badge bg="secondary"><Lock size={12} /> Inativa</Badge>;
      case 'expired':
        return <Badge bg="warning"><Clock size={12} /> Expirada</Badge>;
      default:
        return <Badge bg="secondary">Desconhecida</Badge>;
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesType = filters.type === 'all' || log.action === filters.type;
    const matchesSeverity = filters.severity === 'all' || log.severity === filters.severity;
    const matchesSearch = filters.search === '' || 
      log.user.toLowerCase().includes(filters.search.toLowerCase()) ||
      log.description.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesType && matchesSeverity && matchesSearch;
  });

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  const handleExportLogs = () => {
    // Simular exportação
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleResolveAlert = (alertId) => {
    setSecurityAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: 'resolved' } : alert
    ));
  };

  const handleTerminateSession = (sessionId) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId ? { ...session, status: 'inactive' } : session
    ));
  };

  return (
    <div className="security-audit">
      <Row>
        {/* Logs de Auditoria */}
        <Col lg={8}>
          <Card className="dashboard-card mb-4">
            <Card.Header className="dashboard-card-header">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="dashboard-card-title">
                  <Shield className="dashboard-card-icon" />
                  Logs de Auditoria
                </h5>
                <div className="d-flex gap-2">
                  <Button variant="outline-primary" size="sm" onClick={handleExportLogs}>
                    <Download size={16} />
                    Exportar
                  </Button>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              {/* Filtros */}
              <Row className="mb-3">
                <Col md={3}>
                  <Form.Select
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="all">Todas as Ações</option>
                    <option value="LOGIN">Login</option>
                    <option value="LOGOUT">Logout</option>
                    <option value="USER_CREATE">Criação de Usuário</option>
                    <option value="USER_UPDATE">Atualização de Usuário</option>
                    <option value="USER_DELETE">Exclusão de Usuário</option>
                    <option value="PASSWORD_CHANGE">Alteração de Senha</option>
                    <option value="DATA_EXPORT">Exportação de Dados</option>
                    <option value="LOGIN_FAILED">Login Falhado</option>
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Form.Select
                    value={filters.severity}
                    onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                  >
                    <option value="all">Todas as Severidades</option>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="danger">Danger</option>
                    <option value="success">Success</option>
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Form.Select
                    value={filters.dateRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  >
                    <option value="1d">Últimas 24h</option>
                    <option value="7d">Últimos 7 dias</option>
                    <option value="30d">Últimos 30 dias</option>
                    <option value="90d">Últimos 90 dias</option>
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Form.Control
                    type="text"
                    placeholder="Buscar..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </Col>
              </Row>

              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Usuário</th>
                      <th>Ação</th>
                      <th>Severidade</th>
                      <th>Status</th>
                      <th>IP</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map(log => (
                      <tr key={log.id}>
                        <td>
                          <small className="text-muted">{log.timestamp}</small>
                        </td>
                        <td>
                          <div>
                            <div className="fw-bold">{log.user}</div>
                            <small className="text-muted">{log.ip}</small>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div className="fw-bold">{log.action}</div>
                            <small className="text-muted">{log.description}</small>
                          </div>
                        </td>
                        <td>{getSeverityBadge(log.severity)}</td>
                        <td>
                          <div className="d-flex align-items-center gap-1">
                            {getStatusIcon(log.status)}
                            <span className="text-capitalize">{log.status}</span>
                          </div>
                        </td>
                        <td>
                          <small className="text-muted">{log.ip}</small>
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleViewDetails(log)}
                          >
                            <Eye size={14} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Alertas de Segurança e Sessões */}
        <Col lg={4}>
          {/* Alertas de Segurança */}
          <Card className="dashboard-card mb-4">
            <Card.Header className="dashboard-card-header">
              <h6 className="dashboard-card-title">
                <ExclamationTriangle className="dashboard-card-icon" />
                Alertas de Segurança
              </h6>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {securityAlerts.map(alert => (
                  <ListGroup.Item key={alert.id} className="d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="fw-bold">{alert.title}</div>
                      <small className="text-muted">{alert.description}</small>
                      <div className="mt-1">
                        <small className="text-muted">
                          {alert.user} • {alert.timestamp}
                        </small>
                      </div>
                    </div>
                    <div className="d-flex flex-column align-items-end gap-1">
                      {getAlertSeverityBadge(alert.severity)}
                      {alert.status === 'active' && (
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => handleResolveAlert(alert.id)}
                        >
                          Resolver
                        </Button>
                      )}
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>

          {/* Sessões Ativas */}
          <Card className="dashboard-card">
            <Card.Header className="dashboard-card-header">
              <h6 className="dashboard-card-title">
                <PersonCheck className="dashboard-card-icon" />
                Sessões Ativas
              </h6>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {sessions.map(session => (
                  <ListGroup.Item key={session.id} className="d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="fw-bold">{session.user}</div>
                      <small className="text-muted">{session.device}</small>
                      <div className="mt-1">
                        <small className="text-muted">
                          {session.location} • {session.duration}
                        </small>
                      </div>
                    </div>
                    <div className="d-flex flex-column align-items-end gap-1">
                      {getSessionStatusBadge(session.status)}
                      {session.status === 'active' && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleTerminateSession(session.id)}
                        >
                          <PersonX size={14} />
                        </Button>
                      )}
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal de Detalhes */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalhes do Log</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLog && (
            <div>
              <Row>
                <Col md={6}>
                  <h6>Informações Básicas</h6>
                  <p><strong>Usuário:</strong> {selectedLog.user}</p>
                  <p><strong>Ação:</strong> {selectedLog.action}</p>
                  <p><strong>Descrição:</strong> {selectedLog.description}</p>
                  <p><strong>Timestamp:</strong> {selectedLog.timestamp}</p>
                </Col>
                <Col md={6}>
                  <h6>Informações Técnicas</h6>
                  <p><strong>IP:</strong> {selectedLog.ip}</p>
                  <p><strong>User Agent:</strong> {selectedLog.userAgent}</p>
                  <p><strong>Severidade:</strong> {getSeverityBadge(selectedLog.severity)}</p>
                  <p><strong>Status:</strong> {selectedLog.status}</p>
                </Col>
              </Row>
              
              {selectedLog.details && (
                <div className="mt-3">
                  <h6>Detalhes Adicionais</h6>
                  <pre className="bg-light p-3 rounded">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SecurityAudit;
