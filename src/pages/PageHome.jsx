import React, { useState, useEffect } from 'react';
import {
    Card,
    Button,
    Row,
    Col,
    Table,
    Container,
    Form,
    Toast,
    ToastContainer,
    Modal,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getAllPedidos } from '../services/api';


const Home = () => {
    const navigate = useNavigate();
    const [pedidos, setPedidos] = useState([]);
    const [erro, setErro] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '' });
    const [modal, setModal] = useState({ show: false, index: null, campo: '', pedido: null });
    const [previewModal, setPreviewModal] = useState({ show: false, pedido: null });
    const [filtro, setFiltro] = useState('');

    useEffect(() => {
        getAllPedidos()
            .then((res) => {
                const pedidosFormatados = res.data.map((pedido) => ({
                    ...pedido,
                    prioridade: pedido.prioridade === "ALTA", // transforma em booleano
                }));

                setPedidos(pedidosFormatados);
            })
            .catch((err) => {
                console.error(err);
                alert('Erro ao buscar pedidos da API');
            });
    }, []);


    const totalPedidos = pedidos.length;
    const pendentes = pedidos.filter(p => p.status === 'pendente').length;
    const prioridades = pedidos.filter(p => p.prioridade).length;

    const pedidosFiltrados = pedidos.filter(pedido =>
        pedido.cliente.toLowerCase().includes(filtro.toLowerCase()) ||
        pedido.numero.toLowerCase().includes(filtro.toLowerCase())
    );

    const toggleStatus = (index, campo) => {
        const pedido = pedidos[index];
        if (pedido[campo]) {
            setModal({ show: true, index, campo, pedido });
        } else {
            confirmarToggle(index, campo);
        }
    };

    const confirmarToggle = (index, campo) => {
        const novosPedidos = [...pedidos];
        const pedido = novosPedidos[index];
        pedido[campo] = !pedido[campo];
        setPedidos(novosPedidos);

        const status = pedido[campo] ? 'liberado' : 'removido';
        const label = campo.charAt(0).toUpperCase() + campo.slice(1);
        setToast({
            show: true,
            message: `Pedido ${pedido.numero} do cliente ${pedido.cliente} foi ${status} por ${label}`,
        });
    };

    const handleConfirm = () => {
        if (modal.index !== null && modal.campo) {
            confirmarToggle(modal.index, modal.campo);
        }
        setModal({ show: false, index: null, campo: '', pedido: null });
    };

    const handleCancel = () => {
        setModal({ show: false, index: null, campo: '', pedido: null });
    };

    return (
        <Container className="mt-4">
            <ToastContainer position="bottom-end" className="p-3">
                <Toast
                    bg="info"
                    onClose={() => setToast({ ...toast, show: false })}
                    show={toast.show}
                    delay={3000}
                    autohide
                >
                    <Toast.Body>{toast.message}</Toast.Body>
                </Toast>
            </ToastContainer>

            <Modal show={modal.show} onHide={handleCancel} backdrop="static" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar alteração</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Tem certeza que deseja desmarcar o passo <strong>{modal.campo}</strong> do pedido{' '}
                    <strong>{modal.pedido?.numero}</strong> do(a) cliente <strong>{modal.pedido?.cliente}</strong>?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCancel}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={handleConfirm}>
                        Desmarcar
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal
                show={previewModal.show}
                onHide={() => setPreviewModal({ show: false, pedido: null })}
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Visualização do Pedido</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {previewModal.pedido && (
                        <Row>
                            <Col md={6}>
                                <h5>Informações</h5>
                                <p><strong>O.S:</strong> {previewModal.pedido.numero}</p>
                                <p><strong>Cliente:</strong> {previewModal.pedido.cliente}</p>

                                <p><strong>Data de Entrada:</strong> {previewModal.pedido.data_entrada}</p>

                                <p><strong>Data de Entrega:</strong> {previewModal.pedido.data_entrega}</p>
                                <p><strong>Status:</strong> {previewModal.pedido.status}</p>
                                <p><strong>Prioridade:</strong> {previewModal.pedido.prioridade ? 'ALTA' : 'NORMAL'}</p>
                            </Col>
                            <Col md={6}>

                                <h5>Ficha do Pedido</h5>
                                <img
                                    src="https://via.placeholder.com/400x300?text=Ficha+do+Pedido"
                                    alt="Ficha do Pedido"
                                    className="img-fluid rounded shadow"
                                />
                            </Col>
                        </Row>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setPreviewModal({ show: false, pedido: null })}>
                        Fechar
                    </Button>
                </Modal.Footer>
            </Modal>

            <Row className="mb-3">
                <Col md={4}>
                    <Card className="p-3 text-center shadow-sm">
                        <h6>Total de Pedidos</h6>
                        <h3>{totalPedidos}</h3>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="p-3 text-center shadow-sm bg-warning-subtle">
                        <h6>Pedidos Pendentes</h6>
                        <h3>{pendentes}</h3>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="p-3 text-center shadow-sm bg-danger-subtle">
                        <h6>Pedidos Prioritários</h6>
                        <h3>{prioridades}</h3>
                    </Card>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col md={9}>
                    <Form.Control
                        type="text"
                        placeholder="Buscar por número ou cliente..."
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                    />
                </Col>
                <Col md={3}>
                    <Button variant="primary" onClick={() => navigate('/orders')}>
                        Novo Pedido
                    </Button>
                </Col>
            </Row>

            <Card className="shadow-sm">
                <Card.Body>
                    <h5 className="mb-3">Últimos Pedidos</h5>
                    <Table hover responsive>
                        <thead className="table-light">
                            <tr>
                                <th>O.S</th>
                                <th>Cliente</th>
                                <th>Data Entrega</th>
                                <th>Status</th>
                                <th>Prioridade</th>
                                <th>Financeiro</th>
                                <th>Sublimação</th>
                                <th>Costura</th>
                                <th>Expedição</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidosFiltrados.map((pedido, index) => (
                                <tr key={index}>
                                    <td>{pedido.numero}</td>
                                    <td>{pedido.cliente}</td>
                                    <td>{pedido.data_entrega}</td>
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
                                    <td>
                                        <Form.Check
                                            type="checkbox"
                                            checked={pedido.financeiro}
                                            onChange={() => toggleStatus(index, 'financeiro')}
                                        />
                                    </td>
                                    <td>
                                        <Form.Check
                                            type="checkbox"
                                            checked={pedido.sublimação}
                                            onChange={() => toggleStatus(index, 'sublimação')}
                                        />
                                    </td>
                                    <td>
                                        <Form.Check
                                            type="checkbox"
                                            checked={pedido.costura}
                                            onChange={() => toggleStatus(index, 'costura')}
                                        />
                                    </td>
                                    <td>
                                        <Form.Check
                                            type="checkbox"
                                            checked={pedido.expedicao}
                                            onChange={() => toggleStatus(index, 'expedicao')}
                                        />
                                    </td>
                                    <td>
                                        <Button
                                            size="sm"
                                            variant="info"
                                            onClick={() => setPreviewModal({ show: true, pedido })}
                                        >
                                            Visualizar
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Home;
