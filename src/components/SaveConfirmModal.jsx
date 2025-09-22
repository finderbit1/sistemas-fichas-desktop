import React from 'react';
import { Modal, Button, Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { 
  Save, 
  CheckCircle, 
  ExclamationTriangle,
  X,
  FileText,
  CurrencyDollar
} from 'react-bootstrap-icons';

function SaveConfirmModal({ 
  show, 
  onHide, 
  onConfirm, 
  isSaving, 
  formData = {}, 
  validationErrors = [] 
}) {
  // Verificação de segurança para evitar erros
  if (!formData || typeof formData !== 'object') {
    formData = {};
  }

  // Função utilitária para converter valores de forma segura
  const converterValor = (valor) => {
    try {
      if (!valor && valor !== 0) return 0;
      if (typeof valor === 'number') return valor;
      const normalizado = String(valor).replace(/\./g, '').replace(',', '.');
      const num = parseFloat(normalizado);
      return isNaN(num) ? 0 : num;
    } catch (error) {
      console.error('Erro ao converter valor:', error);
      return 0;
    }
  };

  const calcularValorTotal = () => {
    try {
      if (formData?.items && Array.isArray(formData.items) && formData.items.length > 0) {
        return formData.items.reduce((total, item) => {
          const valor = converterValor(item?.valor);
          return total + (isNaN(valor) ? 0 : valor);
        }, 0);
      }
      return 0;
    } catch (error) {
      console.error('Erro ao calcular valor total:', error);
      return 0;
    }
  };

  const valorTotal = calcularValorTotal();
  const valorFrete = converterValor(formData?.valorFrete);
  const valorFinal = valorTotal + valorFrete;

  const formatarValor = (valor) => {
    if (isNaN(valor) || valor === null || valor === undefined) {
      return '0,00';
    }
    return valor.toFixed(2).replace('.', ',');
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title className="d-flex align-items-center">
          <Save size={20} className="me-2" />
          {isSaving ? 'Salvando Pedido...' : 'Confirmar Salvamento'}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {isSaving ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <h5>Salvando pedido...</h5>
            <p className="text-muted">Aguarde enquanto processamos seu pedido.</p>
          </div>
        ) : (
          <>
            {validationErrors.length > 0 ? (
              <Alert variant="danger">
                <Alert.Heading className="d-flex align-items-center">
                  <ExclamationTriangle size={20} className="me-2" />
                  Erros de Validação
                </Alert.Heading>
                <ul className="mb-0">
                  {validationErrors.map((erro, index) => (
                    <li key={index}>{erro}</li>
                  ))}
                </ul>
              </Alert>
            ) : (
              <>
                <Alert variant="success">
                  <Alert.Heading className="d-flex align-items-center">
                    <CheckCircle size={20} className="me-2" />
                    Pedido Pronto para Salvar
                  </Alert.Heading>
                  <p className="mb-0">Todos os campos obrigatórios foram preenchidos corretamente.</p>
                </Alert>

                <Card className="mt-3">
                  <Card.Header className="bg-light">
                    <h6 className="mb-0 d-flex align-items-center">
                      <FileText size={16} className="me-2" />
                      Resumo do Pedido #{formData?.numeroPedido || 'N/A'}
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <div className="mb-2">
                          <strong>Cliente:</strong> {formData?.nomeCliente || 'Não informado'}
                        </div>
                        <div className="mb-2">
                          <strong>Telefone:</strong> {formData?.telefoneCliente || 'Não informado'}
                        </div>
                        <div className="mb-2">
                          <strong>Data de Entrega:</strong> {formData?.dataEntrega || 'Não informado'}
                        </div>
                        <div className="mb-2">
                          <strong>Forma de Envio:</strong> {formData?.formaEnvio || formData?.forma_envio || 'Não informado'}
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-2">
                          <strong>Itens de Produção:</strong> {formData.items?.length || 0}
                        </div>
                        <div className="mb-2">
                          <strong>Forma de Pagamento:</strong> {formData?.tipoPagamentoNome || formData?.tipoPagamento || formData?.tipo_pagamento || 'Não informado'}
                        </div>
                        <div className="mb-2">
                          <strong>Subtotal:</strong> R$ {formatarValor(valorTotal)}
                        </div>
                        <div className="mb-2">
                          <strong>Frete:</strong> R$ {formatarValor(valorFrete)}
                        </div>
                        <div className="mb-2">
                          <strong className="text-success">Total Final:</strong> R$ {formatarValor(valorFinal)}
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                <div className="mt-3">
                  <p className="text-muted">
                    <strong>Confirmação:</strong> Ao clicar em "Salvar Pedido", o pedido será enviado 
                    para processamento e não poderá ser editado posteriormente.
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </Modal.Body>
      
      <Modal.Footer>
        <Button 
          variant="secondary" 
          onClick={onHide}
          disabled={isSaving}
          className="btn btn-outline"
        >
          <X size={16} className="me-2" />
          {isSaving ? 'Aguarde...' : 'Cancelar'}
        </Button>
        {validationErrors.length === 0 && (
          <Button 
            variant="success" 
            onClick={onConfirm}
            disabled={isSaving}
            className="btn btn-success"
          >
            {isSaving ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Salvando...
              </>
            ) : (
              <>
                <Save size={16} className="me-2" />
                Salvar Pedido
              </>
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

export default SaveConfirmModal;
