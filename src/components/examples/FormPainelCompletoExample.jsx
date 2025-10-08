import React, { useState } from 'react';
import { Container, Card, Row, Col, Badge, Table } from 'react-bootstrap';
import FormPainelCompleto from '../prouctions/FormPainelCompleto';

/**
 * Exemplo de uso do FormPainelCompleto
 * Demonstra como integrar o formulário e processar os dados
 */
function FormPainelCompletoExample() {
    const [paineisCriados, setPaineisCriados] = useState([]);

    const handleAdicionarPainel = (dadosPainel) => {
        // Adicionar timestamp ao painel
        const painelComData = {
            ...dadosPainel,
            id: Date.now(),
            dataCriacao: new Date().toLocaleString('pt-BR')
        };
        
        setPaineisCriados(prev => [painelComData, ...prev]);
        
        console.log('✅ Painel criado com sucesso:', painelComData);
    };

    const calcularValorTotal = (painel) => {
        return painel.valor || '0,00';
    };

    const renderAcabamentos = (acabamento) => {
        const acabamentos = [];
        if (acabamento?.overloque) acabamentos.push('Overloque');
        if (acabamento?.elastico) acabamentos.push('Elástico');
        return acabamentos.length > 0 ? acabamentos.join(', ') : 'Nenhum';
    };

    const renderOpcoes = (painel) => {
        const opcoes = [];
        
        if (painel.opcoes?.ilhos) {
            opcoes.push(
                <Badge key="ilhos" bg="primary" className="me-1">
                    Ilhós: {painel.ilhosQtd} un. ({painel.ilhosEspaco}cm) - R$ {painel.ilhosValorUnitario} cada
                </Badge>
            );
        }
        
        if (painel.opcoes?.cordinha) {
            opcoes.push(
                <Badge key="cordinha" bg="success" className="me-1">
                    Cordinha: {painel.cordinhaQtd} un. ({painel.cordinhaEspaco}cm) - R$ {painel.cordinhaValorUnitario} cada
                </Badge>
            );
        }
        
        return opcoes.length > 0 ? opcoes : <span className="text-muted">Nenhuma</span>;
    };

    return (
        <Container fluid className="p-4">
            <Row className="mb-4">
                <Col>
                    <h2 className="mb-3">📋 Exemplo: Formulário de Painel Completo</h2>
                    <p className="text-muted">
                        Este exemplo demonstra o uso do <code>FormPainelCompleto</code> com todos os campos disponíveis.
                    </p>
                </Col>
            </Row>

            <Row>
                <Col lg={8}>
                    <Card className="dashboard-card mb-4">
                        <div className="dashboard-card-header">
                            <h5 className="dashboard-card-title">Criar Novo Painel</h5>
                        </div>
                        <div className="p-3">
                            <FormPainelCompleto onAdicionarItem={handleAdicionarPainel} />
                        </div>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="dashboard-card mb-4">
                        <div className="dashboard-card-header">
                            <h5 className="dashboard-card-title">
                                Painéis Criados 
                                <Badge bg="primary" className="ms-2">{paineisCriados.length}</Badge>
                            </h5>
                        </div>
                        <div className="p-3">
                            {paineisCriados.length === 0 ? (
                                <p className="text-muted text-center py-4">
                                    Nenhum painel criado ainda.
                                    <br />
                                    Preencha o formulário ao lado para começar.
                                </p>
                            ) : (
                                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                    {paineisCriados.map((painel, index) => (
                                        <Card key={painel.id} className="mb-3" style={{ border: '1px solid var(--color-neutral-200)' }}>
                                            <Card.Body>
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <h6 className="mb-0">{painel.descricao}</h6>
                                                    <Badge bg="secondary" style={{ fontSize: '0.7rem' }}>
                                                        #{index + 1}
                                                    </Badge>
                                                </div>
                                                
                                                <div className="mb-2" style={{ fontSize: '0.85rem' }}>
                                                    <div className="d-flex justify-content-between">
                                                        <span className="text-muted">Dimensões:</span>
                                                        <strong>{painel.largura}m × {painel.altura}m</strong>
                                                    </div>
                                                    <div className="d-flex justify-content-between">
                                                        <span className="text-muted">Área:</span>
                                                        <strong>{painel.area}m²</strong>
                                                    </div>
                                                    <div className="d-flex justify-content-between">
                                                        <span className="text-muted">Tecido:</span>
                                                        <strong>{painel.tecido}</strong>
                                                    </div>
                                                </div>

                                                <div className="mb-2" style={{ fontSize: '0.8rem' }}>
                                                    <div className="text-muted mb-1">Acabamentos:</div>
                                                    <div>{renderAcabamentos(painel.acabamento)}</div>
                                                </div>

                                                <div className="mb-2" style={{ fontSize: '0.8rem' }}>
                                                    <div className="text-muted mb-1">Opções:</div>
                                                    <div>{renderOpcoes(painel)}</div>
                                                </div>

                                                <div className="d-flex justify-content-between align-items-center mt-2 pt-2" style={{ borderTop: '1px solid var(--color-neutral-200)' }}>
                                                    <span style={{ fontSize: '0.85rem' }}>
                                                        <strong>Valor Total:</strong>
                                                    </span>
                                                    <span style={{ fontSize: '1.1rem', color: 'var(--color-success)', fontWeight: 'bold' }}>
                                                        R$ {calcularValorTotal(painel)}
                                                    </span>
                                                </div>

                                                <div className="mt-2" style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                                                    Criado em: {painel.dataCriacao}
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Card com informações de ajuda */}
                    <Card className="dashboard-card" style={{ background: 'var(--color-info-light)' }}>
                        <div className="p-3">
                            <h6 style={{ color: 'var(--color-info)' }}>💡 Dicas</h6>
                            <ul style={{ fontSize: '0.85rem', marginBottom: 0, paddingLeft: '1.2rem' }}>
                                <li>Preencha todos os campos obrigatórios</li>
                                <li>A área é calculada automaticamente</li>
                                <li>Você pode adicionar ilhós, cordinha ou ambos</li>
                                <li>O valor total inclui valores adicionais</li>
                                <li>Use drag-and-drop para a imagem</li>
                            </ul>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Tabela com detalhes completos (aparece quando há painéis criados) */}
            {paineisCriados.length > 0 && (
                <Row className="mt-4">
                    <Col>
                        <Card className="dashboard-card">
                            <div className="dashboard-card-header">
                                <h5 className="dashboard-card-title">📊 Detalhes Completos dos Painéis</h5>
                            </div>
                            <div className="p-3">
                                <Table striped bordered hover responsive>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Descrição</th>
                                            <th>Dimensões</th>
                                            <th>Vendedor</th>
                                            <th>Designer</th>
                                            <th>Tecido</th>
                                            <th>Acabamento</th>
                                            <th>Opções</th>
                                            <th>Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paineisCriados.map((painel, index) => (
                                            <tr key={painel.id}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    {painel.descricao}
                                                    {painel.observacao && (
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-neutral-500)' }}>
                                                            Obs: {painel.observacao}
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    {painel.largura}m × {painel.altura}m
                                                    <br />
                                                    <small className="text-muted">({painel.area}m²)</small>
                                                </td>
                                                <td>{painel.vendedor}</td>
                                                <td>{painel.designer}</td>
                                                <td>{painel.tecido}</td>
                                                <td style={{ fontSize: '0.85rem' }}>
                                                    {renderAcabamentos(painel.acabamento)}
                                                </td>
                                                <td>
                                                    {painel.opcoes?.ilhos && (
                                                        <div style={{ fontSize: '0.8rem' }}>
                                                            <strong>Ilhós:</strong> {painel.ilhosQtd} un.
                                                            <br />
                                                            Espaço: {painel.ilhosEspaco}cm
                                                            <br />
                                                            Valor: R$ {painel.ilhosValorUnitario}
                                                        </div>
                                                    )}
                                                    {painel.opcoes?.cordinha && (
                                                        <div style={{ fontSize: '0.8rem' }}>
                                                            <strong>Cordinha:</strong> {painel.cordinhaQtd} un.
                                                            <br />
                                                            Espaço: {painel.cordinhaEspaco}cm
                                                            <br />
                                                            Valor: R$ {painel.cordinhaValorUnitario}
                                                        </div>
                                                    )}
                                                    {!painel.opcoes?.ilhos && !painel.opcoes?.cordinha && (
                                                        <span className="text-muted">-</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <strong style={{ color: 'var(--color-success)' }}>
                                                        R$ {calcularValorTotal(painel)}
                                                    </strong>
                                                    {painel.valorAdicionais && (
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                                                            + adicional: R$ {painel.valorAdicionais}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </Card>
                    </Col>
                </Row>
            )}
        </Container>
    );
}

export default FormPainelCompletoExample;


