import React, { useState } from 'react';
import { Card, Button, Row, Col, Table, Container, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    // Dados simulados
    const pedidos = [
        { numero: 'ORD-10001', cliente: 'João Silva', data: '2025-06-01', status: 'pendente', prioridade: false },
        { numero: 'ORD-10002', cliente: 'Maria Oliveira', data: '2025-06-02', status: 'concluído', prioridade: true },
        { numero: 'ORD-10003', cliente: 'Pedro Santos', data: '2025-06-03', status: 'pendente', prioridade: true },
        { numero: 'ORD-10004', cliente: 'Ana Lima', data: '2025-06-04', status: 'pendente', prioridade: false },
        { numero: 'ORD-10004', cliente: 'Ana Lima', data: '2025-06-04', status: 'pendente', prioridade: false },
    ];

    const totalPedidos = pedidos.length;
    const totalClientes = 5;
    const pendentes = pedidos.filter(p => p.status === 'pendente').length;
    const prioridades = pedidos.filter(p => p.prioridade).length;

    const [filtro, setFiltro] = useState('');

    const pedidosFiltrados = pedidos.filter(pedido =>
        pedido.cliente.toLowerCase().includes(filtro.toLowerCase()) ||
        pedido.numero.toLowerCase().includes(filtro.toLowerCase())
    );

    return (
        <Container className="mt-4">
            <h2 className="mb-4">Dashboard</h2>

            <Row className="mb-3">
                <Col md={3}>
                    <Card className="p-3 text-center shadow-sm">
                        <h6>Total de Pedidos</h6>
                        <h3>{totalPedidos}</h3>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="p-3 text-center shadow-sm">
                        <h6>Total de Clientes</h6>
                        <h3>{totalClientes}</h3>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="p-3 text-center shadow-sm bg-warning-subtle">
                        <h6>Pedidos Pendentes</h6>
                        <h3>{pendentes}</h3>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="p-3 text-center shadow-sm bg-danger-subtle">
                        <h6>Pedidos Prioritários</h6>
                        <h3>{prioridades}</h3>
                    </Card>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col md={6}>
                    <Form.Control
                        type="text"
                        placeholder="Buscar por número ou cliente..."
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                    />
                </Col>
            </Row>

            <Card className="shadow-sm">
                <Card.Body>
                    <h5 className="mb-3">Últimos Pedidos</h5>
                    <Table hover responsive>
                        <thead className="table-light">
                            <tr>
                                <th>#</th>
                                <th>Cliente</th>
                                <th>Data</th>
                                <th>Status</th>
                                <th>Prioridade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidosFiltrados.map((pedido, index) => (
                                <tr key={index}>
                                    <td>{pedido.numero}</td>
                                    <td>{pedido.cliente}</td>
                                    <td>{pedido.data}</td>
                                    <td>
                                        <span className={`badge bg-${pedido.status === 'pendente' ? 'warning' : 'success'}`}>
                                            {pedido.status}
                                        </span>
                                    </td>
                                    <td>
                                        {pedido.prioridade ? (
                                            <span className="badge bg-danger">Alta</span>
                                        ) : (
                                            <span className="badge bg-secondary">Normal</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Row className="mt-4">
                <Col md={3}>
                    <Button variant="primary" onClick={() => navigate('/orders')}>
                        Novo Pedido
                    </Button>
                </Col>
                <Col md={3}>
                    <Button variant="secondary" onClick={() => navigate('/clientes')}>
                        Cadastrar Cliente
                    </Button>
                </Col>
            </Row>
        </Container>
    );
};

export default Home;
