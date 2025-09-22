import React, { useEffect, useState } from 'react';
import { Card, Button, Table, Modal, Form, Row, Col, Toast, Spinner, Alert, Badge } from 'react-bootstrap';
import { Plus, Pencil, Trash } from 'react-bootstrap-icons';
import { getAllTecidos, createTecido, updateTecido, deleteTecido } from '../../services/api';
import { useServerConfig } from '../../contexts/ServerConfigContext';

const TecidosManagement = () => {
  const { isConnected, connectionStatus } = useServerConfig();
  const [tecidos, setTecidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ q: '', active: 'all', composition: 'all' });
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
  const [formData, setFormData] = useState({ name: '', description: '', gsm: '', composition: '', active: true });

  useEffect(() => {
    if (isConnected) loadTecidos();
  }, [isConnected]);

  const loadTecidos = async () => {
    try {
      setLoading(true);
      const res = await getAllTecidos();
      setTecidos(res.data || []);
    } catch (e) {
      console.error('Erro ao carregar tecidos:', e);
      setToast({ show: true, message: 'Erro ao carregar tecidos', variant: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const filteredTecidos = tecidos.filter((t) => {
    const text = filters.q.trim().toLowerCase();
    const matchText = !text || (t.name?.toLowerCase().includes(text) || t.description?.toLowerCase().includes(text));
    const matchActive = filters.active === 'all' || (filters.active === 'active' ? t.active : !t.active);
    const matchComp = filters.composition === 'all' || ((t.composition || '').toLowerCase().includes(filters.composition.toLowerCase()));
    return matchText && matchActive && matchComp;
  });

  const handleNew = () => {
    setEditingItem(null);
    setFormData({ name: '', description: '', gsm: '', composition: '', active: true });
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      description: item.description || '',
      gsm: item.gsm || '',
      composition: item.composition || '',
      active: item.active !== false
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este tecido?')) return;
    try {
      await deleteTecido(id);
      setToast({ show: true, message: 'Tecido excluído com sucesso!', variant: 'success' });
      loadTecidos();
    } catch (e) {
      console.error('Erro ao excluir tecido:', e);
      setToast({ show: true, message: 'Erro ao excluir tecido', variant: 'danger' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        description: formData.description || null,
        gsm: formData.gsm ? parseInt(formData.gsm, 10) : null,
        composition: formData.composition || null,
        active: !!formData.active
      };
      if (editingItem) {
        await updateTecido(editingItem.id, payload);
        setToast({ show: true, message: 'Tecido atualizado com sucesso!', variant: 'success' });
      } else {
        await createTecido(payload);
        setToast({ show: true, message: 'Tecido criado com sucesso!', variant: 'success' });
      }
      setShowModal(false);
      setEditingItem(null);
      setFormData({ name: '', description: '', gsm: '', composition: '', active: true });
      loadTecidos();
    } catch (e) {
      console.error('Erro ao salvar tecido:', e);
      const msg = e?.response?.data?.detail || 'Erro ao salvar tecido';
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
        <p className="mt-2">Carregando tecidos...</p>
      </div>
    );
  }

  return (
    <>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Tecidos</h5>
          <Button variant="primary" onClick={handleNew}>
            <Plus size={16} className="me-2" />
            Novo Tecido
          </Button>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={5}>
              <Form.Control
                placeholder="Buscar por nome/descrição..."
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              />
            </Col>
            <Col md={3}>
              <Form.Select value={filters.active} onChange={(e) => setFilters({ ...filters, active: e.target.value })}>
                <option value="all">Todos (ativos e inativos)</option>
                <option value="active">Apenas ativos</option>
                <option value="inactive">Apenas inativos</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Control
                placeholder="Filtrar por composição (ex.: poliéster)"
                value={filters.composition === 'all' ? '' : filters.composition}
                onChange={(e) => setFilters({ ...filters, composition: e.target.value || 'all' })}
              />
            </Col>
          </Row>
          {tecidos.length === 0 ? (
            <Alert variant="info" className="text-center">Nenhum tecido cadastrado.</Alert>
          ) : (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Descrição</th>
                  <th>GSM</th>
                  <th>Composição</th>
                  <th>Status</th>
                  <th className="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredTecidos.map((t) => (
                  <tr key={t.id}>
                    <td>{t.name}</td>
                    <td>{t.description || '-'}</td>
                    <td>{t.gsm || '-'}</td>
                    <td>{t.composition || '-'}</td>
                    <td>{t.active ? <Badge bg="primary">Ativo</Badge> : <Badge bg="secondary">Inativo</Badge>}</td>
                    <td className="text-end">
                      <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEdit(t)}>
                        <Pencil size={14} />
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDelete(t.id)}>
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
          <Modal.Title>{editingItem ? 'Editar Tecido' : 'Novo Tecido'}</Modal.Title>
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
                    placeholder="Ex.: Oxford, Algodão, Tactel"
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
                  <Form.Label>GSM (gramatura)</Form.Label>
                  <Form.Control
                    type="number"
                    inputMode="numeric"
                    value={formData.gsm}
                    onChange={(e) => setFormData({ ...formData, gsm: e.target.value })}
                    placeholder="Ex.: 180"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Composição</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.composition}
                    onChange={(e) => setFormData({ ...formData, composition: e.target.value })}
                    placeholder="Ex.: 100% poliéster"
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Check
                  type="switch"
                  id="tecido-active"
                  label="Ativo"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
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

export default TecidosManagement;


