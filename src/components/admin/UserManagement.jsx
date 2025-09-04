import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Table, 
  Modal, 
  Form, 
  Row, 
  Col, 
  Badge, 
  Alert,
  Dropdown,
  ButtonGroup
} from 'react-bootstrap';
import { 
  PersonPlus, 
  Pencil, 
  Trash, 
  Eye, 
  EyeSlash, 
  Key, 
  Shield, 
  ThreeDotsVertical,
  CheckCircle,
  XCircle,
  Clock
} from 'react-bootstrap-icons';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([
    { id: 'admin', name: 'Administrador', description: 'Acesso total ao sistema', color: 'danger' },
    { id: 'manager', name: 'Gerente', description: 'Acesso a relatórios e gestão', color: 'warning' },
    { id: 'user', name: 'Usuário', description: 'Acesso básico ao sistema', color: 'primary' },
    { id: 'viewer', name: 'Visualizador', description: 'Apenas visualização', color: 'info' }
  ]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Mock data - substituir por API real
  useEffect(() => {
    const mockUsers = [
      {
        id: 1,
        name: 'João Silva',
        email: 'joao@exemplo.com',
        username: 'joao.silva',
        role: 'admin',
        status: 'active',
        lastLogin: '2024-01-15 10:30:00',
        createdAt: '2024-01-01 08:00:00',
        permissions: ['all']
      },
      {
        id: 2,
        name: 'Maria Santos',
        email: 'maria@exemplo.com',
        username: 'maria.santos',
        role: 'manager',
        status: 'active',
        lastLogin: '2024-01-15 09:15:00',
        createdAt: '2024-01-05 14:20:00',
        permissions: ['reports', 'users', 'settings']
      },
      {
        id: 3,
        name: 'Pedro Costa',
        email: 'pedro@exemplo.com',
        username: 'pedro.costa',
        role: 'user',
        status: 'inactive',
        lastLogin: '2024-01-10 16:45:00',
        createdAt: '2024-01-08 11:30:00',
        permissions: ['orders', 'clients']
      }
    ];
    setUsers(mockUsers);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    role: 'user',
    status: 'active',
    permissions: []
  });

  const permissionOptions = [
    { id: 'all', name: 'Todos os acessos', description: 'Acesso completo ao sistema' },
    { id: 'users', name: 'Gestão de Usuários', description: 'Criar, editar e excluir usuários' },
    { id: 'reports', name: 'Relatórios', description: 'Visualizar e gerar relatórios' },
    { id: 'settings', name: 'Configurações', description: 'Alterar configurações do sistema' },
    { id: 'orders', name: 'Pedidos', description: 'Gerenciar pedidos' },
    { id: 'clients', name: 'Clientes', description: 'Gerenciar clientes' },
    { id: 'products', name: 'Produtos', description: 'Gerenciar produtos' },
    { id: 'financial', name: 'Financeiro', description: 'Acesso a dados financeiros' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? 
        (checked ? [...prev.permissions, value] : prev.permissions.filter(p => p !== value)) :
        value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (editingUser) {
        // Atualizar usuário
        setUsers(prev => prev.map(user => 
          user.id === editingUser.id ? { ...user, ...formData } : user
        ));
        setSuccess('Usuário atualizado com sucesso!');
      } else {
        // Criar novo usuário
        const newUser = {
          id: Date.now(),
          ...formData,
          lastLogin: null,
          createdAt: new Date().toLocaleString()
        };
        setUsers(prev => [...prev, newUser]);
        setSuccess('Usuário criado com sucesso!');
      }

      setShowModal(false);
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        username: '',
        role: 'user',
        status: 'active',
        permissions: []
      });
    } catch (err) {
      setError('Erro ao salvar usuário: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      status: user.status,
      permissions: user.permissions
    });
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        setUsers(prev => prev.filter(user => user.id !== userId));
        setSuccess('Usuário excluído com sucesso!');
      } catch (err) {
        setError('Erro ao excluir usuário: ' + err.message);
      }
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' } : user
      ));
      setSuccess('Status do usuário alterado com sucesso!');
    } catch (err) {
      setError('Erro ao alterar status: ' + err.message);
    }
  };

  const handleResetPassword = async (userId) => {
    if (window.confirm('Tem certeza que deseja resetar a senha deste usuário?')) {
      try {
        // Simular reset de senha
        setSuccess('Senha resetada com sucesso! Nova senha enviada por email.');
      } catch (err) {
        setError('Erro ao resetar senha: ' + err.message);
      }
    }
  };

  const getRoleInfo = (roleId) => {
    return roles.find(role => role.id === roleId) || roles[0];
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge bg="success"><CheckCircle size={12} /> Ativo</Badge>;
      case 'inactive':
        return <Badge bg="secondary"><XCircle size={12} /> Inativo</Badge>;
      case 'pending':
        return <Badge bg="warning"><Clock size={12} /> Pendente</Badge>;
      default:
        return <Badge bg="secondary">Desconhecido</Badge>;
    }
  };

  const getPermissionBadges = (permissions) => {
    if (permissions.includes('all')) {
      return <Badge bg="danger">Todos os Acessos</Badge>;
    }
    return permissions.map(permission => {
      const perm = permissionOptions.find(p => p.id === permission);
      return perm ? <Badge key={permission} bg="primary" className="me-1">{perm.name}</Badge> : null;
    });
  };

  return (
    <div className="user-management">
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
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="dashboard-card-title">
              <Shield className="dashboard-card-icon" />
              Gestão de Usuários
            </h5>
            <Button 
              variant="primary" 
              onClick={() => setShowModal(true)}
              className="d-flex align-items-center gap-2"
            >
              <PersonPlus size={16} />
              Novo Usuário
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>Email</th>
                  <th>Função</th>
                  <th>Status</th>
                  <th>Permissões</th>
                  <th>Último Login</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => {
                  const roleInfo = getRoleInfo(user.role);
                  return (
                    <tr key={user.id}>
                      <td>
                        <div>
                          <div className="fw-bold">{user.name}</div>
                          <small className="text-muted">@{user.username}</small>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <Badge bg={roleInfo.color}>{roleInfo.name}</Badge>
                      </td>
                      <td>{getStatusBadge(user.status)}</td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {getPermissionBadges(user.permissions)}
                        </div>
                      </td>
                      <td>
                        {user.lastLogin ? (
                          <small className="text-muted">{user.lastLogin}</small>
                        ) : (
                          <small className="text-muted">Nunca</small>
                        )}
                      </td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle variant="outline-secondary" size="sm">
                            <ThreeDotsVertical size={16} />
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleEdit(user)}>
                              <Pencil size={14} className="me-2" />
                              Editar
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleToggleStatus(user.id)}>
                              {user.status === 'active' ? (
                                <>
                                  <EyeSlash size={14} className="me-2" />
                                  Desativar
                                </>
                              ) : (
                                <>
                                  <Eye size={14} className="me-2" />
                                  Ativar
                                </>
                              )}
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleResetPassword(user.id)}>
                              <Key size={14} className="me-2" />
                              Resetar Senha
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item 
                              onClick={() => handleDelete(user.id)}
                              className="text-danger"
                            >
                              <Trash size={14} className="me-2" />
                              Excluir
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Modal de Criação/Edição */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nome Completo *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Digite o nome completo"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Digite o email"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Username *</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    placeholder="Digite o username"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Função *</Form.Label>
                  <Form.Select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>
                        {role.name} - {role.description}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                    <option value="pending">Pendente</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Permissões</Form.Label>
              <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {permissionOptions.map(permission => (
                  <Form.Check
                    key={permission.id}
                    type="checkbox"
                    id={`permission-${permission.id}`}
                    name="permissions"
                    value={permission.id}
                    checked={formData.permissions.includes(permission.id)}
                    onChange={handleInputChange}
                    label={
                      <div>
                        <div className="fw-bold">{permission.name}</div>
                        <small className="text-muted">{permission.description}</small>
                      </div>
                    }
                    className="mb-2"
                  />
                ))}
              </div>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Salvando...' : (editingUser ? 'Atualizar' : 'Criar')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
