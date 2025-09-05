import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Row, Col, Toast, Spinner, Alert } from 'react-bootstrap';
import { Plus, Pencil, Trash, Check, X } from 'react-bootstrap-icons';
import { 
  getAllFormasEnvios, 
  createFormaEnvio, 
  updateFormaEnvio, 
  deleteFormaEnvio 
} from '../../services/api';

const FormasEnvioManagement = () => {
  const [formasEnvio, setFormasEnvio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', value: '' });
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

  useEffect(() => {
    loadFormasEnvio();
  }, []);

  const loadFormasEnvio = async () => {
    try {
      setLoading(true);
      const response = await getAllFormasEnvios();
      setFormasEnvio(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar formas de envio:', error);
      setToast({ show: true, message: 'Erro ao carregar formas de envio', variant: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        name: formData.name,
        value: formData.value ? parseFloat(formData.value) : null
      };

      if (editingItem) {
        await updateFormaEnvio(editingItem.id, data);
        setToast({ show: true, message: 'Forma de envio atualizada com sucesso!', variant: 'success' });
      } else {
        await createFormaEnvio(data);
        setToast({ show: true, message: 'Forma de envio criada com sucesso!', variant: 'success' });
      }

      setShowModal(false);
      setFormData({ name: '', value: '' });
      setEditingItem(null);
      loadFormasEnvio();
    } catch (error) {
      console.error('Erro ao salvar forma de envio:', error);
      setToast({ show: true, message: 'Erro ao salvar forma de envio', variant: 'danger' });
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ name: item.name, value: item.value || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta forma de envio?')) {
      try {
        await deleteFormaEnvio(id);
        setToast({ show: true, message: 'Forma de envio excluída com sucesso!', variant: 'success' });
        loadFormasEnvio();
      } catch (error) {
        console.error('Erro ao excluir forma de envio:', error);
        setToast({ show: true, message: 'Erro ao excluir forma de envio', variant: 'danger' });
      }
    }
  };

  const handleNew = () => {
    setEditingItem(null);
    setFormData({ name: '', value: '' });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Carregando formas de envio...</p>
      </div>
    );
  }

  return (
    <>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Formas de Envio</h5>
          <Button variant="primary" onClick={handleNew}>
            <Plus size={16} className="me-2" />
            Nova Forma de Envio
          </Button>
        </Card.Header>
        <Card.Body>
          {formasEnvio.length === 0 ? (
            <Alert variant="info" className="text-center">
              Nenhuma forma de envio cadastrada.
            </Alert>
          ) : (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Valor</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {formasEnvio.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>
                      {item.value ? `R$ ${item.value.toFixed(2)}` : 'Sem valor'}
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

      <Modal show={showModal} onHide={() => setShowModal(false)} size="md">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingItem ? 'Editar Forma de Envio' : 'Nova Forma de Envio'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Nome da Forma de Envio</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Sedex, PAC, Transportadora"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Valor (opcional)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="Ex: 15.50"
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

export default FormasEnvioManagement;
