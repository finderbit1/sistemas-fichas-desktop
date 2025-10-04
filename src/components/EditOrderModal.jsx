import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { PencilSquare, Save, X } from 'react-bootstrap-icons';
import { updatePedido, deletePedido } from '../services/api';
import { salvarPedidoStorage, obterPedidos, removerPedidoStorage } from '../utils/localStorageHelper';
import { convertFormDataToRustPedidoUpdate, validateRustPedidoForApi } from '../utils/apiConverter';
import { validateOrderDates } from '../utils/dateValidator';
import logger from '../utils/logger';

export default function EditOrderModal({ 
  show, 
  onHide, 
  pedido, 
  onPedidoUpdated, 
  onPedidoDeleted,
  customAlert 
}) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (pedido) {
      setFormData({
        ...pedido,
        dataEntrada: pedido.dataEntrada ? pedido.dataEntrada.split('T')[0] : '',
        dataEntrega: pedido.dataEntrega ? pedido.dataEntrega.split('T')[0] : '',
      });
    }
  }, [pedido]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const erros = [];
    
    if (!formData.numeroPedido) erros.push("Número do pedido é obrigatório");
    if (!formData.nomeCliente) erros.push("Nome do cliente é obrigatório");
    if (!formData.telefoneCliente) erros.push("Telefone do cliente é obrigatório");
    if (!formData.cidadeCliente) erros.push("Cidade do cliente é obrigatória");
    if (!formData.dataEntrada) erros.push("Data de entrada é obrigatória");
    if (!formData.dataEntrega) erros.push("Data de entrega é obrigatória");
    
    // Validar datas
    if (formData.dataEntrada && formData.dataEntrega) {
      const dateValidation = validateOrderDates(formData.dataEntrada, formData.dataEntrega);
      if (!dateValidation.isValid) {
        erros.push(...dateValidation.errors);
      }
    }
    
    if (!formData.items || formData.items.length === 0) {
      erros.push("Pelo menos um item de produção deve ser adicionado");
    }
    
    return erros;
  };

  const handleSave = async () => {
    const erros = validateForm();
    if (erros.length > 0) {
      setErrors(erros);
      return;
    }

    setLoading(true);
    setErrors([]);

    try {
      // Converter para formato da API Rust (PedidoUpdate)
      const rustPedido = convertFormDataToRustPedidoUpdate(formData);
      
      // Validar para API Rust
      const validation = validateRustPedidoForApi(rustPedido);
      if (!validation.isValid) {
        setErrors(validation.errors);
        setLoading(false);
        return;
      }

      // Tentar salvar na API primeiro
      try {
        const response = await updatePedido(pedido.id, rustPedido);
        console.log('Pedido atualizado na API com sucesso:', response.data);
        
        // Atualizar no localStorage
        const pedidoAtualizado = {
          ...formData,
          id: pedido.id,
          ultimaAtualizacao: new Date().toISOString()
        };
        
        salvarPedidoStorage(pedidoAtualizado);
        
        // Log da edição
        const changes = Object.keys(formData).filter(key => 
          formData[key] !== pedido[key]
        );
        
        logger.logPedidoUpdated(pedido.id, changes, pedido, formData);
        
        // Notificar sucesso
        customAlert.showSuccess('Sucesso!', 'Pedido atualizado com sucesso!');
        
        onPedidoUpdated?.(pedidoAtualizado);
        onHide();
        
      } catch (apiError) {
        console.warn('Erro ao atualizar na API, atualizando localmente:', apiError);
        
        // Se a API falhou, atualizar apenas no localStorage
        const pedidoAtualizado = {
          ...formData,
          id: pedido.id,
          ultimaAtualizacao: new Date().toISOString()
        };
        
        salvarPedidoStorage(pedidoAtualizado);
        
        // Log da edição
        const changes = Object.keys(formData).filter(key => 
          formData[key] !== pedido[key]
        );
        
        logger.log('PEDIDO_UPDATED_LOCAL', {
          pedidoId: pedido.id,
          numeroPedido: formData.numeroPedido,
          changes,
          note: 'API indisponível - salvo localmente'
        }, 'warning');
        
        customAlert.showWarning('Aviso', 'Pedido atualizado localmente (API indisponível)');
        
        onPedidoUpdated?.(pedidoAtualizado);
        onHide();
      }
      
    } catch (error) {
      console.error('Erro ao atualizar pedido:', error);
      customAlert.showError('Erro', 'Erro ao atualizar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setErrors([]);

    try {
      // Tentar deletar na API primeiro
      try {
        await deletePedido(pedido.id);
        console.log('Pedido deletado da API com sucesso');
        
        // Remover do localStorage
        removerPedidoStorage(pedido.id);
        
        // Log da exclusão
        logger.logPedidoDeleted(pedido.id, formData);
        
        customAlert.showSuccess('Sucesso!', 'Pedido excluído com sucesso!');
        
        onPedidoDeleted?.(pedido.id);
        onHide();
        
      } catch (apiError) {
        console.warn('Erro ao deletar na API, removendo localmente:', apiError);
        
        // Se a API falhou, remover apenas do localStorage
        removerPedidoStorage(pedido.id);
        
        // Log da exclusão
        logger.log('PEDIDO_DELETED_LOCAL', {
          pedidoId: pedido.id,
          numeroPedido: formData.numeroPedido,
          note: 'API indisponível - removido localmente'
        }, 'warning');
        
        customAlert.showWarning('Aviso', 'Pedido removido localmente (API indisponível)');
        
        onPedidoDeleted?.(pedido.id);
        onHide();
      }
      
    } catch (error) {
      console.error('Erro ao excluir pedido:', error);
      customAlert.showError('Erro', 'Erro ao excluir pedido. Tente novamente.');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!pedido) return null;

  return (
    <>
      <Modal show={show} onHide={onHide} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <PencilSquare className="me-2" />
            Editar Pedido #{formData.numeroPedido}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          {errors.length > 0 && (
            <Alert variant="danger" className="mb-3">
              <strong>Erros encontrados:</strong>
              <ul className="mb-0 mt-2">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}
          
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Número do Pedido</Form.Label>
                  <Form.Control
                    type="text"
                    name="numeroPedido"
                    value={formData.numeroPedido || ''}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Prioridade</Form.Label>
                  <Form.Select
                    name="prioridade"
                    value={formData.prioridade || '1'}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="1">Normal</option>
                    <option value="2">Alta</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data de Entrada</Form.Label>
                  <Form.Control
                    type="date"
                    name="dataEntrada"
                    value={formData.dataEntrada || ''}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data de Entrega</Form.Label>
                  <Form.Control
                    type="date"
                    name="dataEntrega"
                    value={formData.dataEntrega || ''}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nome do Cliente</Form.Label>
                  <Form.Control
                    type="text"
                    name="nomeCliente"
                    value={formData.nomeCliente || ''}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Telefone</Form.Label>
                  <Form.Control
                    type="text"
                    name="telefoneCliente"
                    value={formData.telefoneCliente || ''}
                    onChange={handleChange}
                    disabled={loading}
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
                    name="cidadeCliente"
                    value={formData.cidadeCliente || ''}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Valor Total</Form.Label>
                  <Form.Control
                    type="text"
                    name="valorTotal"
                    value={formData.valorTotal || ''}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Observações</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="observacao"
                value={formData.observacao || ''}
                onChange={handleChange}
                disabled={loading}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        
        <Modal.Footer>
          <Button
            variant="danger"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={loading}
          >
            <X className="me-2" />
            Excluir
          </Button>
          <Button
            variant="secondary"
            onClick={onHide}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="me-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmação de exclusão */}
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Tem certeza que deseja excluir o pedido <strong>#{formData.numeroPedido}</strong>?</p>
          <p className="text-danger">
            <strong>Esta ação não pode ser desfeita!</strong>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteConfirm(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
                Excluindo...
              </>
            ) : (
              'Sim, Excluir'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
