import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, Card } from 'react-bootstrap';
import FormOrder from '../components/FormOrder';

const CreateOrder = () => {
    const [formData, setFormData] = useState({
        numeroPedido: '',
        nomeCliente: '',
        telefoneCliente: '',
        dataEntrada: '',
        dataEntrega: '',
        cidadeCliente: '',
        observacao: '',
        items: []
    });

    const [clientesSugeridos, setClientesSugeridos] = useState([]);

    useEffect(() => {
        const generateOrderId = () => `ORD-${Math.floor(Math.random() * 100000)}`;
        setFormData((prev) => ({ ...prev, numeroPedido: generateOrderId() }));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleNomeClienteChange = async (e) => {
        const valor = e.target.value;
        setFormData((prev) => ({ ...prev, nomeCliente: valor }));

        if (valor.length > 1) {
            try {
                const response = await fetch(`http://localhost:5000/api/clientes?search=${valor}`);
                const data = await response.json();
                setClientesSugeridos(data);
            } catch (error) {
                console.error('Erro ao buscar clientes:', error);
            }
        }
    };

    const handleClienteSelecionado = (e) => {
        const nomeSelecionado = e.target.value;
        const cliente = clientesSugeridos.find(c => c.name === nomeSelecionado);
        if (cliente) {
            setFormData((prev) => ({
                ...prev,
                nomeCliente: cliente.name,
                telefoneCliente: cliente.phone,
                cidadeCliente: cliente.city,
            }));
        }
    };

    const addItem = (item) => {
        setFormData((prev) => ({
            ...prev,
            items: [...prev.items, item]
        }));
    };

    const removeItem = (index) => {
        setFormData((prev) => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/pedidos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert('Pedido salvo com sucesso!');
                setFormData({
                    numeroPedido: `ORD-${Math.floor(Math.random() * 100000)}`,
                    nomeCliente: '',
                    telefoneCliente: '',
                    dataEntrada: '',
                    dataEntrega: '',
                    cidadeCliente: '',
                    observacao: '',
                    items: []
                });
            } else {
                alert('Erro ao salvar pedido!');
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            alert('Erro ao conectar com o servidor!');
        }
    };

    return (
        <>
            <Card className="p-3">
                <Form onSubmit={handleSubmit}>
                    <Row className="mb-3">
                        <Col md={2}>
                            <Form.Group controlId="numeroPedido">
                                <Form.Control
                                    type="text"
                                    name="numeroPedido"
                                    value={formData.numeroPedido}
                                    readOnly
                                    placeholder="Id do Pedido"
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group controlId="nomeCliente">
                                <Form.Control
                                    type="text"
                                    name="nomeCliente"
                                    value={formData.nomeCliente}
                                    onChange={handleNomeClienteChange}
                                    onBlur={handleClienteSelecionado}
                                    list="sugestoesClientes"
                                    placeholder="Digite o nome do cliente"
                                    required
                                />
                                <datalist id="sugestoesClientes">
                                    {clientesSugeridos.map((cliente) => (
                                        <option key={cliente.id} value={cliente.name} />
                                    ))}
                                </datalist>
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group controlId="telefoneCliente">
                                <Form.Control
                                    type="tel"
                                    name="telefoneCliente"
                                    value={formData.telefoneCliente}
                                    onChange={handleChange}
                                    placeholder="(00) 00000-0000"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={3}>
                            <Form.Group controlId="dataEntrada">
                                <Form.Label>Data de Entrada</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="dataEntrada"
                                    value={formData.dataEntrada}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group controlId="dataEntrega">
                                <Form.Label>Data de Entrega</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="dataEntrega"
                                    value={formData.dataEntrega}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group controlId="cidadeCliente">
                                <Form.Label>Cidade do Cliente</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="cidadeCliente"
                                    value={formData.cidadeCliente}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group controlId="observacao">
                                <Form.Control
                                    as="textarea"
                                    rows={1}
                                    name="observacao"
                                    value={formData.observacao}
                                    onChange={handleChange}
                                    placeholder="Informações adicionais sobre o pedido..."
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-4">
                        <Col md={2}>
                            <Button variant="primary" type="submit">
                                Salvar Pedido
                            </Button>
                        </Col>
                        <Col md={2}>
                            <Button variant="secondary" type="reset">
                                Cancelar
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Card>
            <Card>
                <FormOrder items={formData.items} addItem={addItem} removeItem={removeItem} />
            </Card>
        </>
    );
};

export default CreateOrder;
