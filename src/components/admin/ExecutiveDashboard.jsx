import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Table, 
  ProgressBar, 
  Badge,
  Button,
  Dropdown,
  Alert
} from 'react-bootstrap';
import { 
  GraphUp, 
  ArrowUp, 
  ArrowDown, 
  People, 
  Cart, 
  CurrencyDollar,
  Eye,
  Download,
  ArrowClockwise,
  Calendar,
  Funnel
} from 'react-bootstrap-icons';

const ExecutiveDashboard = () => {
  const [dashboardData, setDashboardData] = useState({});
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('30d');
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Mock data - substituir por API real
  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh a cada 5 minutos
    const interval = setInterval(loadDashboardData, 300000);
    setRefreshInterval(interval);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [dateRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData = {
        kpis: {
          totalRevenue: 125000,
          totalOrders: 342,
          totalCustomers: 156,
          averageOrderValue: 365.50,
          revenueGrowth: 12.5,
          ordersGrowth: 8.3,
          customersGrowth: 15.2,
          aovGrowth: -2.1
        },
        topProducts: [
          { id: 1, name: 'Banner 1x1m', sales: 45, revenue: 2250, growth: 15.2 },
          { id: 2, name: 'Lona 2x2m', sales: 32, revenue: 1920, growth: 8.7 },
          { id: 3, name: 'Adesivo Vinil', sales: 28, revenue: 1400, growth: -3.2 },
          { id: 4, name: 'Bandeira 1x1.5m', sales: 25, revenue: 1250, growth: 22.1 },
          { id: 5, name: 'Faixa 0.5x3m', sales: 20, revenue: 800, growth: 5.4 }
        ],
        recentOrders: [
          { id: 'PED-001', customer: 'João Silva', value: 450.00, status: 'completed', date: '2024-01-15 14:30' },
          { id: 'PED-002', customer: 'Maria Santos', value: 320.00, status: 'processing', date: '2024-01-15 13:45' },
          { id: 'PED-003', customer: 'Pedro Costa', value: 680.00, status: 'pending', date: '2024-01-15 12:20' },
          { id: 'PED-004', customer: 'Ana Oliveira', value: 250.00, status: 'completed', date: '2024-01-15 11:15' },
          { id: 'PED-005', customer: 'Carlos Lima', value: 890.00, status: 'shipped', date: '2024-01-15 10:30' }
        ],
        salesByMonth: [
          { month: 'Jan', revenue: 45000, orders: 120 },
          { month: 'Fev', revenue: 52000, orders: 135 },
          { month: 'Mar', revenue: 48000, orders: 128 },
          { month: 'Abr', revenue: 61000, orders: 145 },
          { month: 'Mai', revenue: 55000, orders: 138 },
          { month: 'Jun', revenue: 67000, orders: 152 }
        ],
        customerSegments: [
          { segment: 'Novos', count: 45, percentage: 28.8, revenue: 16500 },
          { segment: 'Recorrentes', count: 78, percentage: 50.0, revenue: 45600 },
          { segment: 'VIP', count: 33, percentage: 21.2, revenue: 62900 }
        ],
        systemHealth: {
          uptime: 99.8,
          responseTime: 245,
          errorRate: 0.2,
          activeUsers: 12
        }
      };
      
      setDashboardData(mockData);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0.0%';
    }
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getStatusBadge = (status) => {
    const variants = {
      completed: 'success',
      processing: 'warning',
      pending: 'info',
      shipped: 'primary',
      cancelled: 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getGrowthIcon = (value) => {
    return value >= 0 ? <ArrowUp className="text-success" /> : <ArrowDown className="text-danger" />;
  };

  const handleExport = (type) => {
    // Simular exportação
    const data = type === 'kpis' ? dashboardData.kpis : dashboardData;
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-${type}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading && !dashboardData.kpis) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="text-center">
          <ArrowClockwise className="spinner-border" size={48} />
          <p className="mt-3">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // Verificar se os dados estão carregados
  if (!dashboardData.kpis) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="text-center">
          <p>Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className="executive-dashboard">
      {/* Header com controles */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Dashboard Executivo</h4>
            <div className="d-flex gap-2">
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary" size="sm">
                  <Calendar size={16} className="me-2" />
                  {dateRange === '7d' ? '7 dias' : dateRange === '30d' ? '30 dias' : '90 dias'}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setDateRange('7d')}>Últimos 7 dias</Dropdown.Item>
                  <Dropdown.Item onClick={() => setDateRange('30d')}>Últimos 30 dias</Dropdown.Item>
                  <Dropdown.Item onClick={() => setDateRange('90d')}>Últimos 90 dias</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              
              <Dropdown>
                <Dropdown.Toggle variant="outline-primary" size="sm">
                  <Download size={16} className="me-2" />
                  Exportar
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => handleExport('kpis')}>KPIs</Dropdown.Item>
                  <Dropdown.Item onClick={() => handleExport('full')}>Dashboard Completo</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={loadDashboardData}
                disabled={loading}
              >
                <ArrowClockwise size={16} className={loading ? 'spinner-border spinner-border-sm' : ''} />
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* KPIs Principais */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="dashboard-card text-center">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <CurrencyDollar className="dashboard-card-icon text-success" size={24} />
                <div className="d-flex align-items-center">
                  {getGrowthIcon(dashboardData.kpis?.revenueGrowth)}
                  <small className="ms-1 text-muted">
                    {formatPercentage(dashboardData.kpis?.revenueGrowth)}
                  </small>
                </div>
              </div>
              <h3 className="mb-1">{formatCurrency(dashboardData.kpis?.totalRevenue || 0)}</h3>
              <p className="text-muted mb-0">Receita Total</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="dashboard-card text-center">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <Cart className="dashboard-card-icon text-primary" size={24} />
                <div className="d-flex align-items-center">
                  {getGrowthIcon(dashboardData.kpis?.ordersGrowth)}
                  <small className="ms-1 text-muted">
                    {formatPercentage(dashboardData.kpis?.ordersGrowth)}
                  </small>
                </div>
              </div>
              <h3 className="mb-1">{dashboardData.kpis?.totalOrders || 0}</h3>
              <p className="text-muted mb-0">Total de Pedidos</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="dashboard-card text-center">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <People className="dashboard-card-icon text-info" size={24} />
                <div className="d-flex align-items-center">
                  {getGrowthIcon(dashboardData.kpis?.customersGrowth)}
                  <small className="ms-1 text-muted">
                    {formatPercentage(dashboardData.kpis?.customersGrowth)}
                  </small>
                </div>
              </div>
              <h3 className="mb-1">{dashboardData.kpis?.totalCustomers || 0}</h3>
              <p className="text-muted mb-0">Clientes Ativos</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="dashboard-card text-center">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <GraphUp className="dashboard-card-icon text-warning" size={24} />
                <div className="d-flex align-items-center">
                  {getGrowthIcon(dashboardData.kpis?.aovGrowth)}
                  <small className="ms-1 text-muted">
                    {formatPercentage(dashboardData.kpis?.aovGrowth)}
                  </small>
                </div>
              </div>
              <h3 className="mb-1">{formatCurrency(dashboardData.kpis?.averageOrderValue || 0)}</h3>
              <p className="text-muted mb-0">Ticket Médio</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Produtos Mais Vendidos */}
        <Col lg={6} className="mb-4">
          <Card className="dashboard-card">
            <Card.Header className="dashboard-card-header">
              <h6 className="dashboard-card-title">Produtos Mais Vendidos</h6>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Vendas</th>
                      <th>Receita</th>
                      <th>Crescimento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(dashboardData.topProducts || []).map(product => (
                      <tr key={product.id}>
                        <td>
                          <div className="fw-bold">{product.name}</div>
                        </td>
                        <td>{product.sales}</td>
                        <td>{formatCurrency(product.revenue)}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            {getGrowthIcon(product.growth)}
                            <span className="ms-1">{formatPercentage(product.growth)}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Pedidos Recentes */}
        <Col lg={6} className="mb-4">
          <Card className="dashboard-card">
            <Card.Header className="dashboard-card-header">
              <h6 className="dashboard-card-title">Pedidos Recentes</h6>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Pedido</th>
                      <th>Cliente</th>
                      <th>Valor</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(dashboardData.recentOrders || []).map(order => (
                      <tr key={order.id}>
                        <td>
                          <div className="fw-bold">{order.id}</div>
                          <small className="text-muted">{order.date}</small>
                        </td>
                        <td>{order.customer}</td>
                        <td>{formatCurrency(order.value)}</td>
                        <td>{getStatusBadge(order.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Segmentação de Clientes */}
        <Col lg={6} className="mb-4">
          <Card className="dashboard-card">
            <Card.Header className="dashboard-card-header">
              <h6 className="dashboard-card-title">Segmentação de Clientes</h6>
            </Card.Header>
            <Card.Body>
              {(dashboardData.customerSegments || []).map(segment => (
                <div key={segment.segment} className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold">{segment.segment}</span>
                    <span className="text-muted">{segment.count} clientes ({segment.percentage}%)</span>
                  </div>
                  <ProgressBar 
                    now={segment.percentage} 
                    variant={segment.segment === 'VIP' ? 'danger' : segment.segment === 'Recorrentes' ? 'success' : 'info'}
                    className="mb-1"
                  />
                  <small className="text-muted">{formatCurrency(segment.revenue)} em receita</small>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>

        {/* Saúde do Sistema */}
        <Col lg={6} className="mb-4">
          <Card className="dashboard-card">
            <Card.Header className="dashboard-card-header">
              <h6 className="dashboard-card-title">Saúde do Sistema</h6>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span>Uptime</span>
                  <span className="fw-bold">{dashboardData.systemHealth?.uptime || 0}%</span>
                </div>
                <ProgressBar 
                  now={dashboardData.systemHealth?.uptime || 0} 
                  variant={(dashboardData.systemHealth?.uptime || 0) > 99 ? 'success' : 'warning'}
                />
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span>Tempo de Resposta</span>
                  <span className="fw-bold">{dashboardData.systemHealth?.responseTime || 0}ms</span>
                </div>
                <ProgressBar 
                  now={100 - ((dashboardData.systemHealth?.responseTime || 0) / 10)} 
                  variant={(dashboardData.systemHealth?.responseTime || 0) < 300 ? 'success' : 'warning'}
                />
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span>Taxa de Erro</span>
                  <span className="fw-bold">{dashboardData.systemHealth?.errorRate || 0}%</span>
                </div>
                <ProgressBar 
                  now={(dashboardData.systemHealth?.errorRate || 0) * 10} 
                  variant={(dashboardData.systemHealth?.errorRate || 0) < 1 ? 'success' : 'danger'}
                />
              </div>
              
              <div className="d-flex justify-content-between align-items-center">
                <span>Usuários Ativos</span>
                <Badge bg="primary">{dashboardData.systemHealth?.activeUsers || 0}</Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ExecutiveDashboard;
