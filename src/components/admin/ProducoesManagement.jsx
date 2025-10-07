import React, { useEffect, useState } from 'react';
import { Card, Button, Modal, Form, Row, Col, Toast, Spinner, Alert, Badge } from 'react-bootstrap';
import { Plus, Pencil, Trash } from 'react-bootstrap-icons';
import { 
  getAllTiposProducao,
  createTipoProducao,
  updateTipoProducao,
  deleteTipoProducao
} from '../../services/api';
import { useServerConfig } from '../../contexts/ServerConfigContext';
import AdvancedTable from '../AdvancedTable';
import '../../styles/advanced-table.css';

const ProducoesManagement = () => {
  const { isConnected, connectionStatus } = useServerConfig();
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ q: '', active: 'all', uses_fabric: 'all' });
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
  const [formData, setFormData] = useState({ name: '', description: '', uses_fabric: false, active: true });

  useEffect(() => {
    if (isConnected) {
      loadTipos();
    }
  }, [isConnected]);

  const loadTipos = async () => {
    try {
      setLoading(true);
      const res = await getAllTiposProducao();
      setTipos(res.data || []);
    } catch (e) {
      console.error('Erro ao carregar tipos de produção:', e);
      setToast({ show: true, message: 'Erro ao carregar tipos de produção', variant: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  // Configuração das colunas para a tabela avançada
  const columns = [
    {
      key: 'name',
      header: 'Nome',
      sortable: true,
      filterable: true,
      render: (item) => (
        <div className="fw-medium">{item.name}</div>
      )
    },
    {
      key: 'description',
      header: 'Descrição',
      sortable: true,
      filterable: true,
      render: (item) => (
        <div className="text-muted">{item.description || '-'}</div>
      )
    },
    {
      key: 'uses_fabric',
      header: 'Usa Tecido',
      sortable: true,
      filterable: true,
      render: (item) => (
        item.uses_fabric ? 
          <Badge bg="success">Sim</Badge> : 
          <Badge bg="secondary">Não</Badge>
      )
    },
    {
      key: 'active',
      header: 'Status',
      sortable: true,
      filterable: true,
      render: (item) => (
        item.active ? 
          <Badge bg="success">Ativo</Badge> : 
          <Badge bg="secondary">Inativo</Badge>
      )
    },
    {
      key: 'actions',
      header: 'Ações',
      sortable: false,
      filterable: false,
      render: (item) => (
        <div className="d-flex gap-1">
          <Button 
            variant="outline-primary" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(item);
            }}
            title="Editar tipo de produção"
          >
            <Pencil size={14} />
          </Button>
          <Button 
            variant="outline-danger" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(item.id);
            }}
            title="Excluir tipo de produção"
          >
            <Trash size={14} />
          </Button>
        </div>
      )
    }
  ];

  const handleNew = () => {
    setEditingItem(null);
    setFormData({ name: '', description: '', uses_fabric: false, active: true });
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      description: item.description || '',
      uses_fabric: !!item.uses_fabric,
      active: item.active !== false
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este tipo?')) return;
    try {
      await deleteTipoProducao(id);
      setToast({ show: true, message: 'Tipo excluído com sucesso!', variant: 'success' });
      loadTipos();
    } catch (e) {
      console.error('Erro ao excluir tipo:', e);
      setToast({ show: true, message: 'Erro ao excluir tipo', variant: 'danger' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (editingItem) {
        await updateTipoProducao(editingItem.id, payload);
        setToast({ show: true, message: 'Tipo atualizado com sucesso!', variant: 'success' });
      } else {
        await createTipoProducao(payload);
        setToast({ show: true, message: 'Tipo criado com sucesso!', variant: 'success' });
      }
      setShowModal(false);
      setEditingItem(null);
      setFormData({ name: '', description: '', uses_fabric: false, active: true });
      loadTipos();
    } catch (e) {
      console.error('Erro ao salvar tipo:', e);
      const msg = e?.response?.data?.detail || 'Erro ao salvar tipo de produção';
      setToast({ show: true, message: msg, variant: 'danger' });
    }
  };

  if (connectionStatus === 'checking') {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Verificando conexão com a API...</p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="text-center p-4">
        <Alert variant="danger">
          <strong>Erro de Conexão</strong>
          <p className="mt-2">Não foi possível conectar com a API. Verifique se o servidor está rodando.</p>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Carregando tipos de produção...</p>
      </div>
    );
  }

  return (
    <>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Tipos de Produção</h5>
          <Button variant="primary" onClick={handleNew}>
            <Plus size={16} className="me-2" />
            Novo Tipo
          </Button>
        </Card.Header>
        <Card.Body>
          <AdvancedTable
            data={tipos}
            columns={columns}
            loading={loading}
            showPagination={true}
            showSearch={true}
            showFilters={true}
            showSelection={false}
            pageSize={10}
            emptyMessage="Nenhum tipo de produção cadastrado"
            onRowClick={(item) => handleEdit(item)}
            className="mt-3"
          />
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="md">
        <Modal.Header closeButton>
          <Modal.Title>{editingItem ? 'Editar Tipo de Produção' : 'Novo Tipo de Produção'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Nome</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex.: Painel, Almofada, Bandeira"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Descrição (opcional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Breve descrição"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="uses-fabric"
                    label="Usa tecido"
                    checked={formData.uses_fabric}
                    onChange={(e) => setFormData({ ...formData, uses_fabric: e.target.checked })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="active"
                    label="Ativo"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button variant="primary" type="submit">{editingItem ? 'Atualizar' : 'Criar'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Toast
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        delay={3000}
        autohide
        style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}
      >
        <Toast.Header>
          <strong className="me-auto">{toast.variant === 'success' ? 'Sucesso' : 'Erro'}</strong>
        </Toast.Header>
        <Toast.Body>{toast.message}</Toast.Body>
      </Toast>
    </>
  );
};

export default ProducoesManagement;


