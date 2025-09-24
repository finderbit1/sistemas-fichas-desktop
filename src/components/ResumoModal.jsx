import React from 'react';
import { Modal, Button, Card, Row, Col, Badge, Table } from 'react-bootstrap';
import { 
  Person, 
  Calendar, 
  GeoAlt, 
  Phone, 
  FileText, 
  Truck, 
  CurrencyDollar,
  Eye,
  CheckCircle,
  X
} from 'react-bootstrap-icons';

function ResumoModal({ show, onHide, formData = {} }) {
  // Debug: verificar dados recebidos
  console.log('ResumoModal - formData recebido:', formData);
  console.log('ResumoModal - items:', formData.items);
  
  // Função segura para converter valores
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
    if (formData?.items && Array.isArray(formData.items) && formData.items.length > 0) {
      return formData.items.reduce((total, item) => {
        const valor = converterValor(item?.valor);
        return total + (isNaN(valor) ? 0 : valor);
      }, 0);
    }
    return 0;
  };

  const valorTotal = calcularValorTotal();
  
  const valorFrete = converterValor(formData?.valorFrete);
  const valorFinal = valorTotal + valorFrete;

  const formatarValor = (valor) => {
    return valor.toFixed(2).replace('.', ',');
  };

  const getTipoProducaoIcon = (tipo) => {
    switch (tipo) {
      case 'painel': return '🖼️';
      case 'totem': return '🏗️';
      case 'lona': return '🎪';
      case 'bolsinha': return '🎒';
      default: return '📦';
    }
  };

  const getTipoProducaoNome = (tipo) => {
    switch (tipo) {
      case 'painel': return 'Painel';
      case 'totem': return 'Totem';
      case 'lona': return 'Lona';
      case 'bolsinha': return 'Bolsinha';
      default: return 'Produção';
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title className="d-flex align-items-center">
          <Eye size={20} className="me-2" />
          Resumo do Pedido #{formData.numeroPedido}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {/* Informações do Cliente */}
        <Card className="mb-4">
          <Card.Header className="bg-light">
            <h6 className="mb-0 d-flex align-items-center">
              <Person size={16} className="me-2" />
              Informações do Cliente
            </h6>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <div className="mb-2">
                  <strong>Nome:</strong> {formData.nomeCliente || 'Não informado'}
                </div>
                <div className="mb-2">
                  <strong>Telefone:</strong> {formData.telefoneCliente || 'Não informado'}
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-2">
                  <strong>Cidade:</strong> {formData.cidadeCliente || 'Não informado'}
                </div>
                <div className="mb-2">
                  <strong>Prioridade:</strong> 
                  <Badge bg={formData.prioridade === '2' ? 'danger' : 'success'} className="ms-2">
                    {formData.prioridade === '2' ? 'Alta' : 'Normal'}
                  </Badge>
                </div>
                <div className="mb-2">
                  <strong>Forma de Envio:</strong> {formData.formaEnvio || formData.forma_envio || 'Não informado'}
                </div>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <div className="mb-2">
                  <strong>Data de Entrada:</strong> {formData.dataEntrada || 'Não informado'}
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-2">
                  <strong>Data de Entrega:</strong> {formData.dataEntrega || 'Não informado'}
                </div>
                <div className="mb-2">
                  <strong>Forma de Pagamento:</strong> {formData.tipoPagamentoNome || formData.tipoPagamento || formData.tipo_pagamento || 'Não informado'}
                </div>
              </Col>
            </Row>
            {formData.observacao && (
              <div className="mt-3">
                <strong>Observações:</strong>
                <p className="mt-1 text-muted">{formData.observacao}</p>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Itens de Produção */}
        <Card className="mb-4">
          <Card.Header className="bg-light">
            <h6 className="mb-0 d-flex align-items-center">
              <FileText size={16} className="me-2" />
              Itens de Produção ({formData.items?.length || 0})
            </h6>
          </Card.Header>
          <Card.Body>
            {formData.items && formData.items.length > 0 ? (
              <div className="row">
                {formData.items.map((item, index) => {
                  console.log(`ResumoModal - Item ${index}:`, item);
                  return (
                  <div key={index} className="col-md-6 mb-3">
                    <Card className="h-100 border">
                      <Card.Header className="bg-primary text-white py-2">
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <span className="me-2 fs-5">{getTipoProducaoIcon(item.tipoProducao)}</span>
                            <strong>{getTipoProducaoNome(item.tipoProducao)} #{index + 1}</strong>
                          </div>
                          <Badge bg="light" text="dark" className="fs-6">
                            R$ {formatarValor(converterValor(item?.valor))}
                          </Badge>
                        </div>
                      </Card.Header>
                      <Card.Body className="p-3">
                        <div className="mb-2">
                          <strong>Descrição:</strong>
                          <p className="mb-1">{item.descricao || 'Sem descrição'}</p>
                        </div>

                        {/* Resumo de Valores Detalhado */}
                        <div className="mb-2">
                          <strong>Resumo de Valores:</strong>
                          <div className="mt-1">
                            {(item.valorPainel || item.valorAlmofada || item.valorLona || item.valorTotem || item.valorBolsinha) && (
                              <div className="d-flex justify-content-between">
                                <span>Valor Base:</span>
                                <span>R$ {item.valorPainel || item.valorAlmofada || item.valorLona || item.valorTotem || item.valorBolsinha}</span>
                              </div>
                            )}
                            {item.valorAdicionais && parseFloat(item.valorAdicionais.replace(',', '.')) > 0 && (
                              <div className="d-flex justify-content-between">
                                <span>Valores Adicionais:</span>
                                <span className="text-success">R$ {item.valorAdicionais}</span>
                              </div>
                            )}
                            <hr className="my-1" />
                            <div className="d-flex justify-content-between fw-bold">
                              <span>Total:</span>
                              <span className="text-primary">R$ {formatarValor(converterValor(item?.valor))}</span>
                            </div>
                          </div>
                        </div>
                        
                        {item.imagem && (
                          <div className="mb-3">
                            <strong>Imagem:</strong>
                            <div className="mt-2">
                              <img 
                                src={item.imagem} 
                                alt={`Imagem do item ${item.descricao || 'item'}`}
                                style={{
                                  maxWidth: '100%',
                                  maxHeight: '200px',
                                  objectFit: 'cover',
                                  borderRadius: '8px',
                                  border: '2px solid #dee2e6',
                                  cursor: 'pointer',
                                  transition: 'transform 0.2s ease'
                                }}
                                onClick={() => {
                                  // Abrir imagem em nova aba
                                  window.open(item.imagem, '_blank');
                                }}
                                onMouseOver={(e) => {
                                  e.target.style.transform = 'scale(1.02)';
                                }}
                                onMouseOut={(e) => {
                                  e.target.style.transform = 'scale(1)';
                                }}
                                title="Clique para ampliar"
                              />
                            </div>
                          </div>
                        )}
                        
                        {(item.largura || item.altura) && (
                          <div className="mb-2">
                            <strong>Dimensões:</strong>
                            <p className="mb-1">
                              {item.largura && item.altura 
                                ? `${item.largura} x ${item.altura} cm`
                                : `${item.largura || item.altura} cm`
                              }
                            </p>
                          </div>
                        )}

                        {item.vendedor && (
                          <div className="mb-2">
                            <strong>Vendedor:</strong>
                            <span className="ms-2">{item.vendedor}</span>
                          </div>
                        )}

                        {item.designer && (
                          <div className="mb-2">
                            <strong>Designer:</strong>
                            <span className="ms-2">{item.designer}</span>
                          </div>
                        )}

                        {item.material && (
                          <div className="mb-2">
                            <strong>Material:</strong>
                            <span className="ms-2">{item.material}</span>
                          </div>
                        )}


                        {item.tecido && (
                          <div className="mb-2">
                            <strong>Tecido:</strong>
                            <span className="ms-2">{item.tecido}</span>
                          </div>
                        )}

                        {/* Acabamentos específicos */}
                        {item.acabamento && (
                          <div className="mb-2">
                            <strong>Acabamentos:</strong>
                            <div className="mt-1">
                              {Object.entries(item.acabamento).map(([key, value]) => 
                                value && (
                                  <Badge key={key} bg="secondary" className="me-1">
                                    {key === 'overloque' ? 'Overloque' :
                                     key === 'elastico' ? 'Elástico' :
                                     key === 'ilhos' ? 'Ilhós' :
                                     key === 'solda' ? 'Solda' :
                                     key === 'bastao' ? 'Bastão' :
                                     key === 'corteReto' ? 'Corte Reto' :
                                     key === 'vinco' ? 'Vinco' :
                                     key === 'baseMadeira' ? 'Base Madeira' :
                                     key.charAt(0).toUpperCase() + key.slice(1)}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {/* Configurações específicas do Painel */}
                        {item.tipoProducao === 'painel' && (
                          <div className="mb-2">
                            {item.emenda && (
                              <div className="mb-1">
                                <strong>Tipo de Emenda:</strong>
                                <span className="ms-1">
                                  {item.emenda === 'sem-emenda' ? 'Sem emenda' :
                                   item.emenda === 'vertical' ? 'Vertical' :
                                   item.emenda === 'horizontal' ? 'Horizontal' : item.emenda}
                                </span>
                              </div>
                            )}
                            {item.acabamento?.ilhos && (
                              <div className="mb-1">
                                <strong>Ilhós:</strong>
                                <div className="mt-1">
                                  {item.ilhosQtd && (
                                    <span className="me-2">Qtd: {item.ilhosQtd}</span>
                                  )}
                                  {item.ilhosValorUnitario && (
                                    <span className="me-2">Valor: R$ {item.ilhosValorUnitario}</span>
                                  )}
                                  {item.ilhosDistancia && (
                                    <span>Distância: {item.ilhosDistancia}cm</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Configurações específicas do Totem */}
                        {item.tipoProducao === 'totem' && (
                          <div className="mb-2">
                            {item.material && (
                              <div className="mb-1">
                                <strong>Material:</strong>
                                <span className="ms-1">{item.material}</span>
                              </div>
                            )}
                            {item.comPe && (
                              <div className="mb-1">
                                <strong>Acabamento:</strong>
                                <span className="ms-1">
                                  {item.comPe === 'com' ? 'Com Pé' : 
                                   item.comPe === 'sem' ? 'Sem Pé' :
                                   item.comPe === 'base' ? 'Com Base' : 'Sem Acabamento'}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Configurações específicas da Almofada */}
                        {item.tipoProducao === 'almofada' && (
                          <div className="mb-2">
                            <div className="row">
                              {item.quantidade && (
                                <div className="col-6">
                                  <strong>Quantidade:</strong>
                                  <span className="ms-1">{item.quantidade}</span>
                                </div>
                              )}
                              {item.enchimento && (
                                <div className="col-6">
                                  <strong>Enchimento:</strong>
                                  <span className="ms-1">{item.enchimento === 'com' ? 'Com enchimento' : 'Sem enchimento'}</span>
                                </div>
                              )}
                              {item.legenda && (
                                <div className="col-12">
                                  <strong>Legenda da Imagem:</strong>
                                  <span className="ms-1">{item.legenda}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Configurações específicas da Bolsinha */}
                        {item.tipoProducao === 'bolsinha' && (
                          <div className="mb-2">
                            <div className="row">
                              {item.tipo && (
                                <div className="col-6">
                                  <strong>Tipo:</strong>
                                  <span className="ms-1">{item.tipo}</span>
                                </div>
                              )}
                              {item.tamanho && (
                                <div className="col-6">
                                  <strong>Tamanho:</strong>
                                  <span className="ms-1">{item.tamanho}</span>
                                </div>
                              )}
                              {item.cor && (
                                <div className="col-6">
                                  <strong>Cor:</strong>
                                  <span className="ms-1">{item.cor}</span>
                                </div>
                              )}
                              {item.fecho && (
                                <div className="col-6">
                                  <strong>Fecho:</strong>
                                  <span className="ms-1">{item.fecho}</span>
                                </div>
                              )}
                              {item.alcaAjustavel && (
                                <div className="col-12">
                                  <strong>Alça Ajustável:</strong>
                                  <Badge bg="success" className="ms-1">Sim</Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {item.observacao && (
                          <div className="mb-2">
                            <strong>Observações:</strong>
                            <p className="mb-1 text-muted small">{item.observacao}</p>
                          </div>
                        )}

                        {item.imagem && (
                          <div className="mb-2">
                            <strong>Imagem:</strong>
                            <span className="ms-2 text-success">✓ Anexada</span>
                          </div>
                        )}

                        {/* Debug: Mostrar todos os dados disponíveis */}
                        {process.env.NODE_ENV === 'development' && (
                          <div className="mb-2 mt-3 p-2" style={{ backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '4px' }}>
                            <strong className="text-muted">Debug - Todos os dados:</strong>
                            <pre className="mb-0 small text-muted" style={{ fontSize: '10px', maxHeight: '100px', overflow: 'auto' }}>
                              {JSON.stringify(item, null, 2)}
                            </pre>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-muted py-4">
                <FileText size={48} className="mb-2" />
                <p>Nenhum item de produção adicionado</p>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Informações Financeiras */}
        <Card className="mb-4">
          <Card.Header className="bg-light">
            <h6 className="mb-0 d-flex align-items-center">
              <CurrencyDollar size={16} className="me-2" />
              Informações Financeiras
            </h6>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal dos Itens:</span>
                  <strong>R$ {formatarValor(valorTotal)}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Valor do Frete:</span>
                  <strong>R$ {formatarValor(valorFrete)}</strong>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-2">
                  <span><strong>Total Final:</strong></span>
                  <strong className="text-success fs-5">R$ {formatarValor(valorFinal)}</strong>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-2">
                  <strong>Tipo de Pagamento:</strong> 
                  <span className="ms-2">
                    {formData.tipoPagamento || 'Não informado'}
                  </span>
                </div>
                {formData.obsPagamento && (
                  <div className="mb-2">
                    <strong>Obs. Pagamento:</strong>
                    <p className="mt-1 text-muted">{formData.obsPagamento}</p>
                  </div>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Resumo de Validação */}
        <Card>
          <Card.Header className="bg-light">
            <h6 className="mb-0 d-flex align-items-center">
              <CheckCircle size={16} className="me-2" />
              Status do Pedido
            </h6>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <div className="mb-2">
                  <strong>Cliente:</strong> 
                  <Badge bg={formData.nomeCliente ? 'success' : 'warning'} className="ms-2">
                    {formData.nomeCliente ? 'Completo' : 'Incompleto'}
                  </Badge>
                </div>
                <div className="mb-2">
                  <strong>Datas:</strong> 
                  <Badge bg={formData.dataEntrada && formData.dataEntrega ? 'success' : 'warning'} className="ms-2">
                    {formData.dataEntrada && formData.dataEntrega ? 'Completo' : 'Incompleto'}
                  </Badge>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-2">
                  <strong>Itens:</strong> 
                  <Badge bg={formData.items && formData.items.length > 0 ? 'success' : 'warning'} className="ms-2">
                    {formData.items && formData.items.length > 0 ? `${formData.items.length} item(s)` : 'Nenhum'}
                  </Badge>
                </div>
                <div className="mb-2">
                  <strong>Valor:</strong> 
                  <Badge bg={valorTotal > 0 ? 'success' : 'warning'} className="ms-2">
                    {valorTotal > 0 ? 'Definido' : 'Não definido'}
                  </Badge>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Modal.Body>
      
      <Modal.Footer>
        <Button 
          variant="secondary" 
          onClick={onHide}
          className="btn btn-outline"
        >
          <X size={16} className="me-2" />
          Fechar
        </Button>
        <Button 
          variant="primary" 
          onClick={onHide}
          className="btn btn-primary"
        >
          <CheckCircle size={16} className="me-2" />
          Entendi
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ResumoModal;
