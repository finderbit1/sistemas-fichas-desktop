import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Row, Col, Toast, Spinner, Alert } from 'react-bootstrap';
import { Plus, Pencil, Trash, CreditCard } from 'react-bootstrap-icons';
import { useServerConfig } from '../../contexts/ServerConfigContext';
import { 
  getAllFormasPagamentos, 
  createFormaPagamento, 
  updateFormaPagamento, 
  deleteFormaPagamento 
} from '../../services/api';

const FormasPagamentoManagement = () => {
  const { isConnected, connectionStatus } = useServerConfig();
  const [formasPagamento, setFormasPagamento] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', value: '' });
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

  useEffect(() => {
    if (isConnected) {
      loadFormasPagamento();
    }
  }, [isConnected]);

  const loadFormasPagamento = async () => {
    try {
      setLoading(true);
      const response = await getAllFormasPagamentos();
      setFormasPagamento(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar formas de pagamento:', error);
      setToast({ show: true, message: 'Erro ao carregar formas de pagamento', variant: 'danger' });
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
        await updateFormaPagamento(editingItem.id, data);
        setToast({ show: true, message: 'Forma de pagamento atualizada com sucesso!', variant: 'success' });
      } else {
        await createFormaPagamento(data);
        setToast({ show: true, message: 'Forma de pagamento criada com sucesso!', variant: 'success' });
      }

      setShowModal(false);
      setFormData({ name: '', value: '' });
      setEditingItem(null);
      loadFormasPagamento();
    } catch (error) {
      console.error('Erro ao salvar forma de pagamento:', error);
      setToast({ show: true, message: 'Erro ao salvar forma de pagamento', variant: 'danger' });
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ name: item.name, value: item.value || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta forma de pagamento?')) {
      try {
        await deleteFormaPagamento(id);
        setToast({ show: true, message: 'Forma de pagamento excluída com sucesso!', variant: 'success' });
        loadFormasPagamento();
      } catch (error) {
        console.error('Erro ao excluir forma de pagamento:', error);
        setToast({ show: true, message: 'Erro ao excluir forma de pagamento', variant: 'danger' });
      }
    }
  };

  const handleNew = () => {
    setEditingItem(null);
    setFormData({ name: '', value: '' });
    setShowModal(true);
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
        <p className="mt-2">Carregando formas de pagamento...</p>
      </div>
    );
  }

  return (
    <>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Formas de Pagamento</h5>
          <Button variant="primary" onClick={handleNew}>
            <Plus size={16} className="me-2" />
            Nova Forma de Pagamento
          </Button>
        </Card.Header>
        <Card.Body>
          {formasPagamento.length === 0 ? (
            <Alert variant="info" className="text-center">
              Nenhuma forma de pagamento cadastrada.
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
                {formasPagamento.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <CreditCard size={16} className="me-2 text-muted" />
                        {item.name}
                      </div>
                    </td>
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
            {editingItem ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Nome da Forma de Pagamento</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: PIX, Cartão de Crédito, Boleto"
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
                    placeholder="Ex: 2.50 (taxa de processamento)"
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

export default FormasPagamentoManagement;

