import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Tabs, 
  Tab, 
  Form, 
  Row, 
  Col, 
  Button, 
  Alert,
  InputGroup,
  Table,
  Badge
} from 'react-bootstrap';
import { 
  Gear, 
  Building, 
  Server, 
  Envelope, 
  CreditCard, 
  Box, 
  Save,
  CheckCircle,
  XCircle,
  ArrowClockwise
} from 'react-bootstrap-icons';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    company: {
      name: 'Sistema de Fichas',
      email: 'contato@sistemafichas.com',
      phone: '(11) 99999-9999',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      cnpj: '12.345.678/0001-90',
      logo: null
    },
    api: {
      baseUrl: 'http://localhost:3001/api',
      timeout: 5000,
      retries: 3,
      rateLimit: 1000,
      enableCaching: true,
      cacheTimeout: 300
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: 'sistema@sistemafichas.com',
      smtpPassword: '',
      enableTLS: true,
      fromName: 'Sistema de Fichas',
      fromEmail: 'noreply@sistemafichas.com'
    },
    financial: {
      currency: 'BRL',
      taxRate: 0.18,
      profitMargin: 0.30,
      paymentMethods: ['credit_card', 'pix', 'boleto', 'transfer'],
      installmentLimit: 12,
      lateFeeRate: 0.02
    },
    inventory: {
      lowStockThreshold: 10,
      autoReorder: true,
      reorderQuantity: 50,
      enableBarcode: true,
      enableSerialNumbers: false,
      defaultCategory: 'Geral'
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      orderNotifications: true,
      paymentNotifications: true,
      lowStockNotifications: true,
      systemAlerts: true
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [databaseStatus, setDatabaseStatus] = useState('');
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('company');

  // Mock data - substituir por API real
  useEffect(() => {
    // Carregar configurações do localStorage ou API
    const savedSettings = localStorage.getItem('systemSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleArrayChange = (section, field, value, index) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section][field].map((item, i) => i === index ? value : item)
      }
    }));
  };

  const handleAddArrayItem = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: [...prev[section][field], value]
      }
    }));
  };

  const handleRemoveArrayItem = (section, field, index) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section][field].filter((_, i) => i !== index)
      }
    }));
  };

  const handleSave = async (section) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Salvar no localStorage
      localStorage.setItem('systemSettings', JSON.stringify(settings));
      
      setSuccess(`Configurações de ${section} salvas com sucesso!`);
    } catch (err) {
      setError(`Erro ao salvar configurações: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (type) => {
    setLoading(true);
    try {
      // Simular teste de conexão
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess(`Conexão ${type} testada com sucesso!`);
    } catch (err) {
      setError(`Erro ao testar conexão ${type}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Funções para gerenciamento do banco de dados
  const handleRecreatePedidosTable = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const { recriarTabelaPedidos } = await import('../../services/api-tauri');
      const result = await recriarTabelaPedidos();
      setSuccess(result.data);
      setDatabaseStatus('');
    } catch (err) {
      setError(`Erro ao recriar tabela pedidos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckDatabaseStatus = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const { verificarStatusBanco } = await import('../../services/api-tauri');
      const result = await verificarStatusBanco();
      setDatabaseStatus(result.data);
    } catch (err) {
      setError(`Erro ao verificar status do banco: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const paymentMethodOptions = [
    { value: 'credit_card', label: 'Cartão de Crédito' },
    { value: 'debit_card', label: 'Cartão de Débito' },
    { value: 'pix', label: 'PIX' },
    { value: 'boleto', label: 'Boleto Bancário' },
    { value: 'transfer', label: 'Transferência Bancária' },
    { value: 'cash', label: 'Dinheiro' },
    { value: 'check', label: 'Cheque' }
  ];

  return (
    <div className="system-settings">
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Card className="dashboard-card mb-4">
        <Card.Header className="dashboard-card-header">
          <h5 className="dashboard-card-title">
            <Gear className="dashboard-card-icon" />
            Configurações do Sistema
          </h5>
        </Card.Header>
        <Card.Body>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-4"
          >
            {/* Configurações da Empresa */}
            <Tab eventKey="company" title={
              <div className="d-flex align-items-center gap-2">
                <Building size={16} />
                Empresa
              </div>
            }>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nome da Empresa *</Form.Label>
                    <Form.Control
                      type="text"
                      value={settings.company.name}
                      onChange={(e) => handleInputChange('company', 'name', e.target.value)}
                      placeholder="Digite o nome da empresa"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email *</Form.Label>
                    <Form.Control
                      type="email"
                      value={settings.company.email}
                      onChange={(e) => handleInputChange('company', 'email', e.target.value)}
                      placeholder="Digite o email da empresa"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Telefone</Form.Label>
                    <Form.Control
                      type="tel"
                      value={settings.company.phone}
                      onChange={(e) => handleInputChange('company', 'phone', e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>CNPJ</Form.Label>
                    <Form.Control
                      type="text"
                      value={settings.company.cnpj}
                      onChange={(e) => handleInputChange('company', 'cnpj', e.target.value)}
                      placeholder="12.345.678/0001-90"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label>Endereço</Form.Label>
                    <Form.Control
                      type="text"
                      value={settings.company.address}
                      onChange={(e) => handleInputChange('company', 'address', e.target.value)}
                      placeholder="Rua, número, complemento"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>CEP</Form.Label>
                    <Form.Control
                      type="text"
                      value={settings.company.zipCode}
                      onChange={(e) => handleInputChange('company', 'zipCode', e.target.value)}
                      placeholder="01234-567"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Cidade</Form.Label>
                    <Form.Control
                      type="text"
                      value={settings.company.city}
                      onChange={(e) => handleInputChange('company', 'city', e.target.value)}
                      placeholder="São Paulo"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Estado</Form.Label>
                    <Form.Control
                      type="text"
                      value={settings.company.state}
                      onChange={(e) => handleInputChange('company', 'state', e.target.value)}
                      placeholder="SP"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Button 
                variant="primary" 
                onClick={() => handleSave('empresa')}
                disabled={loading}
              >
                <Save size={16} className="me-2" />
                {loading ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </Tab>

            {/* Configurações de API */}
            <Tab eventKey="api" title={
              <div className="d-flex align-items-center gap-2">
                <Server size={16} />
                API
              </div>
            }>
              <Row>
                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label>URL Base da API *</Form.Label>
                    <Form.Control
                      type="url"
                      value={settings.api.baseUrl}
                      onChange={(e) => handleInputChange('api', 'baseUrl', e.target.value)}
                      placeholder="http://localhost:3001/api"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Timeout (ms)</Form.Label>
                    <Form.Control
                      type="number"
                      value={settings.api.timeout}
                      onChange={(e) => handleInputChange('api', 'timeout', parseInt(e.target.value))}
                      min="1000"
                      max="30000"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tentativas de Retry</Form.Label>
                    <Form.Control
                      type="number"
                      value={settings.api.retries}
                      onChange={(e) => handleInputChange('api', 'retries', parseInt(e.target.value))}
                      min="0"
                      max="10"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Rate Limit (req/min)</Form.Label>
                    <Form.Control
                      type="number"
                      value={settings.api.rateLimit}
                      onChange={(e) => handleInputChange('api', 'rateLimit', parseInt(e.target.value))}
                      min="100"
                      max="10000"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Cache Timeout (s)</Form.Label>
                    <Form.Control
                      type="number"
                      value={settings.api.cacheTimeout}
                      onChange={(e) => handleInputChange('api', 'cacheTimeout', parseInt(e.target.value))}
                      min="60"
                      max="3600"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Check
                    type="checkbox"
                    id="enableCaching"
                    label="Habilitar Cache"
                    checked={settings.api.enableCaching}
                    onChange={(e) => handleInputChange('api', 'enableCaching', e.target.checked)}
                  />
                </Col>
              </Row>

              <div className="d-flex gap-2">
                <Button 
                  variant="primary" 
                  onClick={() => handleSave('API')}
                  disabled={loading}
                >
                  <Save size={16} className="me-2" />
                  {loading ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
                <Button 
                  variant="outline-primary" 
                  onClick={() => handleTestConnection('API')}
                  disabled={loading}
                >
                  <ArrowClockwise size={16} className="me-2" />
                  Testar Conexão
                </Button>
              </div>
            </Tab>

            {/* Configurações de Email */}
            <Tab eventKey="email" title={
              <div className="d-flex align-items-center gap-2">
                <Envelope size={16} />
                Email
              </div>
            }>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>SMTP Host *</Form.Label>
                    <Form.Control
                      type="text"
                      value={settings.email.smtpHost}
                      onChange={(e) => handleInputChange('email', 'smtpHost', e.target.value)}
                      placeholder="smtp.gmail.com"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>SMTP Port *</Form.Label>
                    <Form.Control
                      type="number"
                      value={settings.email.smtpPort}
                      onChange={(e) => handleInputChange('email', 'smtpPort', parseInt(e.target.value))}
                      placeholder="587"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Usuário SMTP *</Form.Label>
                    <Form.Control
                      type="email"
                      value={settings.email.smtpUser}
                      onChange={(e) => handleInputChange('email', 'smtpUser', e.target.value)}
                      placeholder="sistema@sistemafichas.com"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Senha SMTP *</Form.Label>
                    <Form.Control
                      type="password"
                      value={settings.email.smtpPassword}
                      onChange={(e) => handleInputChange('email', 'smtpPassword', e.target.value)}
                      placeholder="Digite a senha"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nome do Remetente</Form.Label>
                    <Form.Control
                      type="text"
                      value={settings.email.fromName}
                      onChange={(e) => handleInputChange('email', 'fromName', e.target.value)}
                      placeholder="Sistema de Fichas"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email do Remetente</Form.Label>
                    <Form.Control
                      type="email"
                      value={settings.email.fromEmail}
                      onChange={(e) => handleInputChange('email', 'fromEmail', e.target.value)}
                      placeholder="noreply@sistemafichas.com"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Check
                    type="checkbox"
                    id="enableTLS"
                    label="Habilitar TLS"
                    checked={settings.email.enableTLS}
                    onChange={(e) => handleInputChange('email', 'enableTLS', e.target.checked)}
                  />
                </Col>
              </Row>

              <div className="d-flex gap-2">
                <Button 
                  variant="primary" 
                  onClick={() => handleSave('email')}
                  disabled={loading}
                >
                  <Save size={16} className="me-2" />
                  {loading ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
                <Button 
                  variant="outline-primary" 
                  onClick={() => handleTestConnection('Email')}
                  disabled={loading}
                >
                  <ArrowClockwise size={16} className="me-2" />
                  Testar Conexão
                </Button>
              </div>
            </Tab>

            {/* Configurações Financeiras */}
            <Tab eventKey="financial" title={
              <div className="d-flex align-items-center gap-2">
                <CreditCard size={16} />
                Financeiro
              </div>
            }>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Moeda Padrão</Form.Label>
                    <Form.Select
                      value={settings.financial.currency}
                      onChange={(e) => handleInputChange('financial', 'currency', e.target.value)}
                    >
                      <option value="BRL">Real (BRL)</option>
                      <option value="USD">Dólar (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Taxa de Imposto (%)</Form.Label>
                    <Form.Control
                      type="number"
                      value={settings.financial.taxRate * 100}
                      onChange={(e) => handleInputChange('financial', 'taxRate', parseFloat(e.target.value) / 100)}
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Margem de Lucro (%)</Form.Label>
                    <Form.Control
                      type="number"
                      value={settings.financial.profitMargin * 100}
                      onChange={(e) => handleInputChange('financial', 'profitMargin', parseFloat(e.target.value) / 100)}
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Limite de Parcelas</Form.Label>
                    <Form.Control
                      type="number"
                      value={settings.financial.installmentLimit}
                      onChange={(e) => handleInputChange('financial', 'installmentLimit', parseInt(e.target.value))}
                      min="1"
                      max="24"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Taxa de Juros por Atraso (%)</Form.Label>
                    <Form.Control
                      type="number"
                      value={settings.financial.lateFeeRate * 100}
                      onChange={(e) => handleInputChange('financial', 'lateFeeRate', parseFloat(e.target.value) / 100)}
                      min="0"
                      max="10"
                      step="0.01"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Métodos de Pagamento</Form.Label>
                <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {paymentMethodOptions.map(method => (
                    <Form.Check
                      key={method.value}
                      type="checkbox"
                      id={`payment-${method.value}`}
                      label={method.label}
                      checked={settings.financial.paymentMethods.includes(method.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleAddArrayItem('financial', 'paymentMethods', method.value);
                        } else {
                          const index = settings.financial.paymentMethods.indexOf(method.value);
                          handleRemoveArrayItem('financial', 'paymentMethods', index);
                        }
                      }}
                    />
                  ))}
                </div>
              </Form.Group>

              <Button 
                variant="primary" 
                onClick={() => handleSave('financeiro')}
                disabled={loading}
              >
                <Save size={16} className="me-2" />
                {loading ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </Tab>

            {/* Configurações de Estoque */}
            <Tab eventKey="inventory" title={
              <div className="d-flex align-items-center gap-2">
                <Box size={16} />
                Estoque
              </div>
            }>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Limite de Estoque Baixo</Form.Label>
                    <Form.Control
                      type="number"
                      value={settings.inventory.lowStockThreshold}
                      onChange={(e) => handleInputChange('inventory', 'lowStockThreshold', parseInt(e.target.value))}
                      min="1"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Quantidade de Recompra</Form.Label>
                    <Form.Control
                      type="number"
                      value={settings.inventory.reorderQuantity}
                      onChange={(e) => handleInputChange('inventory', 'reorderQuantity', parseInt(e.target.value))}
                      min="1"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Categoria Padrão</Form.Label>
                    <Form.Control
                      type="text"
                      value={settings.inventory.defaultCategory}
                      onChange={(e) => handleInputChange('inventory', 'defaultCategory', e.target.value)}
                      placeholder="Geral"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <Form.Check
                    type="checkbox"
                    id="autoReorder"
                    label="Recompra Automática"
                    checked={settings.inventory.autoReorder}
                    onChange={(e) => handleInputChange('inventory', 'autoReorder', e.target.checked)}
                  />
                </Col>
                <Col md={4}>
                  <Form.Check
                    type="checkbox"
                    id="enableBarcode"
                    label="Habilitar Código de Barras"
                    checked={settings.inventory.enableBarcode}
                    onChange={(e) => handleInputChange('inventory', 'enableBarcode', e.target.checked)}
                  />
                </Col>
                <Col md={4}>
                  <Form.Check
                    type="checkbox"
                    id="enableSerialNumbers"
                    label="Habilitar Números de Série"
                    checked={settings.inventory.enableSerialNumbers}
                    onChange={(e) => handleInputChange('inventory', 'enableSerialNumbers', e.target.checked)}
                  />
                </Col>
              </Row>

              <Button 
                variant="primary" 
                onClick={() => handleSave('estoque')}
                disabled={loading}
              >
                <Save size={16} className="me-2" />
                {loading ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </Tab>

            {/* Configurações de Notificações */}
            <Tab eventKey="notifications" title={
              <div className="d-flex align-items-center gap-2">
                <Envelope size={16} />
                Notificações
              </div>
            }>
              <Row>
                <Col md={6}>
                  <h6>Tipos de Notificação</h6>
                  <Form.Check
                    type="checkbox"
                    id="emailEnabled"
                    label="Email"
                    checked={settings.notifications.emailEnabled}
                    onChange={(e) => handleInputChange('notifications', 'emailEnabled', e.target.checked)}
                  />
                  <Form.Check
                    type="checkbox"
                    id="smsEnabled"
                    label="SMS"
                    checked={settings.notifications.smsEnabled}
                    onChange={(e) => handleInputChange('notifications', 'smsEnabled', e.target.checked)}
                  />
                  <Form.Check
                    type="checkbox"
                    id="pushEnabled"
                    label="Push"
                    checked={settings.notifications.pushEnabled}
                    onChange={(e) => handleInputChange('notifications', 'pushEnabled', e.target.checked)}
                  />
                </Col>
                <Col md={6}>
                  <h6>Eventos de Notificação</h6>
                  <Form.Check
                    type="checkbox"
                    id="orderNotifications"
                    label="Novos Pedidos"
                    checked={settings.notifications.orderNotifications}
                    onChange={(e) => handleInputChange('notifications', 'orderNotifications', e.target.checked)}
                  />
                  <Form.Check
                    type="checkbox"
                    id="paymentNotifications"
                    label="Pagamentos"
                    checked={settings.notifications.paymentNotifications}
                    onChange={(e) => handleInputChange('notifications', 'paymentNotifications', e.target.checked)}
                  />
                  <Form.Check
                    type="checkbox"
                    id="lowStockNotifications"
                    label="Estoque Baixo"
                    checked={settings.notifications.lowStockNotifications}
                    onChange={(e) => handleInputChange('notifications', 'lowStockNotifications', e.target.checked)}
                  />
                  <Form.Check
                    type="checkbox"
                    id="systemAlerts"
                    label="Alertas do Sistema"
                    checked={settings.notifications.systemAlerts}
                    onChange={(e) => handleInputChange('notifications', 'systemAlerts', e.target.checked)}
                  />
                </Col>
              </Row>

              <Button 
                variant="primary" 
                onClick={() => handleSave('notificações')}
                disabled={loading}
              >
                <Save size={16} className="me-2" />
                {loading ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </Tab>

            <Tab eventKey="database" title={
              <span>
                <Server size={16} className="me-2" />
                Banco de Dados
              </span>
            }>
              <Row className="mb-4">
                <Col>
                  <h5>Gerenciamento do Banco de Dados</h5>
                  <p className="text-muted">
                    Ferramentas para gerenciar a estrutura e dados do banco de dados.
                  </p>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Card className="h-100">
                    <Card.Header>
                      <h6 className="mb-0">Recriar Tabela Pedidos</h6>
                    </Card.Header>
                    <Card.Body>
                      <p className="text-muted small">
                        Recria a tabela 'pedidos' com a estrutura atualizada para corrigir problemas de compatibilidade.
                      </p>
                      <Button 
                        variant="warning" 
                        onClick={handleRecreatePedidosTable}
                        disabled={loading}
                        className="w-100"
                      >
                        <ArrowClockwise size={16} className="me-2" />
                        {loading ? 'Recriando...' : 'Recriar Tabela Pedidos'}
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="h-100">
                    <Card.Header>
                      <h6 className="mb-0">Verificar Status</h6>
                    </Card.Header>
                    <Card.Body>
                      <p className="text-muted small">
                        Verifica o status atual do banco de dados e mostra informações sobre as tabelas.
                      </p>
                      <Button 
                        variant="info" 
                        onClick={handleCheckDatabaseStatus}
                        disabled={loading}
                        className="w-100"
                      >
                        <CheckCircle size={16} className="me-2" />
                        {loading ? 'Verificando...' : 'Verificar Status'}
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {databaseStatus && (
                <Row className="mb-3">
                  <Col>
                    <Alert variant="info">
                      <h6>Status do Banco de Dados:</h6>
                      <pre style={{ fontSize: '12px', margin: 0 }}>
                        {databaseStatus}
                      </pre>
                    </Alert>
                  </Col>
                </Row>
              )}
            </Tab>
        </Card.Body>
      </Card>
    </div>
  );
};

export default SystemSettings;
