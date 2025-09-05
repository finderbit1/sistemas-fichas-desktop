import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Row, Col, Toast, Spinner, Alert, Badge } from 'react-bootstrap';
import { Plus, Pencil, Trash, Person } from 'react-bootstrap-icons';
import { 
  getAllVendedores, 
  createVendedor, 
  updateVendedor, 
  deleteVendedor 
} from '../../services/api';

const VendedoresManagement = () => {
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    active: true 
  });
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

  useEffect(() => {
    loadVendedores();
  }, []);

  const loadVendedores = async () => {
    try {
      setLoading(true);
      const response = await getAllVendedores();
      setVendedores(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar vendedores:', error);
      setToast({ show: true, message: 'Erro ao carregar vendedores', variant: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        name: formData.name,
        active: formData.active
      };

      if (editingItem) {
        await updateVendedor(editingItem.id, data);
        setToast({ show: true, message: 'Vendedor atualizado com sucesso!', variant: 'success' });
      } else {
        await createVendedor(data);
        setToast({ show: true, message: 'Vendedor criado com sucesso!', variant: 'success' });
      }

      setShowModal(false);
      setFormData({ name: '', active: true });
      setEditingItem(null);
      loadVendedores();
    } catch (error) {
      console.error('Erro ao salvar vendedor:', error);
      setToast({ show: true, message: 'Erro ao salvar vendedor', variant: 'danger' });
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ 
      name: item.name, 
      active: item.active 
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este vendedor?')) {
      try {
        await deleteVendedor(id);
        setToast({ show: true, message: 'Vendedor excluído com sucesso!', variant: 'success' });
        loadVendedores();
      } catch (error) {
        console.error('Erro ao excluir vendedor:', error);
        setToast({ show: true, message: 'Erro ao excluir vendedor', variant: 'danger' });
      }
    }
  };

  const handleNew = () => {
    setEditingItem(null);
    setFormData({ name: '', active: true });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Carregando vendedores...</p>
      </div>
    );
  }

  return (
    <>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Vendedores</h5>
          <Button variant="primary" onClick={handleNew}>
            <Plus size={16} className="me-2" />
            Novo Vendedor
          </Button>
        </Card.Header>
        <Card.Body>
          {vendedores.length === 0 ? (
            <Alert variant="info" className="text-center">
              Nenhum vendedor cadastrado.
            </Alert>
          ) : (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {vendedores.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <Person size={16} className="me-2 text-muted" />
                        {item.name}
                      </div>
                    </td>
                    <td>
                      <Badge bg={item.active ? 'success' : 'secondary'}>
                        {item.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash size={14} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingItem ? 'Editar Vendedor' : 'Novo Vendedor'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Nome do Vendedor *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Maria Santos"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Vendedor ativo"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {editingItem ? 'Atualizar' : 'Criar'}
            </Button>
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
          <strong className="me-auto">
            {toast.variant === 'success' ? 'Sucesso' : 'Erro'}
          </strong>
        </Toast.Header>
        <Toast.Body>{toast.message}</Toast.Body>
      </Toast>
    </>
  );
};

export default VendedoresManagement;


