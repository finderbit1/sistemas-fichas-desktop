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
import { 
    ClipboardData, 
    Clock, 
    ExclamationTriangle, 
    Plus,
    Search,
    Eye,
    CheckCircle,
    XCircle
} from 'react-bootstrap-icons';
import { getAllPedidos } from '../services/api';
import Tooltip from '../components/Tooltip';
import '../styles/home.css';


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
        <div style={{ padding: 0 }}>
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
                <Modal.Header closeButton className="modal-header">
                    <Modal.Title className="modal-title">Confirmar alteração</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-body confirmation-modal">
                    <ExclamationTriangle size={24} className="confirmation-icon" />
                    <div className="confirmation-text">
                    Tem certeza que deseja desmarcar o passo <strong>{modal.campo}</strong> do pedido{' '}
                    <strong>{modal.pedido?.numero}</strong> do(a) cliente <strong>{modal.pedido?.cliente}</strong>?
                    </div>
                </Modal.Body>
                <Modal.Footer className="modal-footer">
                    <Button variant="secondary" onClick={handleCancel} className="btn btn-secondary">
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={handleConfirm} className="btn btn-error">
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
                <Modal.Header closeButton className="modal-header">
                    <Modal.Title className="modal-title">Visualização do Pedido</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-body">
                    {previewModal.pedido && (
                        <Row>
                            <Col md={6}>
                                <div className="dashboard-card" style={{ marginBottom: '16px' }}>
                                    <div className="dashboard-card-header">
                                        <h6 className="dashboard-card-title">Informações do Pedido</h6>
                                        <ClipboardData className="dashboard-card-icon" />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div>
                                            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)' }}>O.S:</span>
                                            <p style={{ margin: '4px 0 0 0', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)' }}>
                                                {previewModal.pedido.numero}
                                            </p>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)' }}>Cliente:</span>
                                            <p style={{ margin: '4px 0 0 0', fontWeight: 'var(--font-weight-medium)' }}>
                                                {previewModal.pedido.cliente}
                                            </p>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)' }}>Data de Entrada:</span>
                                            <p style={{ margin: '4px 0 0 0' }}>{previewModal.pedido.data_entrada}</p>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)' }}>Data de Entrega:</span>
                                            <p style={{ margin: '4px 0 0 0' }}>{previewModal.pedido.data_entrega}</p>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)' }}>Status:</span>
                                            <div style={{ marginTop: '4px' }}>
                                                <span className={`badge ${previewModal.pedido.status === 'pendente' ? 'badge-warning' : 'badge-success'}`}>
                                                    {previewModal.pedido.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)' }}>Prioridade:</span>
                                            <div style={{ marginTop: '4px' }}>
                                                {previewModal.pedido.prioridade ? (
                                                    <span className="badge badge-error">ALTA</span>
                                                ) : (
                                                    <span className="badge badge-neutral">NORMAL</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className="dashboard-card">
                                    <div className="dashboard-card-header">
                                        <h6 className="dashboard-card-title">Ficha do Pedido</h6>
                                    </div>
                                    <div style={{ 
                                        background: 'var(--color-neutral-100)', 
                                        borderRadius: 'var(--border-radius)',
                                        padding: '24px',
                                        textAlign: 'center',
                                        border: '2px dashed var(--color-neutral-300)'
                                    }}>
                                        <img
                                            src="https://via.placeholder.com/300x200?text=Ficha+do+Pedido"
                                    alt="Ficha do Pedido"
                                            style={{ 
                                                maxWidth: '100%', 
                                                height: 'auto',
                                                borderRadius: 'var(--border-radius)',
                                                boxShadow: 'var(--shadow-sm)'
                                            }}
                                        />
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    )}
                </Modal.Body>
                <Modal.Footer className="modal-footer">
                    <Button variant="secondary" onClick={() => setPreviewModal({ show: false, pedido: null })} className="btn btn-secondary">
                        Fechar
                    </Button>
                </Modal.Footer>
            </Modal>

            <Row className="mb-4">
                <Col md={4}>
                    <div className="dashboard-card">
                        <div className="dashboard-card-header">
                            <h6 className="dashboard-card-title">Total de Pedidos</h6>
                            <ClipboardData className="dashboard-card-icon" />
                        </div>
                        <h3 className="dashboard-card-value">{totalPedidos}</h3>
                        <p className="dashboard-card-subtitle">Todos os pedidos cadastrados</p>
                    </div>
                </Col>
                <Col md={4}>
                    <div className="dashboard-card">
                        <div className="dashboard-card-header">
                            <h6 className="dashboard-card-title">Pedidos Pendentes</h6>
                            <Clock className="dashboard-card-icon" style={{ color: 'var(--color-warning)' }} />
                        </div>
                        <h3 className="dashboard-card-value" style={{ color: 'var(--color-warning)' }}>{pendentes}</h3>
                        <p className="dashboard-card-subtitle">Aguardando processamento</p>
                    </div>
                </Col>
                <Col md={4}>
                    <div className="dashboard-card">
                        <div className="dashboard-card-header">
                            <h6 className="dashboard-card-title">Pedidos Prioritários</h6>
                            <ExclamationTriangle className="dashboard-card-icon" style={{ color: 'var(--color-error)' }} />
                        </div>
                        <h3 className="dashboard-card-value" style={{ color: 'var(--color-error)' }}>{prioridades}</h3>
                        <p className="dashboard-card-subtitle">Requerem atenção imediata</p>
                    </div>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col md={9}>
                    <div className="search-input-container">
                        <Search size={16} className="search-icon" />
                    <Form.Control
                        type="text"
                        placeholder="Buscar por número ou cliente..."
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                            className="form-control"
                    />
                    </div>
                </Col>
                <Col md={3}>
                    <Button 
                        variant="primary" 
                        onClick={() => navigate('/orders')}
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                    >
                        <Plus size={16} style={{ marginRight: '8px' }} />
                        Novo Pedido
                    </Button>
                </Col>
            </Row>

            <div className="dashboard-card">
                <div className="dashboard-card-header">
                    <h5 className="dashboard-card-title">Últimos Pedidos</h5>
                </div>
                <div className="table-container">
                    <Table hover responsive className="table">
                        <thead>
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
                                    <td>
                                        <span style={{ 
                                            fontFamily: 'var(--font-family-mono)', 
                                            fontWeight: 'var(--font-weight-semibold)',
                                            color: 'var(--color-primary)'
                                        }}>
                                            {pedido.numero}
                                        </span>
                                    </td>
                                    <td>{pedido.cliente}</td>
                                    <td>{pedido.data_entrega}</td>
                                    <td>
                                        <span className={`badge ${pedido.status === 'pendente' ? 'badge-warning' : 'badge-success'}`}>
                                            {pedido.status}
                                        </span>
                                    </td>
                                    <td>
                                        {pedido.prioridade ? (
                                            <span className="badge badge-error">Alta</span>
                                        ) : (
                                            <span className="badge badge-neutral">Normal</span>
                                        )}
                                    </td>
                                    <td>
                                        <Tooltip content={pedido.financeiro ? "Financeiro aprovado" : "Financeiro pendente"} position="top">
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                {pedido.financeiro ? (
                                                    <CheckCircle size={20} style={{ color: 'var(--color-success)' }} />
                                                ) : (
                                                    <XCircle size={20} style={{ color: 'var(--color-neutral-300)' }} />
                                                )}
                                            </div>
                                        </Tooltip>
                                    </td>
                                    <td>
                                        <Tooltip content={pedido.sublimação ? "Sublimação concluída" : "Sublimação pendente"} position="top">
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                {pedido.sublimação ? (
                                                    <CheckCircle size={20} style={{ color: 'var(--color-success)' }} />
                                                ) : (
                                                    <XCircle size={20} style={{ color: 'var(--color-neutral-300)' }} />
                                                )}
                                            </div>
                                        </Tooltip>
                                    </td>
                                    <td>
                                        <Tooltip content={pedido.costura ? "Costura concluída" : "Costura pendente"} position="top">
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                {pedido.costura ? (
                                                    <CheckCircle size={20} style={{ color: 'var(--color-success)' }} />
                                                ) : (
                                                    <XCircle size={20} style={{ color: 'var(--color-neutral-300)' }} />
                                                )}
                                            </div>
                                        </Tooltip>
                                    </td>
                                    <td>
                                        <Tooltip content={pedido.expedicao ? "Expedição concluída" : "Expedição pendente"} position="top">
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                {pedido.expedicao ? (
                                                    <CheckCircle size={20} style={{ color: 'var(--color-success)' }} />
                                                ) : (
                                                    <XCircle size={20} style={{ color: 'var(--color-neutral-300)' }} />
                                                )}
                                            </div>
                                        </Tooltip>
                                    </td>
                                    <td>
                                        <Tooltip content="Visualizar detalhes do pedido" position="top">
                                            <button
                                            onClick={() => setPreviewModal({ show: true, pedido })}
                                                className="action-button btn-outline"
                                            >
                                                <Eye size={14} />
                                                Ver
                                            </button>
                                        </Tooltip>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>
        </div>
    );
};

export default Home;
