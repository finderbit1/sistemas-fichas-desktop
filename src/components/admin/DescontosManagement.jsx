import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Row, Col, Toast, Spinner, Alert, Badge } from 'react-bootstrap';
import { Plus, Pencil, Trash, Percent, Calculator } from 'react-bootstrap-icons';
import { 
  getAllDescontos, 
  createDesconto, 
  updateDesconto, 
  deleteDesconto 
} from '../../services/api';

const DescontosManagement = () => {
  const [descontos, setDescontos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ 
    nivel: 1, 
    percentual: 5, 
    valor_minimo: 0, 
    descricao: '' 
  });
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

  useEffect(() => {
    loadDescontos();
  }, []);

  const loadDescontos = async () => {
    try {
      setLoading(true);
      const response = await getAllDescontos();
      setDescontos(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar descontos:', error);
      setToast({ show: true, message: 'Erro ao carregar descontos', variant: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        nivel: parseInt(formData.nivel),
        percentual: parseFloat(formData.percentual),
        valor_minimo: parseFloat(formData.valor_minimo),
        descricao: formData.descricao
      };

      if (editingItem) {
        await updateDesconto(editingItem.id, data);
        setToast({ show: true, message: 'Desconto atualizado com sucesso!', variant: 'success' });
      } else {
        await createDesconto(data);
        setToast({ show: true, message: 'Desconto criado com sucesso!', variant: 'success' });
      }

      setShowModal(false);
      setFormData({ nivel: 1, percentual: 5, valor_minimo: 0, descricao: '' });
      setEditingItem(null);
      loadDescontos();
    } catch (error) {
      console.error('Erro ao salvar desconto:', error);
      setToast({ show: true, message: 'Erro ao salvar desconto', variant: 'danger' });
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ 
      nivel: item.nivel, 
      percentual: item.percentual, 
      valor_minimo: item.valor_minimo, 
      descricao: item.descricao 
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este desconto?')) {
      try {
        await deleteDesconto(id);
        setToast({ show: true, message: 'Desconto excluído com sucesso!', variant: 'success' });
        loadDescontos();
      } catch (error) {
        console.error('Erro ao excluir desconto:', error);
        setToast({ show: true, message: 'Erro ao excluir desconto', variant: 'danger' });
      }
    }
  };

  const handleNew = () => {
    setEditingItem(null);
    setFormData({ nivel: 1, percentual: 5, valor_minimo: 0, descricao: '' });
    setShowModal(true);
  };

  const getNivelColor = (nivel) => {
    const colors = ['primary', 'success', 'warning', 'info', 'danger'];
    return colors[(nivel - 1) % colors.length];
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Carregando descontos...</p>
      </div>
    );
  }

  return (
    <>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Sistema de Descontos</h5>
          <Button variant="primary" onClick={handleNew}>
            <Plus size={16} className="me-2" />
            Novo Desconto
          </Button>
        </Card.Header>
        <Card.Body>
          {descontos.length === 0 ? (
            <Alert variant="info" className="text-center">
              Nenhum desconto cadastrado.
            </Alert>
          ) : (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Nível</th>
                  <th>Percentual</th>
                  <th>Valor Mínimo</th>
                  <th>Descrição</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {descontos.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <Badge bg={getNivelColor(item.nivel)}>
                        Nível {item.nivel}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Percent size={16} className="me-2 text-muted" />
                        <strong>{item.percentual}%</strong>
                      </div>
                    </td>
                    <td>
                      <strong>R$ {item.valor_minimo.toFixed(2)}</strong>
                    </td>
                    <td>{item.descricao}</td>
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
            {editingItem ? 'Editar Desconto' : 'Novo Desconto'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nível do Desconto</Form.Label>
                  <Form.Select
                    value={formData.nivel}
                    onChange={(e) => setFormData({ ...formData, nivel: e.target.value })}
                    required
                  >
                    <option value={1}>Nível 1 (5%)</option>
                    <option value={2}>Nível 2 (10%)</option>
                    <option value={3}>Nível 3 (15%)</option>
                    <option value={4}>Nível 4 (20%)</option>
                    <option value={5}>Nível 5 (25%)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Percentual de Desconto (%)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.percentual}
                    onChange={(e) => setFormData({ ...formData, percentual: e.target.value })}
                    placeholder="Ex: 5.00"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Valor Mínimo (R$)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valor_minimo}
                    onChange={(e) => setFormData({ ...formData, valor_minimo: e.target.value })}
                    placeholder="Ex: 100.00"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Descrição</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Ex: Desconto para pedidos acima de R$ 100"
                    required
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

export default DescontosManagement;
